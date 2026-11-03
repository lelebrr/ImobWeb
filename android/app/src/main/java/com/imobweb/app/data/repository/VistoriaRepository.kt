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
                    rooms = rooms,
                    status = "pending_sync",
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
                    draft.copy(id = 0, rooms = rooms, status = "pending_sync", createdAt = now, updatedAt = now)
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
            status = "pending_sync",
            createdAt = now,
            updatedAt = now,
            syncedAt = null
        )
        writeMutex.withLock { dao.insertVistoria(saida) }
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
                val token = body.token
                if (token.isNullOrBlank()) {
                    return@withContext Result.failure(
                        Exception("O servidor não devolveu o token de acesso. Atualize o servidor (rota /api/auth/login).")
                    )
                }
                sessionManager.saveSession(
                    token = token,
                    email = email,
                    userId = body.user?.id ?: "",
                    role = body.role ?: "BROKER"
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
            )
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

    // ------------------------------------------------------------------ sincronização

    data class SyncReport(val pushed: Int, val pulled: Int, val deleted: Int, val errors: List<String>)

    /** Exclusões pendentes → envio das pendentes → importação das novas do servidor. */
    suspend fun syncAll(): SyncReport = withContext(Dispatchers.IO) {
        syncMutex.withLock {
            if (!sessionManager.isLoggedIn()) return@withLock SyncReport(0, 0, 0, emptyList())
            val errors = mutableListOf<String>()
            val deleted = runCatching { pushDeletes() }.getOrElse { errors += it.message.orEmpty(); 0 }
            val pushed = runCatching { pushPending(errors) }.getOrElse { errors += it.message.orEmpty(); 0 }
            val pulled = runCatching { pullNew() }.getOrElse { errors += it.message.orEmpty(); 0 }
            SyncReport(pushed, pulled, deleted, errors)
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

    private suspend fun pushPending(errors: MutableList<String>): Int {
        val api = authedApi()
        var synced = 0
        for (pending in dao.getPendingSyncVistorias()) {
            // Saída criada antes de a entrada subir: resolve o vínculo agora
            val vistoria = if (pending.linkedId != null && pending.linkedRemoteId == null) {
                pending.copy(linkedRemoteId = dao.getVistoriaById(pending.linkedId)?.remoteId)
            } else pending
            val response = try {
                api.syncVistoria(SyncRequest(vistoria = vistoria.toSyncData()))
            } catch (e: OutOfMemoryError) {
                errors += "Vistoria ${vistoria.id}: fotos demais para enviar de uma vez"
                continue
            }
            if (response.code() == 401) onUnauthorized()
            val body = response.body()
            if (response.isSuccessful && body?.success == true && !body.remoteId.isNullOrBlank()) {
                val marked = dao.markSyncedIfUnchanged(
                    id = vistoria.id,
                    remoteId = body.remoteId,
                    updatedAt = vistoria.updatedAt,
                    syncedAt = System.currentTimeMillis()
                )
                // Editada durante o envio: guarda o remoteId para o próximo envio não duplicar
                if (marked == 0) dao.setRemoteId(vistoria.id, body.remoteId)
                synced++
            } else {
                errors += "Vistoria ${vistoria.id}: ${body?.error ?: "HTTP ${response.code()}"}"
            }
        }
        return synced
    }

    /** Importa só as vistorias que ainda não existem no aparelho (resumo primeiro, depois uma a uma). */
    private suspend fun pullNew(): Int {
        val api = authedApi()
        val response = api.listVistorias()
        if (response.code() == 401) onUnauthorized()
        val summaries = response.body()?.takeIf { response.isSuccessful && it.success }?.vistorias ?: return 0

        val local = dao.getRemoteIds().toSet()
        var imported = 0
        for (summary in summaries) {
            val rid = summary.remoteId ?: continue
            if (rid in local || sessionManager.isRemoteIdDeleted(rid)) continue
            val full = api.listVistorias(rid)
            if (full.code() == 401) onUnauthorized()
            val sv = full.body()?.vistorias?.firstOrNull() ?: continue
            writeMutex.withLock {
                if (rid !in dao.getRemoteIds()) {
                    val linkedLocal = sv.linkedRemoteId?.let { dao.getByRemoteId(it)?.id }
                    dao.insertVistoria(sv.toVistoria().copy(linkedId = linkedLocal))
                    imported++
                }
            }
        }
        return imported
    }

    @Suppress("USELESS_ELVIS")
    private fun SyncVistoriaData.toVistoria(): Vistoria = Vistoria(
        remoteId = remoteId,
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
            RoomData(
                id = room.id.ifBlank { java.util.UUID.randomUUID().toString() },
                name = room.name,
                furniture = room.furniture.orEmpty(),
                damages = room.damages.orEmpty(),
                problems = room.problems.orEmpty(),
                items = room.items.orEmpty(),
                checklist = room.checklist.orEmpty(),
                observations = room.observations.orEmpty(),
                photos = room.photos.orEmpty().map { photo ->
                    PhotoStore.persisted(
                        context,
                        PhotoData(
                            dataUrl = photo.dataUrl.orEmpty(),
                            name = photo.name.orEmpty(),
                            annotations = photo.annotations.orEmpty().map { PhotoAnnotation(it.x, it.y, it.label) },
                            filePath = null
                        )
                    )
                }
            )
        },
        status = "synced",
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncedAt = System.currentTimeMillis(),
        tipoVistoria = tipoVistoria?.takeIf { it in TipoVistoria.ALL } ?: TipoVistoria.ENTRADA,
        linkedRemoteId = linkedRemoteId,
        medidores = com.imobweb.app.data.local.ModelSanitizer.medidores(medidores),
        medidoresEntrada = medidoresEntrada?.let { com.imobweb.app.data.local.ModelSanitizer.medidores(it) },
        chaves = chaves.orEmpty().map { com.imobweb.app.data.local.ModelSanitizer.chave(it) },
        signatures = signatures ?: Signatures()
    )

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
                        dataUrl = PhotoStore.toDataUrl(photo).orEmpty(),
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
        signatures = signatures
    )
}
