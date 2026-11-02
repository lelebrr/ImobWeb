package com.imobweb.app.util

import com.imobweb.app.model.PhotoAnnotation
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
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
}
