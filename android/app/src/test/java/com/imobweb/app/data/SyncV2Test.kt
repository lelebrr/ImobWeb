package com.imobweb.app.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.imobweb.app.data.api.ApiService
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.data.repository.SessionManager
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import okio.Buffer
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.security.MessageDigest

/**
 * Servidor falso com o comportamento das rotas novas: conflito (409), organização na
 * lista, fotos endereçadas por hash (R2) e exclusões feitas em outro lugar.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], application = android.app.Application::class)
class SyncV2Test {
    private lateinit var server: MockWebServer
    private lateinit var db: AppDatabase
    private lateinit var session: SessionManager
    private lateinit var repo: VistoriaRepository
    private lateinit var context: Context

    /** "Banco" do servidor: remoteId → (updatedAt, json completo) */
    private val store = linkedMapOf<String, Pair<Long, String>>()
    private val r2 = mutableMapOf<String, ByteArray>()
    private var clock = 1000L
    private var photoApi = true
    private val posts = mutableListOf<String>()

    private fun sha(b: ByteArray) = MessageDigest.getInstance("SHA-256").digest(b).joinToString("") { "%02x".format(it) }

    @Before
    fun setUp() = runBlocking {
        server = MockWebServer()
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path.orEmpty()
                return when {
                    path == "/api/auth/login" -> MockResponse()
                        .addHeader("Set-Cookie", "imobweb_token=tok-cookie; Path=/; HttpOnly; SameSite=lax")
                        .setBody("""{"success":true,"user":{"id":"u9","email":"a@b.c","user_metadata":{"organizationId":"ORG1"}},"role":"ADMIN"}""")
                    path == "/api/admin/vistoria/photos/check" -> {
                        if (!photoApi) return MockResponse().setResponseCode(404)
                        val keys = Regex("\"(vistoria/[^\"]+)\"").findAll(request.body.readUtf8()).map { it.groupValues[1] }.toList()
                        val missing = keys.filter { it !in r2 }.joinToString(",") { "\"$it\"" }
                        MockResponse().setBody("""{"success":true,"missing":[$missing]}""")
                    }
                    path == "/api/admin/vistoria/photos" -> {
                        val bytes = request.body.readByteArray()
                        val key = "vistoria/ORG1/${sha(bytes)}.png"
                        r2[key] = bytes
                        MockResponse().setBody("""{"success":true,"key":"$key"}""")
                    }
                    path.startsWith("/api/admin/vistoria/photos/") -> {
                        val key = path.removePrefix("/api/admin/vistoria/photos/")
                        r2[key]?.let { MockResponse().setBody(Buffer().write(it)) } ?: MockResponse().setResponseCode(404)
                    }
                    path.startsWith("/api/admin/vistoria/sync") && request.method == "POST" -> {
                        val body = request.body.readUtf8()
                        posts += body
                        val rid = Regex("\"remoteId\":\"([^\"]+)\"").find(body)?.groupValues?.get(1) ?: "R${store.size + 1}"
                        val base = Regex("\"baseUpdatedAt\":(\\d+)").find(body)?.groupValues?.get(1)?.toLong()
                        val force = body.contains("\"force\":true")
                        val existing = store[rid]
                        if (existing != null && !force && base != null && existing.first > base + 1000) {
                            return MockResponse().setResponseCode(409).setBody("""{"success":false,"conflict":true,"remoteId":"$rid","error":"conflito"}""")
                        }
                        clock += 10_000
                        val obj = com.google.gson.JsonParser.parseString(body).asJsonObject.getAsJsonObject("vistoria")
                        obj.addProperty("remoteId", rid)
                        obj.addProperty("updatedAt", clock)
                        val v = obj.toString()
                        store[rid] = clock to v
                        MockResponse().setBody("""{"success":true,"remoteId":"$rid","updatedAt":$clock,"error":null}""")
                    }
                    path.startsWith("/api/admin/vistoria/list?id=") -> {
                        val id = path.substringAfter("id=")
                        MockResponse().setBody("""{"success":true,"organizationId":"ORG1","vistorias":[${store[id]?.second ?: ""}]}""")
                    }
                    path.startsWith("/api/admin/vistoria/list") -> {
                        val list = store.map { (id, p) -> """{"remoteId":"$id","condominio":"x","rooms":[],"createdAt":1,"updatedAt":${p.first}}""" }
                        MockResponse().setBody("""{"success":true,"organizationId":"ORG1","vistorias":[${list.joinToString(",")}]}""")
                    }
                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
        server.start()
        context = ApplicationProvider.getApplicationContext()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        session = SessionManager(context)
        session.setBaseUrl(server.url("/").toString())
        session.saveSession("tok", "a@b.c", "u1", "ADMIN", organizationId = "ORG1")
        session.setPhotoApiUnavailable(false)
        ApiService.resetInstance()
        repo = VistoriaRepository(context, db, session)
    }

    @After
    fun tearDown() {
        db.close()
        server.shutdown()
    }

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    private suspend fun newVistoria(nome: String): Long = repo.saveFromEditor(
        Vistoria(condominio = nome, rooms = listOf(RoomData(name = "Sala", photos = listOf(PhotoData(dataUrl = pixel)))))
    )

    @Test
    fun `fotos sobem uma vez para o R2 e o JSON vai so com a chave`() = runBlocking {
        val id = newVistoria("Ed. Foto")
        repo.syncAll()
        assertEquals(1, r2.size)
        val sent = posts.last()
        assertTrue(sent.contains("\"key\":\"vistoria/ORG1/"))
        assertFalse(sent.contains("iVBORw0KGgo"))
        val local = repo.getVistoriaById(id)!!
        assertEquals(SyncStatus.SYNCED, local.status)
        assertEquals("ORG1", local.ownerOrg)
        assertNotNull(local.rooms.single().photos.single().remoteKey)

        // editar um campo: reenvia só o JSON, sem subir a foto de novo
        repo.saveFromEditor(local.copy(condominio = "Ed. Foto 2"))
        repo.syncAll()
        assertEquals(1, r2.size)
        assertFalse(posts.last().contains("iVBORw0KGgo"))
    }

    @Test
    fun `servidor sem rota de fotos envia a foto embutida`() = runBlocking {
        photoApi = false
        newVistoria("Ed. Antigo")
        repo.syncAll()
        assertTrue(posts.last().contains("iVBORw0KGgo"))
        assertTrue(r2.isEmpty())
    }

    @Test
    fun `vistoria baixada com foto no R2 e salva em arquivo`() = runBlocking {
        val bytes = android.util.Base64.decode(pixel.substringAfter(","), android.util.Base64.DEFAULT)
        val key = "vistoria/ORG1/${sha(bytes)}.png"
        r2[key] = bytes
        store["W1"] = 5000L to """{"remoteId":"W1","condominio":"Do web","rooms":[{"id":"a","name":"Sala","photos":[{"id":"p1","key":"$key","name":"f","annotations":[]}]}],"createdAt":1,"updatedAt":5000}"""
        repo.syncAll()
        val v = db.vistoriaDao().getByRemoteId("W1")!!
        val photo = v.rooms.single().photos.single()
        assertEquals(key, photo.remoteKey)
        assertArrayEquals(bytes, java.io.File(photo.filePath!!).readBytes())
    }

    @Test
    fun `edicao nos dois lados vira conflito e o usuario escolhe`() = runBlocking {
        val id = newVistoria("Original")
        repo.syncAll()
        val rid = repo.getVistoriaById(id)!!.remoteId!!

        // alguém altera no web
        clock += 60_000
        store[rid] = clock to store[rid]!!.second.replace("Original", "Do web").replace(Regex("\"updatedAt\":\\d+"), "\"updatedAt\":$clock")
        // e aqui também, antes de sincronizar
        repo.saveFromEditor(repo.getVistoriaById(id)!!.copy(condominio = "Do app"))
        val r = repo.syncAll()
        assertEquals(1, r.conflicts)
        assertEquals(SyncStatus.CONFLICT, repo.getVistoriaById(id)!!.status)
        assertTrue(store[rid]!!.second.contains("Do web")) // nada foi sobrescrito

        // editar de novo não tira do conflito
        repo.saveFromEditor(repo.getVistoriaById(id)!!.copy(consideracoes = "x"))
        assertEquals(SyncStatus.CONFLICT, repo.getVistoriaById(id)!!.status)

        // escolher "manter a minha"
        repo.resolveConflictKeepLocal(id)
        assertTrue(store[rid]!!.second.contains("Do app"))
        assertEquals(SyncStatus.SYNCED, repo.getVistoriaById(id)!!.status)
    }

    @Test
    fun `usar a versao do servidor descarta a local`() = runBlocking {
        val id = newVistoria("Original")
        repo.syncAll()
        val rid = repo.getVistoriaById(id)!!.remoteId!!
        clock += 60_000
        store[rid] = clock to store[rid]!!.second.replace("Original", "Do web").replace(Regex("\"updatedAt\":\\d+"), "\"updatedAt\":$clock")
        repo.saveFromEditor(repo.getVistoriaById(id)!!.copy(condominio = "Do app"))
        repo.syncAll()
        repo.resolveConflictUseServer(id).getOrThrow()
        val v = repo.getVistoriaById(id)!!
        assertEquals("Do web", v.condominio)
        assertEquals(SyncStatus.SYNCED, v.status)
    }

    @Test
    fun `apagada no servidor sai do aparelho, mas so se nao tiver alteracao local`() = runBlocking {
        val a = newVistoria("A")
        val b = newVistoria("B")
        repo.syncAll()
        val ra = repo.getVistoriaById(a)!!.remoteId!!
        val rb = repo.getVistoriaById(b)!!.remoteId!!
        store.remove(ra)
        store.remove(rb)
        repo.saveFromEditor(repo.getVistoriaById(b)!!.copy(condominio = "B editada")) // pendente
        val r = repo.syncAll()
        assertNull(repo.getVistoriaById(a))
        assertEquals(1, r.removedLocally)
        // a pendente foi reenviada (servidor recriou) e continua no aparelho
        assertNotNull(repo.getVistoriaById(b))
    }

    @Test
    fun `vistorias de outra conta ficam no aparelho e nao sobem`() = runBlocking {
        val id = newVistoria("Da conta 1")
        repo.syncAll()
        // entra com outra conta
        session.saveSession("tok2", "x@y.z", "u2", "ADMIN", organizationId = "ORG2")
        ApiService.resetInstance()
        assertEquals(1, repo.countForeign("ORG2"))
        repo.keepForeignLocal("ORG2")
        val before = posts.size
        repo.saveFromEditor(repo.getVistoriaById(id)!!.copy(condominio = "editada"))
        repo.syncAll()
        assertEquals(before, posts.size) // não enviou
        assertNotNull(repo.getVistoriaById(id)) // e não apagou (a lista é de outra conta)

        repo.deleteForeign("ORG2")
        assertNull(repo.getVistoriaById(id))
    }

    @Test
    fun `login em servidor antigo usa o token do cookie`() = runBlocking {
        session.clearSession()
        val r = repo.login("a@b.c", "x")
        assertTrue(r.exceptionOrNull()?.message, r.isSuccess)
        assertEquals("tok-cookie", session.getToken())
        assertEquals("ORG1", session.getOrganizationId())
    }
}
