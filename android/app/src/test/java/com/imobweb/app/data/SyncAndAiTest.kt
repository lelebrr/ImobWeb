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
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.util.concurrent.CopyOnWriteArrayList

/** Conversa do app com um servidor falso que responde como as rotas reais. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], application = android.app.Application::class)
class SyncAndAiTest {
    private lateinit var server: MockWebServer
    private lateinit var db: AppDatabase
    private lateinit var session: SessionManager
    private lateinit var repo: VistoriaRepository
    private val requests = CopyOnWriteArrayList<Pair<RecordedRequest, String>>()
    private var listJson = """{"success":true,"vistorias":[]}"""
    private val fullById = mutableMapOf<String, String>()

    @Before
    fun setUp() = runBlocking {
        server = MockWebServer()
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val body = request.body.readUtf8()
                requests += request to body
                val path = request.path.orEmpty()
                return when {
                    path.startsWith("/api/admin/vistoria/compare") && body.contains("\"mode\":\"summary\"") ->
                        MockResponse().setBody("""{"success":true,"summary":"Resumo geral","attention":["Conferir parede"]}""")
                    path.startsWith("/api/admin/vistoria/compare") ->
                        MockResponse().setBody("""{"success":true,"summary":"Parede com mancha nova","differences":[{"type":"dano_novo","description":"Mancha","severity":"moderada","confidence":0.9},{"type":"xyz","description":"","severity":"?","confidence":5}]}""")
                    path.startsWith("/api/admin/vistoria/sync") && request.method == "POST" -> {
                        // como o servidor real: atualiza o mesmo id quando ele vem no corpo
                        val rid = Regex("\"remoteId\":\"([^\"]+)\"").find(body)?.groupValues?.get(1) ?: "r-new"
                        MockResponse().setBody("""{"success":true,"remoteId":"$rid","updatedAt":5000,"error":null}""")
                    }
                    path.startsWith("/api/admin/vistoria/list?id=") -> {
                        val id = path.substringAfter("id=")
                        MockResponse().setBody("""{"success":true,"vistorias":[${fullById[id]}]}""")
                    }
                    path.startsWith("/api/admin/vistoria/list") -> MockResponse().setBody(listJson)
                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
        server.start()
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        session = SessionManager(context)
        session.setBaseUrl(server.url("/").toString())
        session.saveSession("tok-123", "a@b.c", "u1", "ADMIN")
        session.setGeminiKey("minha-chave")
        ApiService.resetInstance()
        repo = VistoriaRepository(context, db, session)
    }

    @After
    fun tearDown() {
        db.close()
        server.shutdown()
    }

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    @Test
    fun `comparativo com IA usa o servidor com token e chave e normaliza a resposta`() = runBlocking {
        val entrada = Vistoria(id = 1, rooms = listOf(RoomData(name = "Sala", photos = listOf(PhotoData(dataUrl = pixel))), RoomData(name = "Só entrada")))
        val saida = Vistoria(id = 2, tipoVistoria = TipoVistoria.SAIDA, rooms = listOf(RoomData(name = "SALA", damages = listOf("Mancha"))))
        val progress = mutableListOf<Pair<Int, Int>>()
        val ai = repo.compareWithAi(entrada, saida) { d, t -> progress += d to t }.getOrThrow()

        assertEquals(setOf("Sala"), ai.rooms.keys)
        val sala = ai.rooms.getValue("Sala")
        assertEquals("Parede com mancha nova", sala.summary)
        assertEquals(1, sala.differences.size) // a diferença vazia/inválida é descartada
        assertEquals("dano_novo", sala.differences[0].type)
        assertEquals("Resumo geral", ai.summary)
        assertEquals(listOf("Conferir parede"), ai.attention)
        assertEquals(1 to 1, progress.last())

        val roomReq = requests.first { it.first.path!!.contains("compare") }
        assertEquals("Bearer tok-123", roomReq.first.getHeader("Authorization"))
        assertEquals("minha-chave", roomReq.first.getHeader("x-gemini-key"))
        // (o Gson escapa "=" como \u003d; o JSON continua equivalente)
        assertTrue(roomReq.second.contains(pixel.substringAfter(",").trimEnd('=')))
    }

    private fun serverVistoria(rid: String, updatedAt: Long, nome: String) =
        """{"id":0,"remoteId":"$rid","condominio":"$nome","endereco":"Rua X","rooms":[{"id":"a","name":"Sala","furniture":["Sofá"],"checklist":{"Piso":"ruim"},"observations":"web","photos":[{"dataUrl":"$pixel","name":"f","annotations":[]}]}],"createdAt":1,"updatedAt":$updatedAt,"tipoVistoria":"SAIDA","chaves":[{"descricao":"Controle","quantidade":2}],"medidores":{"agua":{"numero":"1","leitura":"10"}}}"""

    @Test
    fun `baixa vistoria nova e depois a alteracao feita no web sem pisar em edicao local`() = runBlocking {
        fullById["r1"] = serverVistoria("r1", 2000, "Criada no web")
        listJson = """{"success":true,"vistorias":[{"remoteId":"r1","condominio":"Criada no web","rooms":[],"createdAt":1,"updatedAt":2000}]}"""
        val r1 = repo.syncAll()
        assertTrue(r1.errors.toString(), r1.errors.isEmpty())
        val local = db.vistoriaDao().getByRemoteId("r1")!!
        assertEquals("Criada no web", local.condominio)
        assertEquals(TipoVistoria.SAIDA, local.tipoVistoria)
        assertEquals("ruim", local.rooms.single().checklist["Piso"])
        assertEquals(2, local.chaves.single().quantidade)
        assertEquals("", local.rooms.single().photos.single().dataUrl)
        assertEquals("synced", local.status)

        // alterada no web depois → app atualiza
        fullById["r1"] = serverVistoria("r1", 3000, "Alterada no web")
        listJson = listJson.replace("2000", "3000")
        repo.syncAll()
        val updated = db.vistoriaDao().getByRemoteId("r1")!!
        assertEquals(local.id, updated.id)
        assertEquals("Alterada no web", updated.condominio)

        // edição local pendente: a versão do servidor não sobrescreve; a local é enviada
        repo.saveFromEditor(updated.copy(condominio = "Editada no app"))
        fullById["r1"] = serverVistoria("r1", 4000, "Outra do web")
        listJson = listJson.replace("3000", "4000")
        repo.syncAll()
        val sent = requests.last { it.first.method == "POST" && it.first.path!!.contains("/sync") }
        assertTrue(sent.second.contains("Editada no app"))
        assertTrue(sent.second.contains("\"remoteId\":\"r1\""))
        assertEquals(1, db.vistoriaDao().getAllOnce().size)
    }
}
