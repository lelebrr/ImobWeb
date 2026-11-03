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
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
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
data class LoginResponse(
    val success: Boolean,
    val token: String?,
    val user: UserData?,
    val role: String?,
    val redirectTo: String?,
    val error: String?
)
data class UserData(val id: String, val email: String?, val name: String?)

data class AnalyzeRequest(
    val rooms: List<AnalyzeRoomInput>,
    val propertyType: String,
    val finality: String
)
data class AnalyzeRoomInput(
    val name: String,
    val photos: List<String>,
    val knownFurniture: List<String> = emptyList(),
    val knownDamages: List<String> = emptyList()
)

/** Resultado por cômodo devolvido por POST /api/admin/vistoria/analyze. */
data class AnalyzeRoomResult(
    val items: List<String>? = null,
    val suggestedFurniture: List<String>? = null,
    val suggestedDamages: List<String>? = null,
    val missingShots: List<String>? = null
)
data class AnalyzeResponse(
    val success: Boolean,
    val results: Map<String, AnalyzeRoomResult>?,
    val error: String?
)

// Sync models
data class SyncRequest(
    val vistoria: SyncVistoriaData,
    val userId: String = ""
)
data class SyncVistoriaData(
    val id: Long = 0,
    val remoteId: String? = null,
    val condominio: String = "",
    val endereco: String = "",
    val numero: String = "",
    val conjApto: String = "",
    val cep: String = "",
    val bairro: String = "",
    val cidade: String = "",
    val estado: String = "",
    val tipoImovel: String = "",
    val finalidade: String = "",
    val metragem: String = "",
    val mobiliado: String = "",
    val locadora: String = "",
    val locadoraCpf: String = "",
    val locatario: String = "",
    val locatarioCpf: String = "",
    val vistoriadora: String = "",
    val dataFotografia: String = "",
    val dataLaudo: String = "",
    val solicitante: String = "",
    val consideracoes: String = "",
    val rooms: List<SyncRoomData>,
    val status: String = "synced",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
data class SyncRoomData(
    val id: String = "",
    val name: String = "",
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
    val items: List<String> = emptyList(),
    val photos: List<SyncPhotoData> = emptyList()
)
data class SyncPhotoData(
    val dataUrl: String = "",
    val name: String = "",
    val annotations: List<SyncAnnotationData> = emptyList(),
    val filePath: String? = null
)
data class SyncAnnotationData(
    val x: Double = 0.0,
    val y: Double = 0.0,
    val label: String = ""
)
data class SyncListResponse(val success: Boolean, val vistorias: List<SyncVistoriaData>?, val error: String?)
data class SyncSaveResponse(val success: Boolean, val remoteId: String?, val error: String?)

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
    val problems: List<String> get() = ProblemsCatalog.allProblems
}

object Constants {
    val TIPO_IMOVEL_OPTIONS = listOf("APARTAMENTO", "SALA", "CASA", "COMERCIAL", "COBERTURA", "LOFT", "STUDIO")
    val FINALIDADE_OPTIONS = listOf("RESIDENCIAL", "COMERCIAL")
    val MOBILIADO_OPTIONS = listOf("NÃO", "SIM", "PARCIALMENTE")
    val CONDOMINIO_TYPES = listOf("APARTAMENTO", "COBERTURA", "LOFT")
}

object RoomTemplates {
    data class Template(val name: String, val rooms: List<String>)

    val templates = listOf(
        Template("Apartamento", listOf(
            "ENTRADA", "SALA", "COZINHA", "ÁREA DE SERVIÇO",
            "BANHEIRO SOCIAL", "QUARTO 1", "QUARTO 2", "VARANDA", "GARAGEM"
        )),
        Template("Casa", listOf(
            "ENTRADA", "SALA", "COZINHA", "ÁREA DE SERVIÇO",
            "BANHEIRO SOCIAL", "QUARTO 1", "QUARTO 2", "SUÍTE",
            "VARANDA", "QUINTAL", "GARAGEM", "ESCRITÓRIO"
        )),
        Template("Sala Comercial", listOf(
            "ENTRADA", "SALA PRINCIPAL", "SALA DE REUNIÃO",
            "BANHEIRO", "COPA", "DEPÓSITO"
        )),
        Template("Cobertura", listOf(
            "ENTRADA", "SALA", "COZINHA", "ÁREA DE SERVIÇO",
            "BANHEIRO SOCIAL", "QUARTO 1", "SUÍTE 1", "SUÍTE 2",
            "VARANDA", "TERRAÇO", "PISCINA", "ESCRITÓRIO", "GARAGEM"
        )),
        Template("Studio/Flat", listOf(
            "SALA/QUARTO INTEGRADO", "COZINHA AMERICANA",
            "BANHEIRO"
        )),
        Template("Personalizado", emptyList())
    )
}

object FurnitureItems {
    val items = listOf(
        "Sofá", "Mesa de centro", "Mesa de jantar", "Cadeiras",
        "Armário", "Guarda-roupa", "Cama", "Criado-mudo",
        "Estante", "Escrivaninha", "Cadeira de escritório",
        "TV", "Painel para TV", "Cortinas", "Persianas",
        "Tapete", "Lustre/Luminária", "Ventilador de teto",
        "Ar condicionado", "Fogão", "Geladeira", "Micro-ondas",
        "Lava-louças", "Máquina de lavar", "Aquecedor"
    )
}

object RoomFurnitureCatalog {
    fun getRelevantFurniture(roomName: String): List<String> {
        val upper = roomName.uppercase()
        return when {
            upper.contains("SALA") || upper.contains("ESTAR") || upper.contains("LIVING") || upper.contains("TV") -> listOf(
                "Sofá", "Mesa de centro", "Mesa de jantar", "Cadeiras", "Painel para TV",
                "TV", "Rack", "Aparador", "Cortinas", "Persianas", "Tapete",
                "Lustre/Luminária", "Ar condicionado", "Ventilador de teto", "Poltrona"
            )
            upper.contains("COZINHA") || upper.contains("COPA") -> listOf(
                "Armário planejado", "Fogão/Cooktop", "Geladeira", "Micro-ondas",
                "Coifa/Depurador", "Forno elétrico", "Lava-louças", "Bancada",
                "Gabinete de pia", "Mesa de apoio", "Banquetas", "Filtro/Purificador de água"
            )
            upper.contains("SUÍTE") || upper.contains("SUITE") -> listOf(
                "Cama/Box", "Colchão", "Guarda-roupa/Closet", "Criado-mudo", "Cabeceira",
                "Ar condicionado", "TV", "Cortinas", "Box blindex", "Espelho",
                "Gabinete de banheiro", "Chuveiro/Ducha", "Ducha higiênica"
            )
            upper.contains("QUARTO") || upper.contains("DORMITÓRIO") || upper.contains("DORMITORIO") -> listOf(
                "Cama/Box", "Colchão", "Guarda-roupa", "Criado-mudo", "Cabeceira",
                "Painel para TV", "TV", "Ar condicionado", "Cortinas", "Persianas",
                "Espelho", "Ventilador de teto", "Escrivaninha"
            )
            upper.contains("BANHEIRO") || upper.contains("LAVABO") || upper.contains("WC") || upper.contains("BANHO") -> listOf(
                "Box blindex", "Espelho", "Gabinete de pia", "Chuveiro/Ducha",
                "Ducha higiênica", "Porta-toalha", "Assento sanitário", "Papeleira",
                "Prateleira", "Armário aéreo"
            )
            upper.contains("SERVIÇO") || upper.contains("SERVICO") || upper.contains("LAVANDERIA") -> listOf(
                "Máquina de lavar", "Secadora", "Tanque", "Varal de teto",
                "Armário de serviço", "Aquecedor a gás", "Tábua de passar"
            )
            upper.contains("VARANDA") || upper.contains("SACADA") || upper.contains("GOURMET") || upper.contains("TERRAÇO") || upper.contains("TERRACO") -> listOf(
                "Mesa de varanda", "Cadeiras/Banquetas", "Churrasqueira", "Pia",
                "Bancada de granito", "Fechamento de vidro", "Armário externo", "Sofá externo"
            )
            upper.contains("ESCRITÓRIO") || upper.contains("ESCRITORIO") || upper.contains("OFFICE") || upper.contains("ESTUDO") -> listOf(
                "Mesa/Escrivaninha", "Cadeira de escritório", "Estante de livros",
                "Gaveteiro", "Computador/Monitor", "Ar condicionado", "Cortinas"
            )
            upper.contains("ENTRADA") || upper.contains("HALL") || upper.contains("CORREDOR") || upper.contains("ACESSO") -> listOf(
                "Aparador", "Espelho", "Interfone", "Campainha", "Fechadura digital",
                "Sapateira", "Lustre/Luminária", "Cabideiro"
            )
            upper.contains("GARAGEM") || upper.contains("VAGA") || upper.contains("ESTACIONAMENTO") -> listOf(
                "Controle do portão", "Armário de garagem", "Vaga demarcada",
                "Tomada para carro elétrico", "Lixeira"
            )
            upper.contains("DEPÓSITO") || upper.contains("DEPOSITO") || upper.contains("DESPENSA") -> listOf(
                "Prateleiras", "Armário multiuso", "Estante de aço"
            )
            else -> FurnitureItems.items
        }
    }
}

object ProblemsCatalog {
    data class ProblemCategory(val name: String, val problems: List<String>)

    val categories = listOf(
        ProblemCategory("Paredes e Tetos", listOf(
            "Rachadura na parede", "Trinca no teto", "Pintura descascando",
            "Mancha de umidade", "Infiltração", "Mofo", "Bolor",
            "Reboco solto", "Furo na parede", "Desnível na parede"
        )),
        ProblemCategory("Pisos e Rodapés", listOf(
            "Desgaste no piso", "Piso solto", "Piso riscado",
            "Cerâmica quebrada", "Porcelanato trincado", "Rodapé solto",
            "Rodapé danificado", "Desnível no piso", "Mancha no piso"
        )),
        ProblemCategory("Portas e Janelas", listOf(
            "Porta com desajuste", "Porta arranhada", "Porta amassada",
            "Maçaneta solta", "Fechadura com defeito", "Janela emperrando",
            "Janela com vidro trincado", "Vedação comprometida",
            "Persiana quebrada", "Cortina danificada"
        )),
        ProblemCategory("Instalações Elétricas", listOf(
            "Tomada com defeito", "Interruptor com defeito",
            "Fio exposto", "Quadro de luz danificado",
            "Lâmpada queimada", "Disjuntor desarmando"
        )),
        ProblemCategory("Hidráulica e Metais", listOf(
            "Vazamento", "Torneira pingando", "Registro com defeito",
            "Caixa acoplada com defeito", "Vaso trincado",
            "Pia trincada", "Sifão vazando", "Ralo entupido",
            "Chuveiro com defeito", "Pressão baixa", "Metais oxidados",
            "Louça quebrada", "Espelho danificado"
        )),
        ProblemCategory("Geral / Diversos", listOf(
            "Mofo", "Barulho", "Mau cheiro", "Problema no interfone",
            "Campainha quebrada", "Vaga de garagem inadequada",
            "Armário danificado", "Banco danificado", "Serragem/trincas"
        ))
    )

    val allProblems: List<String> by lazy { categories.flatMap { it.problems } }
}

object ObservationTemplates {
    val templates = listOf(
        "Imóvel em bom estado de conservação",
        "Pintura recente em todas as paredes",
        "Parte hidráulica em perfeito funcionamento",
        "Instalações elétricas em perfeito funcionamento",
        "Imóvel possui armários planejados na cozinha",
        "Imóvel possui armários embutidos nos quartos",
        "Janelas com vidros temperados e persianas",
        "Piso em porcelanato em todos os ambientes"
    )
}
