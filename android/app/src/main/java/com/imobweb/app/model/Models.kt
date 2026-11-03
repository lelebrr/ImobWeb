package com.imobweb.app.model

import androidx.room.ColumnInfo
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
    val syncedAt: Long? = null,
    /** ENTRADA, SAIDA ou PERIODICA */
    @ColumnInfo(defaultValue = "ENTRADA") val tipoVistoria: String = TipoVistoria.ENTRADA,
    /** Vistoria de saída: id local da vistoria de entrada que a originou */
    val linkedId: Long? = null,
    /** Vistoria de saída: id no servidor da vistoria de entrada */
    val linkedRemoteId: String? = null,
    @ColumnInfo(defaultValue = "{}") val medidores: Medidores = Medidores(),
    /** Leituras da vistoria de entrada (copiadas ao criar a saída) para calcular o consumo */
    val medidoresEntrada: Medidores? = null,
    @ColumnInfo(defaultValue = "[]") val chaves: List<ChaveItem> = emptyList(),
    @ColumnInfo(defaultValue = "{}") val signatures: Signatures = Signatures()
)

// ---------------------------------------------------------------- vistoria: extras

object TipoVistoria {
    const val ENTRADA = "ENTRADA"
    const val SAIDA = "SAIDA"
    const val PERIODICA = "PERIODICA"
    val ALL = listOf(ENTRADA, SAIDA, PERIODICA)

    fun label(tipo: String): String = when (tipo) {
        SAIDA -> "Saída"
        PERIODICA -> "Periódica"
        else -> "Entrada"
    }
}

/** Leitura de um medidor (texto livre, aceita "1.234,5" ou "1234.5"). */
data class Medidor(val numero: String = "", val leitura: String = "")

data class Medidores(
    val agua: Medidor = Medidor(),
    val luz: Medidor = Medidor(),
    val gas: Medidor = Medidor()
) {
    fun get(key: String): Medidor = when (key) { "agua" -> agua; "luz" -> luz; else -> gas }
    fun with(key: String, m: Medidor): Medidores = when (key) {
        "agua" -> copy(agua = m); "luz" -> copy(luz = m); else -> copy(gas = m)
    }
    fun hasAnyReading(): Boolean = listOf(agua, luz, gas).any { (it.leitura ?: "").isNotBlank() || (it.numero ?: "").isNotBlank() }

    companion object {
        /** chave, rótulo, unidade */
        val DEFS = listOf(Triple("agua", "Água", "m³"), Triple("luz", "Energia", "kWh"), Triple("gas", "Gás", "m³"))

        /** "1.234,5" ou "1234.5" → número; vazio/ inválido → null */
        fun parseReading(v: String?): Double? {
            val t = v?.trim()?.replace(Regex("\\s"), "") ?: return null
            if (t.isEmpty()) return null
            val br = Regex("^\\d{1,3}(\\.\\d{3})*(,\\d+)?$")
            val plain = Regex("^\\d+([.,]\\d+)?$")
            if (!br.matches(t) && !plain.matches(t)) return null
            // "1.260" é mil duzentos e sessenta (ponto de milhar), não 1,26
            val thousands = Regex("^\\d{1,3}(\\.\\d{3})+(,\\d+)?$")
            val n = if (t.contains(',') || thousands.matches(t)) t.replace(".", "").replace(',', '.').toDoubleOrNull() else t.toDoubleOrNull()
            return n?.takeIf { it.isFinite() }
        }

        /** consumo = saída − entrada (null se faltar leitura ou se a saída for menor) */
        fun consumption(entrada: String?, saida: String?): Double? {
            val a = parseReading(entrada) ?: return null
            val b = parseReading(saida) ?: return null
            if (b < a) return null
            return Math.round((b - a) * 1000) / 1000.0
        }
    }
}

data class ChaveItem(
    val id: String = java.util.UUID.randomUUID().toString(),
    val descricao: String = "",
    val quantidade: Int = 1
) {
    companion object {
        val PRESETS = listOf(
            "Chave da porta principal", "Chave de serviço", "Controle do portão", "Tag / cartão de acesso",
            "Chave da caixa de correio", "Controle do ar-condicionado", "Chave do portão da garagem"
        )
    }
}

/** Assinaturas desenhadas na tela, como data URL PNG. */
data class Signatures(
    val locadora: String? = null,
    val locatario: String? = null,
    val vistoriadora: String? = null
) {
    fun count(): Int = listOf(locadora, locatario, vistoriadora).count { !it.isNullOrBlank() }
}

/** Estado de conservação por elemento do cômodo (mesmos itens e estados do sistema web). */
object Checklist {
    val ITEMS = listOf(
        "Paredes", "Pintura", "Teto", "Piso", "Rodapé", "Portas", "Janelas", "Elétrica (tomadas/interruptores)",
        "Iluminação", "Hidráulica (torneiras/registros)", "Louças e metais", "Armários / bancadas"
    )
    /** id → rótulo */
    val STATES = listOf("ok" to "Bom", "regular" to "Regular", "ruim" to "Ruim", "na" to "N/A")
    fun label(state: String?): String = STATES.firstOrNull { it.first == state }?.second ?: "—"
    fun rank(state: String?): Int = when (state) { "ok" -> 0; "regular" -> 1; "ruim" -> 2; else -> -1 }
}

data class RoomData(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String = "",
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
    val items: List<String> = emptyList(),
    val photos: List<PhotoData> = emptyList(),
    val analyzing: Boolean = false,
    val analyzed: Boolean = false,
    /** elemento (Checklist.ITEMS) → ok | regular | ruim | na */
    val checklist: Map<String, String> = emptyMap(),
    /** observações livres do cômodo */
    val observations: String = ""
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
    val updatedAt: Long = System.currentTimeMillis(),
    val tipoVistoria: String? = null,
    val linkedRemoteId: String? = null,
    val medidores: Medidores? = null,
    val medidoresEntrada: Medidores? = null,
    val chaves: List<ChaveItem>? = null,
    val signatures: Signatures? = null
)
data class SyncRoomData(
    val id: String = "",
    val name: String = "",
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
    val items: List<String> = emptyList(),
    val photos: List<SyncPhotoData> = emptyList(),
    val checklist: Map<String, String>? = null,
    val observations: String? = null
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
