package com.imobweb.app.data.repository

import android.content.Context
import com.imobweb.app.data.api.ApiService
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.model.*
import com.imobweb.app.util.AiInspectionResult
import com.imobweb.app.util.GeminiDirectService
import com.imobweb.app.util.PhotoStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

/** Erro de autenticação (token ausente, expirado ou recusado pelo servidor). */
class AuthExpiredException : Exception("Sessão expirada. Entre novamente em Configurações ⚙️ para sincronizar e usar a IA do servidor.")

class VistoriaRepository(
    private val context: Context,
    private val database: AppDatabase,
    private val sessionManager: SessionManager
) {
    private val dao = database.vistoriaDao()

    /** Serializa gravações locais (autosave, "Próximo", saída da tela). */
    private val writeMutex = Mutex()

    /** Evita duas sincronizações simultâneas (Worker + tela). */
    private val syncMutex = Mutex()

    // ------------------------------------------------------------------ leitura

    fun getAllVistorias(): Flow<List<Vistoria>> = dao.getAllVistorias()

    fun getPendingSyncCount(): Flow<Int> = dao.getPendingSyncCount()

    suspend fun getVistoriaById(id: Long): Vistoria? = dao.getVistoriaById(id)

    suspend fun getBaseUrl(): String = sessionManager.getBaseUrl()

    suspend fun setBaseUrl(url: String) {
        sessionManager.setBaseUrl(url)
        ApiService.resetInstance()
    }

    suspend fun getGeminiKey(): String? = sessionManager.getGeminiKey()

    suspend fun setGeminiKey(key: String) = sessionManager.setGeminiKey(key)

    suspend fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()

    suspend fun getUserEmail(): String? = sessionManager.getEmail()

    // ------------------------------------------------------------------ gravação

    /**
     * Grava a vistoria vinda do editor. Preserva o que o editor não controla
     * (remoteId, createdAt, syncedAt) e marca como pendente de sincronização.
     * Retorna o id local.
     */
    suspend fun saveFromEditor(draft: Vistoria, draftKey: String? = null): Long = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            val rooms = PhotoStore.persisted(context, draft.rooms).map { it.copy(analyzing = false) }
            // Um rascunho novo gravado duas vezes (autosave + saída) não pode virar dois registros
            val knownId = if (draft.id > 0) draft.id else draftKey?.let { draftIds[it] } ?: 0L
            val existing = if (knownId > 0) dao.getVistoriaById(knownId) else null
            val now = System.currentTimeMillis()
            if (existing != null) {
                val updated = draft.copy(
                    id = existing.id,
                    remoteId = existing.remoteId,
                    createdAt = existing.createdAt,
                    syncedAt = existing.syncedAt,
                    // vínculo entrada/saída não é editado no formulário
                    linkedId = existing.linkedId,
                    linkedRemoteId = existing.linkedRemoteId,
                    medidoresEntrada = existing.medidoresEntrada,
                    ownerOrg = existing.ownerOrg,
                    rooms = rooms,
                    // em conflito continua em conflito até o usuário escolher qual versão manter
                    status = if (existing.status == SyncStatus.CONFLICT) SyncStatus.CONFLICT else SyncStatus.PENDING,
                    updatedAt = now
                )
                if (updated.copy(updatedAt = existing.updatedAt, status = existing.status) == existing) {
                    existing.id // nada mudou: não marca como pendente nem reenvia
                } else {
                    dao.updateVistoria(updated)
                    // Fotos que saíram da vistoria
                    PhotoStore.deleteFiles(existing, keep = rooms.flatMap { r -> r.photos.mapNotNull { it.filePath } }.toSet())
                    existing.id
                }
            } else {
                val id = dao.insertVistoria(
                    draft.copy(
                        id = 0, rooms = rooms, status = SyncStatus.PENDING, createdAt = now, updatedAt = now,
                        ownerOrg = sessionManager.getOrganizationId()
                    )
                )
                if (draftKey != null) draftIds[draftKey] = id
                id
            }
        }
    }

    /** Rascunhos novos já gravados nesta execução: chave do editor → id local. */
    private val draftIds = mutableMapOf<String, Long>()

    // ------------------------------------------------------------------ entrada × saída

    /**
     * Cria a vistoria de SAÍDA a partir de uma ENTRADA: copia imóvel, partes, cômodos,
     * móveis e chaves; começa sem fotos, avarias, checklist e assinaturas; guarda as
     * leituras dos medidores da entrada para calcular o consumo. Retorna o id local.
     */
    suspend fun createExitFrom(entradaId: Long): Long = withContext(Dispatchers.IO) {
        val entrada = dao.getVistoriaById(entradaId) ?: throw IllegalArgumentException("Vistoria de entrada não encontrada")
        val hoje = java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale("pt", "BR")).format(java.util.Date())
        val now = System.currentTimeMillis()
        val saida = entrada.copy(
            id = 0,
            remoteId = null,
            tipoVistoria = TipoVistoria.SAIDA,
            linkedId = entrada.id,
            linkedRemoteId = entrada.remoteId,
            dataFotografia = hoje,
            dataLaudo = hoje,
            consideracoes = "",
            medidoresEntrada = entrada.medidores.takeIf { it.hasAnyReading() } ?: entrada.medidoresEntrada,
            medidores = Medidores(),
            signatures = Signatures(),
            rooms = entrada.rooms.map { r ->
                RoomData(
                    name = r.name,
                    furniture = r.furniture
                )
            },
            status = SyncStatus.PENDING,
            createdAt = now,
            updatedAt = now,
            syncedAt = null,
            ownerOrg = sessionManager.getOrganizationId() ?: entrada.ownerOrg,
            reparos = emptyList()
        )
        writeMutex.withLock { dao.insertVistoria(saida) }
    }

    /** Insere uma vistoria vinda de backup. Ignora se já existir a mesma (mesmo remoteId ou mesma criação). */
    suspend fun importVistoria(v: Vistoria): Long? = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            val all = dao.getAllOnce()
            val dup = all.any { (v.remoteId != null && it.remoteId == v.remoteId) ||
                (it.createdAt == v.createdAt && it.condominio == v.condominio && it.endereco == v.endereco) }
            if (dup) {
                PhotoStore.deleteFiles(v)
                null
            } else dao.insertVistoria(v.copy(id = 0))
        }
    }

    suspend fun setLinked(saidaId: Long, entradaId: Long) = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            dao.getVistoriaById(saidaId)?.let { dao.updateVistoria(it.copy(linkedId = entradaId)) }
        }
    }

    /** Duplica a vistoria (com cópia das fotos), como um laudo novo e independente. */
    suspend fun duplicate(id: Long): Long = withContext(Dispatchers.IO) {
        val v = dao.getVistoriaById(id) ?: throw Exception("Vistoria não encontrada")
        val now = System.currentTimeMillis()
        val rooms = v.rooms.map { r ->
            r.copy(
                id = java.util.UUID.randomUUID().toString(),
                proposals = emptyList(),
                photos = r.photos.mapNotNull { p ->
                    val src = p.filePath?.let { File(it) }?.takeIf { it.exists() } ?: return@mapNotNull null
                    val dst = File(PhotoStore.dir(context), "foto_${java.util.UUID.randomUUID()}.jpg")
                    src.copyTo(dst)
                    p.copy(id = java.util.UUID.randomUUID().toString(), filePath = dst.absolutePath, dataUrl = "", remoteKey = null)
                }
            )
        }
        writeMutex.withLock {
            dao.insertVistoria(
                v.copy(
                    id = 0, remoteId = null, linkedId = null, linkedRemoteId = null,
                    condominio = if (v.condominio.isNotBlank()) "${v.condominio} (cópia)" else v.condominio,
                    endereco = if (v.condominio.isBlank()) "${v.endereco} (cópia)" else v.endereco,
                    rooms = rooms, signatures = Signatures(), status = SyncStatus.PENDING,
                    createdAt = now, updatedAt = now, syncedAt = null,
                    ownerOrg = sessionManager.getOrganizationId()
                )
            )
        }
    }

    /** Entrada vinculada a uma saída (pelo id local ou, se veio do servidor, pelo remoteId). */
    suspend fun getEntradaFor(saida: Vistoria): Vistoria? {
        saida.linkedId?.let { id -> dao.getVistoriaById(id)?.let { return it } }
        saida.linkedRemoteId?.let { rid -> dao.getByRemoteId(rid)?.let { return it } }
        return null
    }

    suspend fun getExitsFor(entradaId: Long): List<Vistoria> = dao.getExitsFor(entradaId)

    suspend fun deleteVistoria(vistoria: Vistoria) = withContext(Dispatchers.IO) {
        val remoteId = vistoria.remoteId
        if (!remoteId.isNullOrBlank()) {
            // Fica registrado: não volta no próximo pull e a exclusão no servidor é refeita se falhar agora
            sessionManager.markRemoteIdDeleted(remoteId)
            runCatching { deleteRemote(remoteId) }
        }
        writeMutex.withLock {
            val current = dao.getVistoriaById(vistoria.id) ?: vistoria
            dao.deleteVistoriaById(vistoria.id)
            PhotoStore.deleteFiles(current)
        }
    }

    suspend fun deleteVistoriaById(id: Long) {
        dao.getVistoriaById(id)?.let { deleteVistoria(it) }
    }

    /** Apaga todos os laudos do aparelho (não mexe no servidor). */
    suspend fun deleteAllLocal() = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            dao.deleteAll()
            PhotoStore.deleteAll(context)
        }
    }

    /** Remove arquivos de foto que não pertencem a nenhuma vistoria (fotos descartadas no editor). */
    suspend fun cleanupOrphanPhotos() = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            val used = dao.getAllOnce().flatMap { v -> v.rooms.flatMap { r -> r.photos.mapNotNull { it.filePath } } }.toSet()
            val cutoff = System.currentTimeMillis() - 24 * 60 * 60 * 1000L
            PhotoStore.dir(context).listFiles()?.forEach { f ->
                if (f.absolutePath !in used && f.lastModified() < cutoff) f.delete()
            }
            // Temporários de câmera esquecidos
            File(context.cacheDir, "photos").listFiles()?.forEach { f -> if (f.lastModified() < cutoff) f.delete() }
        }
    }

    // ------------------------------------------------------------------ sessão

    suspend fun login(email: String, password: String): Result<LoginResponse> = withContext(Dispatchers.IO) {
        try {
            val api = ApiService.getInstance(sessionManager.getBaseUrl())
            val response = api.login(LoginRequest(email, password))
            val body = response.body()
            if (response.isSuccessful && body != null && body.success) {
                // Servidores mais antigos só devolvem o token no cookie de sessão
                val token = body.token?.takeIf { it.isNotBlank() }
                    ?: response.headers().values("Set-Cookie")
                        .firstNotNullOfOrNull { Regex("""(?:^|;\s*)imobweb_token=([^;]+)""").find(it)?.groupValues?.get(1) }
                if (token.isNullOrBlank()) {
                    return@withContext Result.failure(
                        Exception("O servidor não devolveu o token de acesso. Atualize o servidor (rota /api/auth/login).")
                    )
                }
                sessionManager.saveSession(
                    token = token,
                    email = email,
                    userId = body.user?.id ?: "",
                    role = body.role ?: "BROKER",
                    organizationId = body.user?.user_metadata?.organizationId
                )
                Result.success(body)
            } else {
                val message = when (response.code()) {
                    401 -> "E-mail ou senha incorretos"
                    403 -> "Conta inativa ou bloqueada"
                    else -> body?.error ?: "Erro ${response.code()} ao entrar"
                }
                Result.failure(Exception(message))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Não foi possível conectar ao servidor: ${e.message}"))
        }
    }

    suspend fun logout() {
        sessionManager.clearSession()
        ApiService.resetInstance()
    }

    private suspend fun authedApi(): ApiService {
        val token = sessionManager.getToken()
        if (token.isNullOrBlank()) throw AuthExpiredException()
        return ApiService.getInstance(sessionManager.getBaseUrl(), token)
    }

    private suspend fun onUnauthorized(): Nothing {
        sessionManager.clearToken()
        ApiService.resetInstance()
        throw AuthExpiredException()
    }

    // ------------------------------------------------------------------ IA

    private suspend fun photoPayload(photos: List<PhotoData>, max: Int): List<String> =
        withContext(Dispatchers.IO) { photos.asSequence().mapNotNull { PhotoStore.toDataUrl(it) }.take(max).toList() }

    /** Análise pelo servidor (Gemini do backend). Null quando não há login. */
    private suspend fun analyzeOnServer(
        roomName: String,
        photos: List<String>,
        propertyType: String,
        finality: String,
        knownFurniture: List<String>,
        knownDamages: List<String>
    ): AnalyzeRoomResult? {
        if (!sessionManager.isLoggedIn()) return null
        val api = authedApi()
        val response = api.analyze(
            AnalyzeRequest(
                rooms = listOf(AnalyzeRoomInput(roomName, photos, knownFurniture, knownDamages)),
                propertyType = propertyType,
                finality = finality
            ),
            geminiKey = sessionManager.getGeminiKey()?.takeIf { it.isNotBlank() }
        )
        if (response.code() == 401) onUnauthorized()
        val body = response.body()
        if (!response.isSuccessful || body == null || !body.success) {
            val detail = body?.error ?: runCatching { response.errorBody()?.string() }.getOrNull()?.take(200)
            throw Exception("IA do servidor indisponível (${response.code()})${detail?.let { ": $it" } ?: ""}")
        }
        // O servidor normaliza o nome do cômodo; se não bater, usa o único resultado
        return body.results?.get(roomName) ?: body.results?.values?.firstOrNull()
    }

    /**
     * Constatações (linhas "✓ ...") para o cômodo. Usa a IA do servidor quando há login
     * e, sem login ou se o servidor falhar, a chave Gemini própria. Nunca inventa resultado.
     */
    suspend fun analyzeRoom(
        roomName: String,
        photos: List<PhotoData>,
        propertyType: String,
        finality: String
    ): Result<List<String>> = runCatching {
        val payload = photoPayload(photos, 8)
        if (payload.isEmpty()) throw Exception("As fotos deste cômodo não foram encontradas no aparelho")

        var serverError: Exception? = null
        try {
            analyzeOnServer(roomName, payload, propertyType, finality, emptyList(), emptyList())
                ?.items?.takeIf { it.isNotEmpty() }?.let { return@runCatching it }
        } catch (e: AuthExpiredException) {
            serverError = e
        } catch (e: Exception) {
            serverError = e
        }

        val key = sessionManager.getGeminiKey()
        if (!key.isNullOrBlank()) {
            return@runCatching GeminiDirectService.analyzeRoomDirect(key, roomName, payload, propertyType, finality).getOrThrow()
        }
        throw serverError ?: Exception("IA não configurada: entre com sua conta ou informe uma chave Gemini em Configurações ⚙️")
    }

    /** Sugestões de móveis, avarias e problemas para o cômodo. Nunca inventa resultado. */
    suspend fun analyzeRoomStructured(
        roomName: String,
        photos: List<PhotoData>,
        propertyType: String,
        finality: String,
        knownFurniture: List<String> = emptyList(),
        knownDamages: List<String> = emptyList()
    ): Result<AiInspectionResult> = runCatching {
        val payload = photoPayload(photos, 8)
        if (payload.isEmpty()) throw Exception("As fotos deste cômodo não foram encontradas no aparelho")

        var serverError: Exception? = null
        try {
            val server = analyzeOnServer(roomName, payload, propertyType, finality, knownFurniture, knownDamages)
            if (server != null) {
                return@runCatching AiInspectionResult(
                    furniture = server.suggestedFurniture.orEmpty(),
                    damages = server.suggestedDamages.orEmpty(),
                    problems = emptyList(),
                    observations = server.items.orEmpty()
                )
            }
        } catch (e: Exception) {
            serverError = e
        }

        val key = sessionManager.getGeminiKey()
        if (!key.isNullOrBlank()) {
            return@runCatching GeminiDirectService.analyzeRoomStructuredDirect(key, roomName, payload, propertyType, finality).getOrThrow()
        }
        throw serverError ?: Exception("IA não configurada: entre com sua conta ou informe uma chave Gemini em Configurações ⚙️")
    }

    // ------------------------------------------------------------------ comparativo com IA

    private fun sideOf(r: RoomData?): CompareSide? = r?.let {
        CompareSide(
            items = it.items.take(10),
            furniture = it.furniture.take(30),
            damages = (it.damages + it.problems).take(20),
            checklist = it.checklist,
            observations = it.observations.take(300)
        )
    }

    /**
     * Compara entrada × saída com a IA, cômodo a cômodo (até 3 fotos de cada lado) e depois
     * gera um resumo. Usa a IA do servidor quando há login; sem login, a chave Gemini própria.
     * [onProgress] recebe (feitos, total).
     */
    suspend fun compareWithAi(
        entrada: Vistoria,
        saida: Vistoria,
        onProgress: suspend (Int, Int) -> Unit = { _, _ -> }
    ): Result<AiCompare> = runCatching {
        val loggedIn = sessionManager.isLoggedIn()
        val key = sessionManager.getGeminiKey()?.takeIf { it.isNotBlank() }
        if (!loggedIn && key == null) {
            throw Exception("IA não configurada: entre com sua conta ou informe uma chave Gemini em Configurações ⚙️")
        }
        val cmp = com.imobweb.app.util.CompareBuilder.compare(entrada, saida)
        val pairs = cmp.rooms.filter { it.entrada != null && it.saida != null }
        if (pairs.isEmpty()) throw Exception("Nenhum cômodo em comum entre a entrada e a saída")

        val results = LinkedHashMap<String, AiRoomResult>()
        val failed = mutableListOf<String>()
        var lastError: Exception? = null
        pairs.forEachIndexed { i, r ->
            onProgress(i, pairs.size)
            val req = CompareRoomRequest(
                name = r.name,
                entradaPhotos = photoPayload(r.entrada!!.photos, 3),
                saidaPhotos = photoPayload(r.saida!!.photos, 3),
                entrada = sideOf(r.entrada),
                saida = sideOf(r.saida)
            )
            try {
                results[r.name] = if (loggedIn) compareRoomOnServer(req, key) else
                    GeminiDirectService.compareRoomDirect(key!!, req).getOrThrow()
            } catch (e: AuthExpiredException) {
                throw e
            } catch (e: Exception) {
                lastError = e
                failed += r.name
            }
        }
        if (results.isEmpty()) throw lastError ?: Exception("A IA não conseguiu comparar os cômodos")
        onProgress(pairs.size, pairs.size)

        val summaryReq = CompareSummaryRequest(rooms = results.map { (name, r) -> CompareSummaryRoom(name, r.summary, r.differences) })
        val summary = runCatching {
            if (loggedIn) {
                val res = withContext(Dispatchers.IO) { authedApi().compareSummary(summaryReq, key) }
                if (res.code() == 401) onUnauthorized()
                val body = res.body()
                if (res.isSuccessful && body?.success == true) (body.summary.orEmpty() to body.attention.orEmpty()) else null
            } else GeminiDirectService.compareSummaryDirect(key!!, summaryReq).getOrNull()
        }.getOrNull()

        AiCompare(rooms = results, summary = summary?.first, attention = summary?.second.orEmpty(), failedRooms = failed)
    }

    private suspend fun compareRoomOnServer(req: CompareRoomRequest, key: String?): AiRoomResult = withContext(Dispatchers.IO) {
        val res = authedApi().compareRoom(req, key)
        if (res.code() == 401) onUnauthorized()
        val body = res.body()
        if (!res.isSuccessful || body?.success != true) {
            val detail = body?.error ?: runCatching { res.errorBody()?.string() }.getOrNull()?.take(200)
            throw Exception("IA do servidor indisponível (${res.code()})${detail?.let { ": $it" } ?: ""}")
        }
        AiRoomResult(body.summary.orEmpty(), body.differences.orEmpty().map { it.sanitized() }.filter { it.description.isNotBlank() }.take(8))
    }

    // ------------------------------------------------------------------ IA: inspeção, considerações, reparos

    /**
     * Usa a IA do servidor quando há login (com a chave própria no cabeçalho, se houver);
     * sem login, chama o Gemini direto com a chave própria.
     */
    private suspend fun <T> withAi(
        server: suspend (ApiService, String?) -> T,
        direct: suspend (String) -> T
    ): T = withContext(Dispatchers.IO) {
        val key = sessionManager.getGeminiKey()?.takeIf { it.isNotBlank() }
        if (sessionManager.isLoggedIn()) {
            try {
                return@withContext server(authedApi(), key)
            } catch (e: AuthExpiredException) {
                if (key == null) throw e
            } catch (e: Exception) {
                if (key == null) throw e
            }
        }
        if (key == null) throw Exception("IA não configurada: entre com sua conta ou informe uma chave Gemini em Configurações ⚙️")
        direct(key)
    }

    private fun <B> retrofit2.Response<B>.okBody(errorOf: (B?) -> String?): B {
        if (code() == 401) throw AuthExpiredException()
        val b = body()
        if (!isSuccessful || b == null) {
            val detail = errorOf(b) ?: runCatching { errorBody()?.string() }.getOrNull()?.take(200)
            throw Exception("IA do servidor indisponível (${code()})${detail?.let { ": $it" } ?: ""}")
        }
        return b
    }

    /**
     * Detecta objetos e defeitos nas fotos do cômodo (lotes de 4) e devolve o cômodo com as
     * novas sugestões na fila de revisão. Nada é aplicado ao laudo aqui.
     */
    suspend fun inspectRoom(room: RoomData, propertyType: String): Result<RoomData> = runCatching {
        val photos = room.photos.filter { PhotoStore.exists(it) }
        if (photos.isEmpty()) throw Exception("Adicione fotos ao cômodo para a IA analisar")
        var current = room
        var found = 0
        for (batch in photos.chunked(4)) {
            val urls = batch.map { PhotoStore.toDataUrl(it) }
            val valid = batch.zip(urls).filter { it.second != null }
            if (valid.isEmpty()) continue
            val results: List<PhotoInspection> = withAi(
                server = { api, key ->
                    val res = api.inspect(InspectRequest(valid.map { it.second!! }, room.name, propertyType), key)
                    if (res.code() == 401) onUnauthorized()
                    val body = res.okBody { it?.error }
                    if (!body.success) throw Exception(body.error ?: "Falha na detecção")
                    body.results.orEmpty()
                },
                direct = { key ->
                    val parts = mutableListOf<Map<String, Any>>()
                    valid.forEachIndexed { i, (_, url) -> GeminiDirectService.imagePart(url!!)?.let { parts += mapOf("text" to "Foto $i:"); parts += it } }
                    parts += mapOf("text" to com.imobweb.app.util.AiPrompts.inspectPrompt(room.name, propertyType, valid.size))
                    val json = GeminiDirectService.generateJson(key, parts, com.imobweb.app.util.AiPrompts.INSPECT_SYSTEM, 4096)
                    com.imobweb.app.util.Inspection.normalize(json, valid.size)
                }
            )
            valid.forEachIndexed { i, (photo, _) ->
                val insp = results.getOrNull(i) ?: return@forEachIndexed
                val sanitized = PhotoInspection(
                    objects = insp.objects.orEmpty().filter { !it.name.isNullOrBlank() },
                    defects = insp.defects.orEmpty().filter { !it.description.isNullOrBlank() },
                    quality = insp.quality
                )
                val proposals = com.imobweb.app.util.Inspection.proposalsFromInspection(current, photo.id, sanitized)
                found += proposals.size
                current = current.copy(proposals = current.proposals + proposals)
            }
        }
        current
    }

    /** Considerações finais redigidas pela IA a partir dos dados da vistoria. */
    suspend fun generateConsiderations(v: Vistoria): Result<Pair<String, List<String>>> = runCatching {
        val entradaResumo = if (v.tipoVistoria == TipoVistoria.SAIDA) {
            getEntradaFor(v)?.let { e ->
                val cmp = com.imobweb.app.util.CompareBuilder.compare(e, v)
                cmp.rooms.filter { it.newDamages.isNotEmpty() || it.missingFurniture.isNotEmpty() || it.worsened > 0 }
                    .joinToString("; ") { r ->
                        buildList {
                            if (r.newDamages.isNotEmpty()) add("novas avarias: ${r.newDamages.joinToString(", ")}")
                            if (r.missingFurniture.isNotEmpty()) add("itens não encontrados: ${r.missingFurniture.joinToString(", ")}")
                            if (r.worsened > 0) add("${r.worsened} elemento(s) pioraram")
                        }.joinToString(", ").let { "${r.name}: $it" }
                    }.ifBlank { null }
            }
        } else null
        val req = ConsiderationsRequest(
            rooms = v.rooms.map {
                ConsiderationsRoom(it.name, it.photos.size, it.items, it.furniture, it.damages, it.problems, it.checklist, it.observations)
            },
            propertyInfo = mapOf(
                "tipoVistoria" to v.tipoVistoria, "tipoImovel" to v.tipoImovel, "finalidade" to v.finalidade,
                "metragem" to v.metragem, "mobiliado" to v.mobiliado
            ),
            entradaResumo = entradaResumo
        )
        if (req.rooms.isEmpty()) throw Exception("Cadastre os cômodos antes de redigir as considerações")
        withAi(
            server = { api, key ->
                val body = api.considerations(req, key).okBody { it?.error }
                if (!body.success || body.text.isNullOrBlank()) throw Exception(body.error ?: "A IA não redigiu o texto")
                body.text.trim() to body.highlights.orEmpty()
            },
            direct = { key ->
                val payload = com.google.gson.Gson().toJson(mapOf(
                    "tipo_vistoria" to TipoVistoria.label(v.tipoVistoria).lowercase(),
                    "imóvel" to req.propertyInfo, "cômodos" to req.rooms, "divergências_em_relação_à_entrada" to entradaResumo
                ))
                val json = GeminiDirectService.generateJson(
                    key, listOf(mapOf("text" to "Dados da vistoria (JSON):\n$payload\n\nRedija as considerações finais.")),
                    com.imobweb.app.util.AiPrompts.CONSIDERATIONS_SYSTEM, 1500
                )
                val text = json.get("text")?.asString?.trim().orEmpty()
                if (text.isBlank()) throw Exception("A IA não redigiu o texto")
                text.take(2500) to json.getAsJsonArray("highlights")?.mapNotNull { runCatching { it.asString }.getOrNull() }.orEmpty().take(5)
            }
        )
    }

    /** Estimativa referencial de custo de reparos para as avarias registradas. */
    suspend fun estimateRepairs(v: Vistoria): Result<List<Reparo>> = runCatching {
        val damages = v.rooms.flatMap { r -> (r.damages + r.problems).map { RepairDamage(r.name, it) } }.take(60)
        if (damages.isEmpty()) throw Exception("Nenhuma avaria registrada para estimar")
        val req = RepairsRequest(damages, v.cidade, v.estado, v.tipoImovel)
        val list: List<Reparo> = withAi(
            server = { api, key ->
                val body = api.repairs(req, key).okBody { it?.error }
                if (!body.success) throw Exception(body.error ?: "A IA não estimou os reparos")
                body.repairs.orEmpty()
            },
            direct = { key ->
                val local = listOf(v.cidade, v.estado).filter { it.isNotBlank() }.joinToString("/").ifBlank { "Brasil" }
                val json = GeminiDirectService.generateJson(
                    key,
                    listOf(mapOf("text" to "Local: $local\nTipo de imóvel: ${v.tipoImovel.ifBlank { "não informado" }}\nAvarias (JSON):\n${com.google.gson.Gson().toJson(damages)}")),
                    com.imobweb.app.util.AiPrompts.REPAIRS_SYSTEM, 3000
                )
                json.getAsJsonArray("repairs")?.mapNotNull { runCatching { com.google.gson.Gson().fromJson(it, Reparo::class.java) }.getOrNull() }.orEmpty()
            }
        )
        list.map { com.imobweb.app.data.local.ModelSanitizer.reparo(it) }
            .map { val lo = minOf(it.min, it.max); val hi = maxOf(it.min, it.max); it.copy(min = lo, max = hi, origem = "ia", id = java.util.UUID.randomUUID().toString()) }
            .filter { it.descricao.isNotBlank() }
            .take(60)
    }

    // ------------------------------------------------------------------ sincronização

    data class SyncReport(
        val pushed: Int,
        val pulled: Int,
        val deleted: Int,
        val errors: List<String>,
        val conflicts: Int = 0,
        val removedLocally: Int = 0
    )

    /** Exclusões pendentes → envio das pendentes → baixa novas/alteradas → remove as apagadas no servidor. */
    suspend fun syncAll(): SyncReport = withContext(Dispatchers.IO) {
        syncMutex.withLock {
            if (!sessionManager.isLoggedIn()) return@withLock SyncReport(0, 0, 0, emptyList())
            val org = sessionManager.getOrganizationId()
            if (org != null) dao.adoptUnowned(org)
            val errors = mutableListOf<String>()
            var conflicts = 0
            val deleted = runCatching { pushDeletes() }.getOrElse { if (it is AuthExpiredException) throw it; errors += it.message.orEmpty(); 0 }
            val pushed = runCatching { pushPending(org, errors) { conflicts++ } }
                .getOrElse { if (it is AuthExpiredException) throw it; errors += it.message.orEmpty(); 0 }
            var removed = 0
            val pulled = runCatching { pullNew(org) { removed++ } }
                .getOrElse { if (it is AuthExpiredException) throw it; errors += it.message.orEmpty(); 0 }
            SyncReport(pushed, pulled, deleted, errors, conflicts, removed)
        }
    }

    private suspend fun deleteRemote(remoteId: String) {
        val response = authedApi().deleteVistoria(remoteId)
        if (response.code() == 401) onUnauthorized()
        if (response.isSuccessful) sessionManager.removePendingDelete(remoteId)
    }

    private suspend fun pushDeletes(): Int {
        var count = 0
        for (rid in sessionManager.getPendingDeletes()) {
            deleteRemote(rid)
            count++
        }
        return count
    }

    /** Vistoria pertence à conta logada (ou é de antes do controle de conta e nunca subiu)? */
    private fun belongsTo(v: Vistoria, org: String?): Boolean =
        org == null || v.ownerOrg == org || (v.ownerOrg == null && v.remoteId == null)

    private suspend fun pushPending(org: String?, errors: MutableList<String>, onConflict: () -> Unit): Int {
        val api = authedApi()
        var synced = 0
        for (pending in dao.getPendingSyncVistorias()) {
            if (!belongsTo(pending, org)) continue // vistoria de outra conta: fica só no aparelho
            // Saída criada antes de a entrada subir: resolve o vínculo agora
            var vistoria = if (pending.linkedId != null && pending.linkedRemoteId == null) {
                pending.copy(linkedRemoteId = dao.getVistoriaById(pending.linkedId)?.remoteId)
            } else pending
            vistoria = runCatching { uploadPhotos(api, vistoria) }.getOrElse {
                if (it is AuthExpiredException) throw it
                vistoria
            }
            val force = vistoria.status == SyncStatus.PENDING_FORCE
            val payload = try {
                vistoria.toSyncData().copy(
                    baseUpdatedAt = if (vistoria.remoteId != null) vistoria.syncedAt else null,
                    force = force
                )
            } catch (e: OutOfMemoryError) {
                errors += "Vistoria ${vistoria.id}: fotos demais para enviar de uma vez"
                continue
            }
            val response = api.syncVistoria(SyncRequest(vistoria = payload))
            if (response.code() == 401) onUnauthorized()
            if (response.code() == 409) {
                // Alterada aqui e no servidor: o usuário decide qual manter
                writeMutex.withLock { dao.setStatus(vistoria.id, SyncStatus.CONFLICT) }
                onConflict()
                continue
            }
            if (response.code() == 403) {
                // Pertence a outra organização no servidor
                writeMutex.withLock {
                    dao.getVistoriaById(vistoria.id)?.let { dao.updateVistoria(it.copy(ownerOrg = "?")) }
                }
                errors += "Vistoria ${vistoria.id}: pertence a outra conta"
                continue
            }
            val body = response.body()
            if (response.isSuccessful && body?.success == true && !body.remoteId.isNullOrBlank()) {
                val marked = dao.markSyncedIfUnchanged(
                    id = vistoria.id,
                    remoteId = body.remoteId,
                    updatedAt = vistoria.updatedAt,
                    // relógio do servidor: comparado com o updatedAt da lista no próximo pull
                    syncedAt = body.updatedAt ?: System.currentTimeMillis(),
                    org = org
                )
                // Editada durante o envio: guarda o remoteId para o próximo envio não duplicar
                if (marked == 0) dao.setRemoteId(vistoria.id, body.remoteId, org)
                synced++
            } else {
                errors += "Vistoria ${vistoria.id}: ${body?.error ?: "HTTP ${response.code()}"}"
            }
        }
        return synced
    }

    /**
     * Sobe para o R2 só as fotos que o servidor ainda não tem (endereçadas por SHA-256) e
     * grava as chaves na vistoria local. Sem a rota de fotos (servidor antigo), as fotos
     * seguem embutidas no JSON como antes.
     */
    private suspend fun uploadPhotos(api: ApiService, v: Vistoria): Vistoria {
        if (sessionManager.photoApiUnavailable()) return v
        val org = sessionManager.getOrganizationId() ?: return v
        val photos = v.rooms.flatMap { it.photos }.filter { it.remoteKey == null && !it.filePath.isNullOrBlank() && File(it.filePath).exists() }
        if (photos.isEmpty()) return v

        val keys = mutableMapOf<String, String>() // photo.id → key
        val candidates = photos.associateWith { PhotoStore.keyFor(org, File(it.filePath!!)) }
        val check = api.checkPhotos(PhotoCheckRequest(candidates.values.filterNotNull().distinct()))
        if (check.code() == 401) onUnauthorized()
        if (check.code() == 404 || check.code() == 501) {
            sessionManager.setPhotoApiUnavailable(true)
            return v
        }
        val missing = check.body()?.missing?.toSet() ?: return v
        for ((photo, key) in candidates) {
            if (key == null) continue
            if (key !in missing) { keys[photo.id] = key; continue }
            val bytes = File(photo.filePath!!).readBytes()
            val res = api.uploadPhoto(bytes.toRequestBody("image/jpeg".toMediaType()))
            if (res.code() == 401) onUnauthorized()
            if (res.code() == 501) { sessionManager.setPhotoApiUnavailable(true); break }
            res.body()?.key?.takeIf { res.isSuccessful }?.let { keys[photo.id] = it }
        }
        if (keys.isEmpty()) return v
        val withKeys: (List<RoomData>) -> List<RoomData> = { rooms ->
            rooms.map { r -> r.copy(photos = r.photos.map { p -> keys[p.id]?.let { k -> p.copy(remoteKey = k) } ?: p }) }
        }
        // grava as chaves sem mexer no status/updatedAt (não é uma edição do usuário)
        writeMutex.withLock {
            dao.getVistoriaById(v.id)?.let { cur -> dao.updateVistoria(cur.copy(rooms = withKeys(cur.rooms))) }
        }
        return v.copy(rooms = withKeys(v.rooms))
    }

    /**
     * Baixa do servidor (resumo primeiro, depois uma a uma):
     *  - vistorias que ainda não existem no aparelho;
     *  - vistorias alteradas em outro aparelho ou no sistema web, desde que não tenham
     *    alterações locais pendentes (nesse caso a versão local é enviada; se o servidor
     *    também mudou, vira conflito e o usuário escolhe).
     * Depois remove do aparelho as vistorias desta conta apagadas no servidor por outro caminho.
     */
    private suspend fun pullNew(org: String?, onRemoved: () -> Unit): Int {
        val api = authedApi()
        val response = api.listVistorias()
        if (response.code() == 401) onUnauthorized()
        val body = response.body()?.takeIf { response.isSuccessful && it.success } ?: return 0
        val summaries = body.vistorias ?: return 0
        val listOrg = body.organizationId ?: org

        var changed = 0
        for (summary in summaries) {
            val rid = summary.remoteId ?: continue
            if (sessionManager.isRemoteIdDeleted(rid)) continue
            val local = dao.getByRemoteId(rid)
            val needsUpdate = local != null && local.status == SyncStatus.SYNCED && summary.updatedAt > (local.syncedAt ?: 0L)
            if (local != null && !needsUpdate) continue
            if (fetchAndStore(api, rid, listOrg) { cur, incoming -> cur.status == SyncStatus.SYNCED && incoming.updatedAt > (cur.syncedAt ?: 0L) }) changed++
        }

        // Apagadas no servidor (outro aparelho, web): só quando a lista é da mesma conta e
        // a cópia local não tem alterações pendentes.
        if (org != null && listOrg == org) {
            val remoteIds = summaries.mapNotNull { it.remoteId }.toSet()
            val gone = dao.getAllOnce().filter {
                it.remoteId != null && it.ownerOrg == org && it.status == SyncStatus.SYNCED && it.remoteId !in remoteIds
            }
            for (v in gone) {
                writeMutex.withLock {
                    val cur = dao.getVistoriaById(v.id)
                    if (cur != null && cur.status == SyncStatus.SYNCED) {
                        dao.deleteVistoriaById(cur.id)
                        PhotoStore.deleteFiles(cur)
                        onRemoved()
                    }
                }
            }
        }
        return changed
    }

    /** Baixa a vistoria [rid] completa e grava (nova, ou substitui se [shouldReplace]). */
    private suspend fun fetchAndStore(
        api: ApiService,
        rid: String,
        org: String?,
        shouldReplace: (current: Vistoria, incoming: SyncVistoriaData) -> Boolean
    ): Boolean {
        val full = api.listVistorias(rid)
        if (full.code() == 401) onUnauthorized()
        val sv = full.body()?.vistorias?.firstOrNull() ?: return false
        val incoming = sv.toVistoria(api).copy(ownerOrg = org)
        return writeMutex.withLock {
            val current = dao.getByRemoteId(rid)
            val linkedLocal = sv.linkedRemoteId?.let { dao.getByRemoteId(it)?.id }
            when {
                current == null -> {
                    dao.insertVistoria(incoming.copy(linkedId = linkedLocal))
                    true
                }
                shouldReplace(current, sv) -> {
                    val replaced = incoming.copy(id = current.id, linkedId = linkedLocal ?: current.linkedId)
                    dao.updateVistoria(replaced)
                    PhotoStore.deleteFiles(current, keep = replaced.rooms.flatMap { r -> r.photos.mapNotNull { it.filePath } }.toSet())
                    true
                }
                else -> {
                    // descartada: apaga as fotos baixadas à toa
                    PhotoStore.deleteFiles(incoming, keep = current.rooms.flatMap { r -> r.photos.mapNotNull { it.filePath } }.toSet())
                    false
                }
            }
        }
    }

    // ------------------------------------------------------------------ conflitos

    fun getConflictCount(): Flow<Int> = dao.getConflictCount()

    /** Mantém a versão do aparelho: envia e substitui a do servidor. */
    suspend fun resolveConflictKeepLocal(id: Long) = withContext(Dispatchers.IO) {
        writeMutex.withLock { dao.setStatus(id, SyncStatus.PENDING_FORCE) }
        syncAll()
    }

    /** Usa a versão do servidor (descarta as alterações deste aparelho). */
    suspend fun resolveConflictUseServer(id: Long): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val v = dao.getVistoriaById(id) ?: throw Exception("Vistoria não encontrada")
            val rid = v.remoteId ?: throw Exception("Vistoria sem cópia no servidor")
            val ok = fetchAndStore(authedApi(), rid, sessionManager.getOrganizationId()) { _, _ -> true }
            if (!ok) throw Exception("A vistoria não existe mais no servidor")
        }
    }

    // ------------------------------------------------------------------ troca de conta

    /** Quantas vistorias no aparelho são de outra conta (após login com [org]). */
    suspend fun countForeign(org: String): Int = dao.countForeign(org)

    /** Apaga do aparelho as vistorias de outra conta. */
    suspend fun deleteForeign(org: String) = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            dao.getForeign(org).forEach { v ->
                dao.deleteVistoriaById(v.id)
                PhotoStore.deleteFiles(v)
            }
        }
    }

    /** Mantém as vistorias de outra conta só no aparelho (não sincronizam). */
    suspend fun keepForeignLocal(org: String) = withContext(Dispatchers.IO) {
        writeMutex.withLock {
            dao.getForeign(org).forEach { v ->
                if (v.ownerOrg == null) dao.updateVistoria(v.copy(ownerOrg = "?"))
            }
        }
    }

    suspend fun currentOrganization(): String? = sessionManager.getOrganizationId()

    // ------------------------------------------------------------------ conversões

    /** Baixa as fotos que vêm por chave (R2); as embutidas viram arquivo direto. */
    @Suppress("USELESS_ELVIS")
    private suspend fun SyncVistoriaData.toVistoria(api: ApiService): Vistoria {
        val sv = this
        val rooms = sv.rooms.orEmpty().map { room ->
            RoomData(
                id = room.id.orEmpty().ifBlank { java.util.UUID.randomUUID().toString() },
                name = room.name.orEmpty(),
                furniture = room.furniture.orEmpty(),
                damages = room.damages.orEmpty(),
                problems = room.problems.orEmpty(),
                items = room.items.orEmpty(),
                checklist = room.checklist.orEmpty(),
                observations = room.observations.orEmpty(),
                photos = room.photos.orEmpty().mapNotNull { photo ->
                    val annotations = photo.annotations.orEmpty().map { PhotoAnnotation(it.x, it.y, (it.label ?: "")) }
                    val id = photo.id ?: java.util.UUID.randomUUID().toString()
                    val key = photo.key
                    if (!key.isNullOrBlank()) {
                        val file = PhotoStore.fileForKey(context, key)
                        if (!file.exists()) {
                            runCatching {
                                val res = api.downloadPhoto(key)
                                if (res.code() == 401) onUnauthorized()
                                res.body()?.takeIf { res.isSuccessful }?.byteStream()?.use { input ->
                                    val tmp = File(file.parentFile, file.name + ".part")
                                    tmp.outputStream().use { input.copyTo(it) }
                                    tmp.renameTo(file)
                                }
                            }.onFailure { if (it is AuthExpiredException) throw it }
                        }
                        PhotoData(id = id, name = photo.name.orEmpty(), annotations = annotations,
                            filePath = file.absolutePath.takeIf { file.exists() }, remoteKey = key)
                    } else {
                        PhotoStore.persisted(context, PhotoData(id = id, dataUrl = photo.dataUrl.orEmpty(),
                            name = photo.name.orEmpty(), annotations = annotations))
                    }
                }
            )
        }
        return Vistoria(
            remoteId = remoteId,
            condominio = condominio.orEmpty(), endereco = endereco.orEmpty(), numero = numero.orEmpty(),
            conjApto = conjApto.orEmpty(), cep = cep.orEmpty(), bairro = bairro.orEmpty(),
            cidade = cidade.orEmpty(), estado = estado.orEmpty(), tipoImovel = tipoImovel.orEmpty(),
            finalidade = finalidade.orEmpty(), metragem = metragem.orEmpty(), mobiliado = mobiliado.orEmpty(),
            locadora = locadora.orEmpty(), locadoraCpf = locadoraCpf.orEmpty(),
            locatario = locatario.orEmpty(), locatarioCpf = locatarioCpf.orEmpty(),
            vistoriadora = vistoriadora.orEmpty(), dataFotografia = dataFotografia.orEmpty(),
            dataLaudo = dataLaudo.orEmpty(), solicitante = solicitante.orEmpty(),
            consideracoes = consideracoes.orEmpty(),
            rooms = rooms,
            status = SyncStatus.SYNCED,
            createdAt = createdAt,
            updatedAt = updatedAt,
            syncedAt = updatedAt, // relógio do servidor
            tipoVistoria = tipoVistoria?.takeIf { it in TipoVistoria.ALL } ?: TipoVistoria.ENTRADA,
            linkedRemoteId = linkedRemoteId,
            medidores = com.imobweb.app.data.local.ModelSanitizer.medidores(medidores),
            medidoresEntrada = medidoresEntrada?.let { com.imobweb.app.data.local.ModelSanitizer.medidores(it) },
            chaves = chaves.orEmpty().map { com.imobweb.app.data.local.ModelSanitizer.chave(it) },
            signatures = signatures ?: Signatures(),
            andar = andar.orEmpty(),
            locadoraTelefone = locadoraTelefone.orEmpty(),
            locatarioTelefone = locatarioTelefone.orEmpty(),
            emailContestacao = emailContestacao.orEmpty(),
            reparos = reparos.orEmpty().map { com.imobweb.app.data.local.ModelSanitizer.reparo(it) }
        )
    }

    private fun Vistoria.toSyncData(): SyncVistoriaData = SyncVistoriaData(
        id = id, remoteId = remoteId,
        condominio = condominio, endereco = endereco, numero = numero,
        conjApto = conjApto, cep = cep, bairro = bairro,
        cidade = cidade, estado = estado, tipoImovel = tipoImovel,
        finalidade = finalidade, metragem = metragem, mobiliado = mobiliado,
        locadora = locadora, locadoraCpf = locadoraCpf,
        locatario = locatario, locatarioCpf = locatarioCpf,
        vistoriadora = vistoriadora, dataFotografia = dataFotografia,
        dataLaudo = dataLaudo, solicitante = solicitante,
        consideracoes = consideracoes,
        rooms = rooms.map { room ->
            SyncRoomData(
                id = room.id, name = room.name,
                furniture = room.furniture,
                damages = room.damages,
                problems = room.problems,
                items = room.items,
                checklist = room.checklist,
                observations = room.observations,
                photos = room.photos.map { photo ->
                    SyncPhotoData(
                        id = photo.id,
                        key = photo.remoteKey,
                        // com chave no R2 a foto não vai embutida (envio leve)
                        dataUrl = if (photo.remoteKey != null) null else PhotoStore.toDataUrl(photo).orEmpty(),
                        name = photo.name,
                        annotations = photo.annotations.map { SyncAnnotationData(it.x, it.y, it.label) },
                        filePath = null
                    )
                }
            )
        },
        status = status, createdAt = createdAt, updatedAt = updatedAt,
        tipoVistoria = tipoVistoria,
        linkedRemoteId = linkedRemoteId,
        medidores = medidores,
        medidoresEntrada = medidoresEntrada,
        chaves = chaves,
        signatures = signatures,
        andar = andar,
        locadoraTelefone = locadoraTelefone,
        locatarioTelefone = locatarioTelefone,
        emailContestacao = emailContestacao,
        reparos = reparos
    )
}
