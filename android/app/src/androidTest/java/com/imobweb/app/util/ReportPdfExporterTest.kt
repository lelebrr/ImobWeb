package com.imobweb.app.util

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.imobweb.app.model.PhotoAnnotation
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ReportPdfExporterTest {

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    @Test
    fun geraPdfComPaginasEMultiplasFotos() = runBlocking {
        kotlinx.coroutines.withTimeout(60_000) {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val rooms = (1..6).map { index ->
            RoomData(
                name = "CÔMODO $index",
                damages = listOf("Avaria de teste $index"),
                problems = listOf("Problema de teste $index"),
                photos = listOf(
                    PhotoData(
                        dataUrl = pixel,
                        name = "Foto $index",
                        annotations = listOf(PhotoAnnotation(30.0, 40.0, "Marcação $index"))
                    )
                )
            )
        }
        val vistoria = Vistoria(
            condominio = "Edifício Teste",
            endereco = "Rua de Teste",
            numero = "10",
            bairro = "Centro",
            cidade = "São Paulo",
            estado = "SP",
            locadora = "Locadora Teste",
            locatario = "Locatário Teste",
            vistoriadora = "Vistoriadora Teste",
            dataLaudo = "02/11/2026",
            consideracoes = "Laudo de teste automatizado.",
            rooms = rooms
        )

        val pdf = ReportPdfExporter.exportLaudo(context, vistoria)

        assertTrue("PDF não foi criado", pdf.exists())
        assertTrue("PDF muito pequeno: ${pdf.length()} bytes", pdf.length() > 5_000)
        val header = String(pdf.readBytes().copyOfRange(0, 4), Charsets.US_ASCII)
        assertEquals("%PDF", header)

        val content = String(pdf.readBytes(), Charsets.ISO_8859_1)
        assertTrue("PDF sem páginas", content.contains("/Type /Page"))
        assertTrue("PDF deveria ter mais de uma página para 6 cômodos e fotos",
            Regex("/Type /Page[^s]").findAll(content).count() >= 2)
        }
    }
}
