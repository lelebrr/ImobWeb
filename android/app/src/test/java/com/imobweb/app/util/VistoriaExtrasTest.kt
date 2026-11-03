package com.imobweb.app.util

import com.imobweb.app.model.*
import org.junit.Assert.*
import org.junit.Test

class VistoriaExtrasTest {

    @Test
    fun `le leituras no formato brasileiro e simples`() {
        assertEquals(1234.5, Medidores.parseReading("1.234,5")!!, 0.0001)
        assertEquals(1234.5, Medidores.parseReading("1234.5")!!, 0.0001)
        assertEquals(42.0, Medidores.parseReading(" 42 ")!!, 0.0001)
        assertEquals(1260.0, Medidores.parseReading("1.260")!!, 0.0001)
        assertEquals(1.5, Medidores.parseReading("1.5")!!, 0.0001)
        assertEquals(55.5, Medidores.consumption("1.204,5", "1.260")!!, 0.0001)
        assertNull(Medidores.parseReading(""))
        assertNull(Medidores.parseReading("abc"))
    }

    @Test
    fun `consumo e saida menos entrada e nulo quando a saida e menor`() {
        assertEquals(15.5, Medidores.consumption("100", "115,5")!!, 0.0001)
        assertNull(Medidores.consumption("200", "100"))
        assertNull(Medidores.consumption("", "100"))
    }

    private fun entrada() = Vistoria(
        id = 1, tipoVistoria = TipoVistoria.ENTRADA, condominio = "Ed. Sol", dataLaudo = "01/01/2026",
        medidores = Medidores(agua = Medidor("A1", "100"), luz = Medidor("L1", "5000")),
        chaves = listOf(ChaveItem(descricao = "Chave da porta principal", quantidade = 2), ChaveItem(descricao = "Controle do portão", quantidade = 1)),
        rooms = listOf(
            RoomData(name = "Sala", furniture = listOf("Sofá", "TV"), damages = listOf("Risco no piso"),
                checklist = mapOf("Paredes" to "ok", "Piso" to "regular")),
            RoomData(name = "Cozinha", furniture = listOf("Fogão"), checklist = mapOf("Paredes" to "ok")),
            RoomData(name = "Varanda")
        )
    )

    private fun saida() = Vistoria(
        id = 2, tipoVistoria = TipoVistoria.SAIDA, linkedId = 1, dataLaudo = "01/12/2026",
        medidoresEntrada = Medidores(agua = Medidor("A1", "100"), luz = Medidor("L1", "5000")),
        medidores = Medidores(agua = Medidor("A1", "130,5"), luz = Medidor("L1", "4000")),
        chaves = listOf(ChaveItem(descricao = "chave da porta PRINCIPAL", quantidade = 1), ChaveItem(descricao = "Controle do portão", quantidade = 1)),
        rooms = listOf(
            RoomData(name = "SALA", furniture = listOf("sofa"), damages = listOf("Risco no piso", "Parede manchada"),
                checklist = mapOf("Paredes" to "ruim", "Piso" to "ok"), observations = "Marcas de móveis"),
            RoomData(name = "Cozinha", furniture = listOf("Fogão"), checklist = mapOf("Paredes" to "ok")),
            RoomData(name = "Quarto extra")
        )
    )

    @Test
    fun `compara entrada e saida como o sistema web`() {
        val cmp = CompareBuilder.compare(entrada(), saida())
        val sala = cmp.rooms.first { it.name == "Sala" }
        assertEquals(listOf("Parede manchada"), sala.newDamages)
        assertEquals(listOf("TV"), sala.missingFurniture) // "Sofá" casa com "sofa" (sem acento/caixa)
        assertEquals(CompareBuilder.Status.PIOROU, sala.status)
        assertTrue(sala.checklist.first { it.item == "Paredes" }.worsened)
        assertTrue(sala.checklist.first { it.item == "Piso" }.improved)

        assertEquals(CompareBuilder.Status.SEM_ALTERACAO, cmp.rooms.first { it.name == "Cozinha" }.status)
        assertEquals(CompareBuilder.Status.SEM_SAIDA, cmp.rooms.first { it.name == "Varanda" }.status)
        assertEquals(CompareBuilder.Status.NOVO, cmp.rooms.first { it.name == "Quarto extra" }.status)

        assertEquals(1, cmp.totals.newDamages)
        assertEquals(1, cmp.totals.roomsWithIssues)
        assertEquals(30.5, cmp.meters.first { it.label == "Água" }.consumo!!, 0.0001)
        assertNull(cmp.meters.first { it.label == "Energia" }.consumo)
        assertEquals(1, cmp.missingKeys)

        val html = CompareBuilder.buildHtml(entrada(), saida(), cmp)
        assertTrue(html.contains("Parede manchada"))
        assertTrue(html.contains("Deterioração identificada"))
        assertTrue(html.contains("Marcas de móveis"))
    }

    @Test
    fun `laudo inclui tipo checklist observacoes medidores chaves e assinaturas`() {
        val sig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        val html = LaudoHtmlBuilder.build(saida().copy(signatures = Signatures(locatario = sig, locadora = "javascript:alert(1)")))
        assertTrue(html.contains("TERMO DE VISTORIA DE SAÍDA"))
        assertTrue(html.contains("Estado de conservação"))
        assertTrue(html.contains("cl-ruim"))
        assertTrue(html.contains("Marcas de móveis"))
        assertTrue(html.contains("Leitura dos medidores"))
        assertTrue(html.contains("30,5 m³"))
        assertTrue(html.contains("Controle do portão"))
        assertTrue(html.contains(sig))
        assertFalse(html.contains("javascript:alert(1)"))
    }
}
