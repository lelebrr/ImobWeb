package com.imobweb.app.util

import android.content.Context
import android.net.Uri
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonToken
import com.google.gson.stream.JsonWriter
import com.imobweb.app.data.local.ModelSanitizer
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Backup das vistorias no MESMO formato do sistema web (`BackupFile` de storage.ts):
 * { app: "imobweb-vistoria", version: 1, exportedAt, laudos: SavedLaudo[] }.
 * O arquivo é escrito e lido em streaming (uma vistoria por vez na memória).
 */
object BackupManager {
    private val gson = com.google.gson.Gson()

    private fun iso(ms: Long): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        .apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date(ms))

    private fun parseIso(s: String?): Long? = s?.let {
        runCatching {
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.parse(it)?.time
        }.getOrNull()
    }

    private fun laudoId(v: Vistoria) = "app-${v.id}-${v.createdAt}"

    /** Exporta todas as vistorias. Retorna quantas foram gravadas. */
    suspend fun export(context: Context, repository: VistoriaRepository, uri: Uri): Int = withContext(Dispatchers.IO) {
        val all = repository.getAllVistorias().first()
        val byId = all.associateBy { it.id }
        val out = context.contentResolver.openOutputStream(uri, "wt") ?: throw Exception("Não foi possível criar o arquivo")
        JsonWriter(OutputStreamWriter(out, Charsets.UTF_8).buffered()).use { w ->
            w.beginObject()
            w.name("app").value("imobweb-vistoria")
            w.name("version").value(1)
            w.name("exportedAt").value(iso(System.currentTimeMillis()))
            w.name("laudos").beginArray()
            for (v in all) writeLaudo(w, v, v.linkedId?.let { byId[it] }?.let { laudoId(it) })
            w.endArray()
            w.endObject()
        }
        all.size
    }

    private fun writeLaudo(w: JsonWriter, v: Vistoria, linked: String?) {
        w.beginObject()
        w.name("id").value(laudoId(v))
        w.name("name").value(v.condominio.ifBlank { v.endereco }.ifBlank { "Vistoria" })
        w.name("condominio").value(v.condominio)
        w.name("savedAt").value(iso(v.updatedAt))
        w.name("createdAt").value(iso(v.createdAt))
        if (linked != null) w.name("linkedId").value(linked)
        if (v.remoteId != null) w.name("remoteId").value(v.remoteId)
        w.name("signatures"); gson.toJson(gson.toJsonTree(v.signatures), w)
        w.name("propertyInfo"); gson.toJson(propertyInfo(v), w)
        w.name("rooms").beginArray()
        for (r in v.rooms) {
            w.beginObject()
            w.name("id").value(r.id)
            w.name("name").value(r.name)
            w.name("items"); gson.toJson(gson.toJsonTree(r.items), w)
            w.name("furniture"); gson.toJson(gson.toJsonTree(r.furniture), w)
            // o web não tem "problemas": entram como avarias e voltam separados para o app
            w.name("damages"); gson.toJson(gson.toJsonTree((r.damages + r.problems).distinct()), w)
            w.name("appProblems"); gson.toJson(gson.toJsonTree(r.problems), w)
            w.name("checklist"); gson.toJson(gson.toJsonTree(r.checklist), w)
            w.name("observations").value(r.observations)
            w.name("analyzing").value(false)
            w.name("analyzed").value(r.analyzed)
            w.name("photos").beginArray()
            for (p in r.photos) {
                val data = PhotoStore.toDataUrl(p) ?: continue
                w.beginObject()
                w.name("id").value(p.id)
                w.name("name").value(p.name)
                w.name("dataUrl").value(data)
                w.name("annotations"); gson.toJson(gson.toJsonTree(p.annotations), w)
                w.endObject()
            }
            w.endArray()
            w.endObject()
        }
        w.endArray()
        w.endObject()
    }

    private fun propertyInfo(v: Vistoria): JsonObject = JsonObject().apply {
        listOf(
            "condominio" to v.condominio, "endereco" to v.endereco, "numero" to v.numero, "conjApto" to v.conjApto,
            "apto" to "", "andar" to v.andar, "cep" to v.cep, "bairro" to v.bairro, "cidade" to v.cidade, "estado" to v.estado,
            "tipoImovel" to v.tipoImovel, "finalidade" to v.finalidade, "metragem" to v.metragem, "mobiliado" to v.mobiliado,
            "locadora" to v.locadora, "locadoraCpf" to v.locadoraCpf, "locadoraTelefone" to v.locadoraTelefone,
            "locatario" to v.locatario, "locatarioCpf" to v.locatarioCpf, "locatarioTelefone" to v.locatarioTelefone,
            "vistoriadora" to v.vistoriadora, "dataFotografia" to v.dataFotografia, "dataLaudo" to v.dataLaudo,
            "solicitante" to v.solicitante, "consideracoes" to v.consideracoes, "tipoVistoria" to v.tipoVistoria,
            "emailContestacao" to v.emailContestacao
        ).forEach { (k, value) -> addProperty(k, value) }
        addProperty("totalComodos", v.rooms.size)
        if (v.medidores.hasAnyReading()) add("medidores", gson.toJsonTree(v.medidores))
        v.medidoresEntrada?.let { add("medidoresEntrada", gson.toJsonTree(it)) }
        add("chaves", gson.toJsonTree(v.chaves))
        add("reparos", gson.toJsonTree(v.reparos))
    }

    /** Importa um backup do app ou do web. Retorna quantas vistorias foram adicionadas. */
    suspend fun import(context: Context, repository: VistoriaRepository, uri: Uri): Int = withContext(Dispatchers.IO) {
        val input = context.contentResolver.openInputStream(uri) ?: throw Exception("Não foi possível abrir o arquivo")
        var imported = 0
        var validFile = false
        val idMap = mutableMapOf<String, Long>()        // id do laudo no arquivo → id local
        val links = mutableListOf<Pair<Long, String>>()  // (id local da saída, id do laudo de entrada)
        JsonReader(InputStreamReader(input, Charsets.UTF_8).buffered()).use { r ->
            r.beginObject()
            while (r.hasNext()) {
                when (r.nextName()) {
                    "app" -> validFile = r.nextString() == "imobweb-vistoria"
                    "laudos" -> {
                        if (r.peek() != JsonToken.BEGIN_ARRAY) { r.skipValue(); continue }
                        r.beginArray()
                        while (r.hasNext()) {
                            val el = JsonParser.parseReader(r)
                            val laudo = runCatching { el.asJsonObject }.getOrNull() ?: continue
                            if (laudo.get("isExample")?.asBoolean == true) continue
                            val v = toVistoria(context, laudo) ?: continue
                            val localId = repository.importVistoria(v) ?: continue
                            imported++
                            laudo.str("id")?.let { idMap[it] = localId }
                            laudo.str("linkedId")?.let { links += localId to it }
                        }
                        r.endArray()
                    }
                    else -> r.skipValue()
                }
            }
            r.endObject()
        }
        if (!validFile) throw Exception("Arquivo de backup inválido")
        links.forEach { (saida, entradaKey) -> idMap[entradaKey]?.let { repository.setLinked(saida, it) } }
        imported
    }

    private fun JsonObject.str(k: String): String? = get(k)?.takeIf { it.isJsonPrimitive }?.asString
    private fun JsonObject.list(k: String): List<String> =
        (get(k) as? JsonArray)?.mapNotNull { runCatching { it.asString }.getOrNull() } ?: emptyList()

    private fun toVistoria(context: Context, l: JsonObject): Vistoria? {
        val info = l.getAsJsonObject("propertyInfo") ?: return null
        fun s(k: String) = info.str(k).orEmpty()
        val rooms = (l.get("rooms") as? JsonArray)?.mapNotNull { el ->
            val r = runCatching { el.asJsonObject }.getOrNull() ?: return@mapNotNull null
            val problems = r.list("appProblems")
            RoomData(
                id = r.str("id") ?: java.util.UUID.randomUUID().toString(),
                name = r.str("name").orEmpty(),
                items = r.list("items"),
                furniture = r.list("furniture"),
                damages = r.list("damages").filter { it !in problems },
                problems = problems,
                checklist = (r.get("checklist") as? JsonObject)?.entrySet()?.associate { it.key to it.value.asString }.orEmpty(),
                observations = r.str("observations").orEmpty(),
                analyzed = r.get("analyzed")?.asBoolean ?: false,
                photos = (r.get("photos") as? JsonArray)?.mapNotNull { pe ->
                    val p = runCatching { pe.asJsonObject }.getOrNull() ?: return@mapNotNull null
                    val data = p.str("dataUrl") ?: return@mapNotNull null
                    val file = PhotoStore.fromDataUrl(context, data) ?: return@mapNotNull null
                    PhotoData(
                        id = p.str("id") ?: java.util.UUID.randomUUID().toString(),
                        name = p.str("name").orEmpty(),
                        filePath = file.absolutePath,
                        annotations = (p.get("annotations") as? JsonArray)?.mapNotNull { a ->
                            runCatching { gson.fromJson(a, PhotoAnnotation::class.java) }.getOrNull()
                        }.orEmpty().map { it.copy(label = it.label ?: "") }
                    )
                }.orEmpty()
            )
        }.orEmpty()
        fun <T> tree(e: JsonElement?, c: Class<T>): T? = e?.let { runCatching { gson.fromJson(it, c) }.getOrNull() }
        val created = parseIso(l.str("createdAt")) ?: System.currentTimeMillis()
        val saved = parseIso(l.str("savedAt")) ?: created
        val remoteId = l.str("remoteId")
        return Vistoria(
            remoteId = remoteId,
            condominio = s("condominio"), endereco = s("endereco"), numero = s("numero"), conjApto = s("conjApto"),
            andar = s("andar"), cep = s("cep"), bairro = s("bairro"), cidade = s("cidade"), estado = s("estado"),
            tipoImovel = s("tipoImovel"), finalidade = s("finalidade"), metragem = s("metragem"), mobiliado = s("mobiliado"),
            locadora = s("locadora"), locadoraCpf = s("locadoraCpf"), locadoraTelefone = s("locadoraTelefone"),
            locatario = s("locatario"), locatarioCpf = s("locatarioCpf"), locatarioTelefone = s("locatarioTelefone"),
            vistoriadora = s("vistoriadora"), dataFotografia = s("dataFotografia"), dataLaudo = s("dataLaudo"),
            solicitante = s("solicitante"), consideracoes = s("consideracoes"), emailContestacao = s("emailContestacao"),
            tipoVistoria = s("tipoVistoria").takeIf { it in TipoVistoria.ALL } ?: TipoVistoria.ENTRADA,
            medidores = ModelSanitizer.medidores(tree(info.get("medidores"), Medidores::class.java)),
            medidoresEntrada = tree(info.get("medidoresEntrada"), Medidores::class.java)?.let { ModelSanitizer.medidores(it) },
            chaves = (info.get("chaves") as? JsonArray)?.mapNotNull { tree(it, ChaveItem::class.java) }.orEmpty().map { ModelSanitizer.chave(it) },
            reparos = (info.get("reparos") as? JsonArray)?.mapNotNull { tree(it, Reparo::class.java) }.orEmpty().map { ModelSanitizer.reparo(it) },
            signatures = tree(l.get("signatures"), Signatures::class.java) ?: Signatures(),
            rooms = rooms,
            createdAt = created,
            updatedAt = saved,
            // com cópia no servidor: a próxima sincronização traz a versão mais nova de lá
            status = if (remoteId != null) SyncStatus.SYNCED else SyncStatus.PENDING,
            syncedAt = if (remoteId != null) 0L else null
        )
    }
}
