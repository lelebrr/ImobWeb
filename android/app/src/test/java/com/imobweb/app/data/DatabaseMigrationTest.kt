package com.imobweb.app.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.test.core.app.ApplicationProvider
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.model.TipoVistoria
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

/**
 * Abre com a versão atual um banco criado pela versão 1 do app (fotos em base64
 * dentro do JSON) e confere que nada se perde: fotos viram arquivos e os campos
 * novos recebem os valores padrão.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], application = android.app.Application::class)
class DatabaseMigrationTest {

    private val v1Schema = "CREATE TABLE IF NOT EXISTS `vistorias` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `remoteId` TEXT, " +
        "`condominio` TEXT NOT NULL, `endereco` TEXT NOT NULL, `numero` TEXT NOT NULL, `conjApto` TEXT NOT NULL, `cep` TEXT NOT NULL, " +
        "`bairro` TEXT NOT NULL, `cidade` TEXT NOT NULL, `estado` TEXT NOT NULL, `tipoImovel` TEXT NOT NULL, `finalidade` TEXT NOT NULL, " +
        "`metragem` TEXT NOT NULL, `mobiliado` TEXT NOT NULL, `locadora` TEXT NOT NULL, `locadoraCpf` TEXT NOT NULL, `locatario` TEXT NOT NULL, " +
        "`locatarioCpf` TEXT NOT NULL, `vistoriadora` TEXT NOT NULL, `dataFotografia` TEXT NOT NULL, `dataLaudo` TEXT NOT NULL, " +
        "`solicitante` TEXT NOT NULL, `consideracoes` TEXT NOT NULL, `rooms` TEXT NOT NULL, `status` TEXT NOT NULL, " +
        "`createdAt` INTEGER NOT NULL, `updatedAt` INTEGER NOT NULL, `syncedAt` INTEGER)"

    @Test
    fun `migra banco da versao 1 sem perder dados`() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val dbFile = context.getDatabasePath("imobweb_database")
        dbFile.parentFile?.mkdirs()

        // Foto "grande" em base64 (~3 MB no total) como a versão 1 gravava
        val bytes = ByteArray(750_000) { (it % 251).toByte() }
        val big = "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(bytes)
        val photos = (1..3).joinToString(",") { """{"dataUrl":"$big","name":"f$it","annotations":[{"x":10.0,"y":20.0,"label":"risco"}]}""" }
        // uma foto corrompida (base64 inválido) também não pode travar a migração
        val corrupt = "data:image/jpeg;base64,@@@" + "A".repeat(1_200_000)
        val roomsJson = """[{"id":"r1","name":"SALA","furniture":["Sofá"],"damages":[],"problems":[],"items":[],"photos":[$photos,{"dataUrl":"$corrupt","name":"ruim","annotations":[]}],"analyzing":true,"analyzed":false}]"""

        SQLiteDatabase.openOrCreateDatabase(dbFile, null).use { db ->
            db.execSQL(v1Schema)
            db.insert("vistorias", null, ContentValues().apply {
                listOf("condominio", "endereco", "numero", "conjApto", "cep", "bairro", "cidade", "estado", "tipoImovel",
                    "finalidade", "metragem", "mobiliado", "locadora", "locadoraCpf", "locatario", "locatarioCpf",
                    "vistoriadora", "dataFotografia", "dataLaudo", "solicitante", "consideracoes").forEach { put(it, "") }
                put("condominio", "Edifício Antigo")
                put("rooms", roomsJson)
                put("status", "synced")
                put("createdAt", 1L)
                put("updatedAt", 2L)
            })
            db.version = 1
        }

        val db = AppDatabase.getInstance(context)
        val all = db.vistoriaDao().getAllOnce()
        assertEquals(1, all.size)
        val v = all.first()
        assertEquals("Edifício Antigo", v.condominio)
        assertEquals(TipoVistoria.ENTRADA, v.tipoVistoria)
        assertTrue(v.chaves.isEmpty())
        assertFalse(v.medidores.hasAnyReading())
        assertNull(v.linkedId)

        val room = v.rooms.single()
        assertFalse(room.analyzing)
        assertTrue(room.checklist.isEmpty())
        assertEquals("", room.observations)
        assertEquals(4, room.photos.size)
        assertEquals(bytes.size.toLong(), File(room.photos.first().filePath!!).length())
        room.photos.take(3).forEach { p ->
            assertEquals("", p.dataUrl)
            assertTrue(File(p.filePath!!).exists())
            assertEquals("risco", p.annotations.single().label)
        }
        db.close()
    }
}
