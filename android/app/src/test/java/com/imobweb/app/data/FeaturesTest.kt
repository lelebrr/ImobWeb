package com.imobweb.app.data

import android.content.Context
import android.net.Uri
import androidx.lifecycle.SavedStateHandle
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.data.repository.SessionManager
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import com.imobweb.app.ui.vistoria.VistoriaEditorViewModel
import com.imobweb.app.util.BackupManager
import com.imobweb.app.util.Inspection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.test.StandardTestDispatcher
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows
import org.robolectric.annotation.Config
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], application = android.app.Application::class)
class FeaturesTest {
    private lateinit var context: Context
    private lateinit var db: AppDatabase
    private lateinit var repo: VistoriaRepository

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        repo = VistoriaRepository(context, db, SessionManager(context))
    }

    @After
    fun tearDown() = db.close()

    private fun sample() = Vistoria(
        condominio = "Ed. Backup", locadora = "Maria", locatario = "João", andar = "7º",
        locadoraTelefone = "(11) 99999-0000", emailContestacao = "c@imob.com",
        tipoVistoria = TipoVistoria.ENTRADA,
        medidores = Medidores(agua = Medidor("A1", "10")),
        chaves = listOf(ChaveItem(descricao = "Chave", quantidade = 2)),
        reparos = listOf(Reparo(comodo = "Sala", descricao = "Pintura", min = 300.0, max = 500.0, origem = "ia")),
        signatures = Signatures(locadora = pixel),
        rooms = listOf(RoomData(name = "Sala", furniture = listOf("Sofá"), damages = listOf("Risco"), problems = listOf("Tomada"),
            checklist = mapOf("Piso" to "ok"), observations = "obs",
            photos = listOf(PhotoData(dataUrl = pixel, name = "f", annotations = listOf(PhotoAnnotation(10.0, 20.0, "a"))))))
    )

    @Test
    fun `backup no formato do web ida e volta sem perder nada`() = runBlocking {
        val entradaId = repo.saveFromEditor(sample())
        val saidaId = repo.createExitFrom(entradaId)
        val file = File(context.cacheDir, "bk.json")
        val uri = Uri.fromFile(file)
        assertEquals(2, BackupManager.export(context, repo, uri))
        val json = file.readText()
        assertTrue(json.startsWith("{\"app\":\"imobweb-vistoria\""))
        assertTrue(json.contains("\"locadoraTelefone\":\"(11) 99999-0000\""))
        assertTrue(json.contains("\"damages\":[\"Risco\",\"Tomada\"]")) // web enxerga problemas como avarias

        // importa num aparelho "limpo"
        val db2 = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        val repo2 = VistoriaRepository(context, db2, SessionManager(context))
        assertEquals(2, BackupManager.import(context, repo2, uri))
        val all = db2.vistoriaDao().getAllOnce()
        val e = all.first { it.tipoVistoria == TipoVistoria.ENTRADA }
        val s = all.first { it.tipoVistoria == TipoVistoria.SAIDA }
        assertEquals("7º", e.andar)
        assertEquals(listOf("Risco"), e.rooms[0].damages)
        assertEquals(listOf("Tomada"), e.rooms[0].problems)
        assertEquals(500.0, e.reparos.single().max, 0.0)
        assertEquals(pixel, e.signatures.locadora)
        assertTrue(File(e.rooms[0].photos.single().filePath!!).exists())
        assertEquals("a", e.rooms[0].photos.single().annotations.single().label)
        assertEquals(e.id, s.linkedId) // vínculo entrada/saída refeito
        // importar de novo não duplica
        assertEquals(0, BackupManager.import(context, repo2, uri))
        db2.close()
    }

    @Test
    fun `duplicar copia fotos e solta vinculos`() = runBlocking {
        val id = repo.saveFromEditor(sample())
        val copyId = repo.duplicate(id)
        val orig = repo.getVistoriaById(id)!!
        val copy = repo.getVistoriaById(copyId)!!
        assertEquals("Ed. Backup (cópia)", copy.condominio)
        assertNull(copy.remoteId)
        assertEquals(0, copy.signatures.count())
        assertNotEquals(orig.rooms[0].photos[0].filePath, copy.rooms[0].photos[0].filePath)
        assertTrue(File(copy.rooms[0].photos[0].filePath!!).exists())
    }

    @Test
    fun `aceitar sugestoes aplica so as marcadas e marca a avaria na foto`() {
        val photo = PhotoData(id = "p1", filePath = "/x.jpg")
        val room = RoomData(name = "Sala", furniture = listOf("Sofá"), photos = listOf(photo))
        val insp = PhotoInspection(
            objects = listOf(DetectedObject("sofa", "movel", "bom", 0.9), DetectedObject("Mesa", "movel", "bom", 0.9), DetectedObject("Parede", "estrutura", "bom", 0.9)),
            defects = listOf(
                DetectedDefect("risco", "leve", "no tampo da mesa", "Mesa", 0.9, DetectedBox(10.0, 10.0, 20.0, 20.0)),
                DetectedDefect("mancha", "moderada", "na parede", null, 0.6, null),
                DetectedDefect("mofo", "leve", "duvidoso", null, 0.3, null)
            )
        )
        val proposals = Inspection.proposalsFromInspection(room, "p1", insp)
        assertEquals(listOf("Mesa", "Risco: no tampo da mesa", "Possível mancha: na parede (moderada)"), proposals.map { it.text })
        assertTrue(Inspection.isPreselected(proposals[1]))
        assertFalse(Inspection.isPreselected(proposals[2]))

        val withQueue = room.copy(proposals = proposals)
        val result = Inspection.accept(withQueue, listOf(proposals[0], proposals[1].copy(text = "Risco leve na mesa")), setOf(proposals[1].id), proposals.map { it.id }.toSet())
        assertEquals(listOf("Sofá", "Mesa"), result.furniture)
        assertEquals(listOf("Risco leve na mesa"), result.damages)
        assertEquals(20.0, result.photos[0].annotations.single().x, 0.0)
        assertTrue(result.proposals.isEmpty())
    }

    @Test
    fun `editor no ViewModel carrega e grava pelo id salvo`() = runBlocking {
        val id = repo.saveFromEditor(sample())
        val main = StandardTestDispatcher()
        Dispatchers.setMain(main)
        try {
            val vm = VistoriaEditorViewModel(SavedStateHandle(mapOf("savedId" to id, "step" to 3)), repo, null)
            vm.load(context)
            // a carga alterna entre o Room (IO) e o Main de teste: roda até concluir
            var tries = 0
            while (!vm.loaded && tries++ < 100) { main.scheduler.runCurrent(); Thread.sleep(20) }
            assertTrue(vm.loaded)
            assertEquals(3, vm.currentStep)
            assertEquals("Ed. Backup", vm.condominio)
            assertEquals("7º", vm.andar)
            vm.condominio = "Novo nome"
            vm.saveCurrent()
            assertEquals("Novo nome", repo.getVistoriaById(id)!!.condominio)
            assertEquals(1, db.vistoriaDao().getAllOnce().size)
        } finally {
            Dispatchers.resetMain()
        }
    }
}
