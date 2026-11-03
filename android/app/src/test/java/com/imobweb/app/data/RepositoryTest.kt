package com.imobweb.app.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.data.repository.SessionManager
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], application = android.app.Application::class)
class RepositoryTest {
    private lateinit var db: AppDatabase
    private lateinit var repo: VistoriaRepository

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        repo = VistoriaRepository(context, db, SessionManager(context))
    }

    @After
    fun tearDown() = db.close()

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    @Test
    fun `rascunho gravado duas vezes nao duplica e preserva campos novos`() = runBlocking {
        val draft = Vistoria(
            condominio = "Ed. Lua", tipoVistoria = TipoVistoria.ENTRADA,
            medidores = Medidores(agua = Medidor("A9", "321")),
            chaves = listOf(ChaveItem(descricao = "Chave da porta principal", quantidade = 2)),
            signatures = Signatures(vistoriadora = pixel),
            rooms = listOf(RoomData(name = "Sala", checklist = mapOf("Piso" to "ok"), observations = "ok",
                photos = listOf(PhotoData(dataUrl = pixel, name = "f"))))
        )
        val id1 = repo.saveFromEditor(draft, "k1")
        val id2 = repo.saveFromEditor(draft.copy(condominio = "Ed. Lua 2"), "k1")
        assertEquals(id1, id2)
        assertEquals(1, db.vistoriaDao().getAllOnce().size)

        val saved = repo.getVistoriaById(id1)!!
        assertEquals("Ed. Lua 2", saved.condominio)
        assertEquals("321", saved.medidores.agua.leitura)
        assertEquals(2, saved.chaves.single().quantidade)
        assertEquals(pixel, saved.signatures.vistoriadora)
        assertEquals("ok", saved.rooms.single().checklist["Piso"])
        // foto foi para arquivo
        assertEquals("", saved.rooms.single().photos.single().dataUrl)
        assertNotNull(saved.rooms.single().photos.single().filePath)
    }

    @Test
    fun `cria saida a partir da entrada e mantem o vinculo ao editar`() = runBlocking {
        val entradaId = repo.saveFromEditor(
            Vistoria(
                condominio = "Ed. Sol", locadora = "Maria", locatario = "João",
                medidores = Medidores(luz = Medidor("L1", "5000")),
                chaves = listOf(ChaveItem(descricao = "Controle do portão")),
                signatures = Signatures(locadora = pixel),
                rooms = listOf(RoomData(name = "Sala", furniture = listOf("Sofá"), damages = listOf("Risco"),
                    checklist = mapOf("Piso" to "ok"), photos = listOf(PhotoData(dataUrl = pixel))))
            ), "e"
        )
        val saidaId = repo.createExitFrom(entradaId)
        val saida = repo.getVistoriaById(saidaId)!!
        assertEquals(TipoVistoria.SAIDA, saida.tipoVistoria)
        assertEquals(entradaId, saida.linkedId)
        assertEquals("5000", saida.medidoresEntrada!!.luz.leitura)
        assertFalse(saida.medidores.hasAnyReading())
        assertEquals(0, saida.signatures.count())
        assertEquals(1, saida.chaves.size)
        val room = saida.rooms.single()
        assertEquals(listOf("Sofá"), room.furniture)
        assertTrue(room.damages.isEmpty() && room.photos.isEmpty() && room.checklist.isEmpty())

        // o editor não conhece o vínculo: ao salvar, ele deve ser preservado
        repo.saveFromEditor(saida.copy(linkedId = null, medidoresEntrada = null, consideracoes = "x"))
        val again = repo.getVistoriaById(saidaId)!!
        assertEquals(entradaId, again.linkedId)
        assertNotNull(again.medidoresEntrada)
        assertEquals(entradaId, repo.getEntradaFor(again)!!.id)
        assertEquals(listOf(saidaId), repo.getExitsFor(entradaId).map { it.id })
    }
}
