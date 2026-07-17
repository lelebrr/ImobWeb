package com.imobweb.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.imobweb.app.data.local.Converters

@Entity(tableName = "vistorias")
@TypeConverters(Converters::class)
data class Vistoria(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val remoteId: String? = null,
    val condominio: String = "",
    val endereco: String = "",
    val numero: String = "",
    val conjApto: String = "",
    val cep: String = "",
    val bairro: String = "",
    val cidade: String = "São Paulo",
    val estado: String = "SP",
    val tipoImovel: String = "APARTAMENTO",
    val finalidade: String = "RESIDENCIAL",
    val metragem: String = "",
    val mobiliado: String = "NÃO",
    val locadora: String = "",
    val locadoraCpf: String = "",
    val locatario: String = "",
    val locatarioCpf: String = "",
    val vistoriadora: String = "",
    val dataFotografia: String = "",
    val dataLaudo: String = "",
    val solicitante: String = "",
    val consideracoes: String = "",
    val rooms: List<RoomData> = emptyList(),
    val status: String = "draft", // draft, synced, pending_sync
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncedAt: Long? = null
)

data class RoomData(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String = "",
    val items: List<String> = emptyList(),
    val photos: List<PhotoData> = emptyList(),
    val analyzing: Boolean = false,
    val analyzed: Boolean = false
)

data class PhotoData(
    val dataUrl: String = "",
    val name: String = "",
    val annotations: List<PhotoAnnotation> = emptyList(),
    val filePath: String? = null
)

data class PhotoAnnotation(
    val x: Double = 0.0,
    val y: Double = 0.0,
    val label: String = ""
)

// API Models
data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val success: Boolean, val user: UserData?, val role: String?, val redirectTo: String?, val error: String?)
data class UserData(val id: String, val email: String?)

data class AnalyzeRequest(
    val rooms: List<AnalyzeRoomInput>,
    val propertyType: String,
    val finality: String
)
data class AnalyzeRoomInput(val name: String, val photos: List<String>)
data class AnalyzeResponse(val success: Boolean, val results: Map<String, List<String>>?, val error: String?)

data class PdfGenerateRequest(
    val condominio: String, val endereco: String, val numero: String,
    val conjApto: String, val cep: String, val bairro: String,
    val cidade: String, val estado: String, val tipoImovel: String,
    val finalidade: String, val metragem: String, val mobiliado: String,
    val locadora: String, val locadoraCpf: String, val locatario: String,
    val locatarioCpf: String, val vistoriadora: String, val dataFotografia: String,
    val dataLaudo: String, val solicitante: String, val consideracoes: String,
    val rooms: List<PdfRoomData>
)
data class PdfRoomData(val name: String, val items: List<String>, val photos: List<PdfPhotoData>)
data class PdfPhotoData(val dataUrl: String, val name: String, val annotations: List<PhotoAnnotation>)
data class PdfGenerateResponse(val success: Boolean, val html: String?, val error: String?)

// Photo tips per room
object RoomPhotoTips {
    val tips = mapOf(
        "ENTRADA" to listOf("Porta de entrada e fechadura", "Interfone e campainha", "Piso e rodapé", "Parede e teto", "Quadro de luz"),
        "SALA" to listOf("Parede geral (4 faces)", "Piso e rodapé", "Janelas e persianas", "Teto e luminárias", "Tomadas e interruptores", "Ar condicionado", "Porta de entrada"),
        "SALA DE ESTAR" to listOf("Parede geral (4 faces)", "Piso e rodapé", "Janelas e persianas", "Teto e luminárias", "Tomadas e interruptores"),
        "COZINHA" to listOf("Bancada e pia", "Armários (superior e inferior)", "Torneira e registros", "Piso e parede", "Fogão/forno", "Tomadas e interruptores", "Teto"),
        "ÁREA DE SERVIÇO" to listOf("Pia e torneira", "Registro de água", "Piso e parede", "Linha de roupas", "Tomadas para máquinas"),
        "BANHEIRO" to listOf("Vaso sanitário e caixa acoplada", "Pia e espelho", "Torneira e registros", "Chuveiro/ducha", "Piso e parede", "Louças e metais", "Ventilação"),
        "BANHEIRO SOCIAL" to listOf("Vaso sanitário e caixa acoplada", "Pia e espelho", "Torneira e registros", "Chuveiro/ducha", "Piso e parede"),
        "QUARTO" to listOf("Parede geral (4 faces)", "Piso e rodapé", "Janelas e persianas", "Teto e luminárias", "Tomadas e interruptores", "Armários"),
        "SUÍTE" to listOf("Parede geral (4 faces)", "Piso e rodapé", "Janelas e persianas", "Teto e luminárias", "Tomadas e interruptores", "Armários"),
        "BANHEIRO SUÍTE" to listOf("Vaso sanitário", "Pia e espelho", "Torneira e registros", "Chuveiro/ducha", "Piso e parede"),
        "VARANDA" to listOf("Piso e paredes", "Grade/vidraça", "Teto", "Luminária", "Porta de acesso"),
        "ESCRITÓRIO" to listOf("Parede geral", "Piso e rodapé", "Janelas", "Teto e luminárias", "Tomadas e interruptores"),
        "GARAGEM" to listOf("Piso (concreto/lajota)", "Parede e teto", "Portão", "Iluminação", "Vaga demarcada")
    )

    val defaultTips = listOf("Parede geral (4 faces)", "Piso e rodapé", "Janelas", "Teto e luminárias", "Tomadas e interruptores", "Portas")

    fun getTips(roomName: String): List<String> {
        val upper = roomName.uppercase().trim()
        tips[upper]?.let { return it }
        for ((key, value) in tips) {
            if (upper.contains(key) || key.contains(upper)) return value
        }
        return defaultTips
    }
}

object CommonProblems {
    val problems = listOf(
        "Rachadura na parede", "Mancha de umidade", "Desgaste no piso",
        "Vazamento", "Infiltração", "Pintura descascando", "Furo na parede",
        "Serragem/trincas", "Metais oxidados", "Louça quebrada",
        "Tomada com defeito", "Interruptor com defeito", "Porta com desajuste",
        "Janela emperrando", "Mofo", "Barulho"
    )
}

object Constants {
    val TIPO_IMOVEL_OPTIONS = listOf("APARTAMENTO", "SALA", "CASA", "COMERCIAL", "COBERTURA")
    val FINALIDADE_OPTIONS = listOf("RESIDENCIAL", "COMERCIAL")
    val MOBILIADO_OPTIONS = listOf("NÃO", "SIM", "PARCIALMENTE")
}
