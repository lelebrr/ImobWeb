package com.imobweb.app.util

import com.imobweb.app.model.FurnitureDetail
import com.imobweb.app.model.PhotoAnnotation
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LaudoHtmlBuilderTest {

    private val pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    private fun sample() = Vistoria(
        condominio = "Edifício Aurora",
        endereco = "Rua das Flores",
        numero = "120",
        conjApto = "Apto 42",
        cep = "01001-000",
        bairro = "Centro",
        cidade = "São Paulo",
        estado = "SP",
        tipoImovel = "APARTAMENTO",
        finalidade = "RESIDENCIAL",
        metragem = "68 m²",
        mobiliado = "PARCIALMENTE",
        locadora = "Maria <script>alert(1)</script>",
        locadoraCpf = "123.456.789-00",
        locatario = "João da Silva",
        locatarioCpf = "987.654.321-00",
        vistoriadora = "Ana Souza",
        dataLaudo = "02/11/2026",
        solicitante = "Imobiliária X",
        consideracoes = "Imóvel em bom estado.\nPintura recente.",
        rooms = listOf(
            RoomData(
                name = "SALA",
                furniture = listOf("Sofá", "TV"),
                damages = listOf("Piso riscado"),
                problems = listOf("Tomada com defeito"),
                items = listOf("Parede e teto em bom estado"),
                photos = listOf(
                    PhotoData(
                        dataUrl = pixel,
                        name = "Sala 1",
                        annotations = listOf(PhotoAnnotation(25.0, 75.0, "Risco no piso"))
                    )
                )
            )
        )
    )

    @Test
    fun `gera laudo completo com capa dados comodos fotos e assinaturas`() {
        val html = LaudoHtmlBuilder.build(sample())

        assertTrue(html.contains("Laudo de<br>Vistoria"))
        assertTrue(html.contains("Edifício Aurora"))
        assertTrue(html.contains("SALA"))
        assertTrue(html.contains("Piso riscado"))
        assertTrue(html.contains("Tomada com defeito"))
        assertTrue(html.contains(pixel))
        assertTrue(html.contains("Risco no piso"))
        assertTrue(html.contains("Assinaturas"))
        assertTrue(html.contains("Ana Souza"))
        assertTrue(html.contains("Imóvel em bom estado.<br>Pintura recente."))
    }

    @Test
    fun `escapa html vindo dos campos do usuario`() {
        val html = LaudoHtmlBuilder.build(sample())

        assertFalse(html.contains("<script>alert(1)</script>"))
        assertTrue(html.contains("&lt;script&gt;alert(1)&lt;/script&gt;"))
    }

    @Test
    fun `funciona com vistoria vazia`() {
        val html = LaudoHtmlBuilder.build(Vistoria())

        assertTrue(html.contains("Nenhum cômodo registrado"))
        assertTrue(html.contains("Sem considerações adicionais."))
        assertTrue(html.contains("</html>"))
    }

    @Test
    fun `ignora fonte de imagem invalida`() {
        val html = LaudoHtmlBuilder.build(
            Vistoria(
                rooms = listOf(
                    RoomData(
                        name = "QUARTO",
                        photos = listOf(PhotoData(dataUrl = "javascript:alert(1)", name = "x"))
                    )
                )
            )
        )

        assertFalse(html.contains("javascript:alert(1)"))
    }

    @Test
    fun `renderiza os 8 templates distintos e tabela detalhada de moveis`() {
        assertEquals(8, PdfTemplateCatalog.presets.size)

        val v = sample().copy(
            rooms = listOf(
                RoomData(
                    name = "SALA MOBILIADA",
                    furniture = listOf("Sofá 3 lugares"),
                    furnitureDetails = listOf(
                        FurnitureDetail(
                            name = "Sofá 3 lugares",
                            category = "Mobília",
                            brandModel = "Tok&Stok Cinza",
                            quantity = 1,
                            condition = "otimo",
                            working = "na",
                            notes = "Sem manchas"
                        )
                    ),
                    photos = listOf(
                        PhotoData(
                            dataUrl = pixel,
                            name = "Sofá 3 lugares",
                            furnitureTag = "Sofá 3 lugares",
                            caption = "Vista frontal",
                            timestamp = "15/11/2026 02:00:00"
                        )
                    )
                )
            )
        )

        PdfTemplateCatalog.presets.forEach { preset ->
            val html = LaudoHtmlBuilder.build(v, LaudoOptions(template = preset))
            assertTrue("Preset ${preset.id} deve conter fechamento html", html.contains("</html>"))
            assertTrue("Preset ${preset.id} deve conter cor accent", html.contains(preset.accentHex))
            assertTrue("Preset ${preset.id} deve renderizar tabela de móveis", html.contains("Tok&amp;Stok Cinza"))
            assertTrue("Preset ${preset.id} deve exibir etiqueta do móvel na foto", html.contains("[Sofá 3 lugares]"))
        }

        val judicialHtml = LaudoHtmlBuilder.build(v, LaudoOptions(template = PdfTemplateCatalog.presets[1]))
        assertTrue(judicialHtml.contains("cover-judicial"))
        assertTrue(judicialHtml.contains("TESTEMUNHA 1"))

        val compactHtml = LaudoHtmlBuilder.build(v, LaudoOptions(template = PdfTemplateCatalog.presets[3]))
        assertTrue(compactHtml.contains("compact-banner"))
        assertFalse(compactHtml.contains("class=\"cover\""))

        val overviewHtml = LaudoHtmlBuilder.build(v, LaudoOptions(template = PdfTemplateCatalog.presets[6]))
        assertTrue(overviewHtml.contains("Quadro geral de conservação por cômodo"))
    }

    @Test
    fun `template personalizado numero 9 oculta secoes desmarcadas e aplica colunas`() {
        val custom = PdfTemplateCatalog.defaultCustomTemplate().copy(
            accentHex = "#059669",
            customHeaderTitle = "Laudo Sob Medida",
            customFooterText = "Vistoria VIP",
            showCover = true,
            showLegalPreamble = false,
            showCriteriaBox = false,
            showPhotos = true,
            photosPerRow = 4,
            showWitnesses = true
        )
        val html = LaudoHtmlBuilder.build(sample(), LaudoOptions(template = custom))

        assertTrue(html.contains("Laudo Sob Medida"))
        assertTrue(html.contains("Vistoria VIP"))
        assertTrue(html.contains("repeat(4, 1fr)"))
        assertTrue(html.contains("TESTEMUNHA 2"))
        assertFalse(html.contains("Lei nº 8.245/91"))
        assertFalse(html.contains("Critérios de avaliação"))
    }
}
