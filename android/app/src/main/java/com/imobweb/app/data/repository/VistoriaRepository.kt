package com.imobweb.app.data.repository

import com.google.gson.Gson
import com.imobweb.app.data.api.ApiService
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.model.*
import kotlinx.coroutines.flow.Flow

class VistoriaRepository(
    private val database: AppDatabase,
    private val sessionManager: SessionManager
) {
    private val dao = database.vistoriaDao()
    private val gson = Gson()

    fun getAllVistorias(): Flow<List<Vistoria>> = dao.getAllVistorias()

    fun getVistoriasByStatus(status: String): Flow<List<Vistoria>> = dao.getVistoriasByStatus(status)

    fun getPendingSyncCount(): Flow<Int> = dao.getPendingSyncCount()

    suspend fun getVistoriaById(id: Long): Vistoria? = dao.getVistoriaById(id)

    suspend fun saveVistoria(vistoria: Vistoria): Long = dao.insertVistoria(vistoria)

    suspend fun updateVistoria(vistoria: Vistoria) = dao.updateVistoria(vistoria)

    suspend fun deleteVistoria(vistoria: Vistoria) = dao.deleteVistoria(vistoria)

    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val baseUrl = sessionManager.getBaseUrl()
            val api = ApiService.getInstance(baseUrl)
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null && body.success) {
                    val token = body.user?.id ?: ""
                    sessionManager.saveSession(
                        token = token,
                        email = email,
                        userId = body.user?.id ?: "",
                        role = body.role ?: "BROKER"
                    )
                    Result.success(body)
                } else {
                    Result.failure(Exception(body?.error ?: "Erro ao fazer login"))
                }
            } else {
                Result.failure(Exception("Erro ${response.code()}: ${response.errorBody()?.string()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeRoom(roomName: String, photos: List<String>, propertyType: String, finality: String): Result<AnalyzeResponse> {
        return try {
            val baseUrl = sessionManager.getBaseUrl()
            val api = ApiService.getInstance(baseUrl, sessionManager.getToken())
            val response = api.analyze(
                AnalyzeRequest(
                    rooms = listOf(AnalyzeRoomInput(name = roomName, photos = photos)),
                    propertyType = propertyType,
                    finality = finality
                )
            )
            if (response.isSuccessful) {
                Result.success(response.body() ?: AnalyzeResponse(false, null, "Resposta vazia"))
            } else {
                Result.failure(Exception("Erro ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generatePdf(data: Vistoria): Result<String> {
        return try {
            val baseUrl = sessionManager.getBaseUrl()
            val api = ApiService.getInstance(baseUrl, sessionManager.getToken())
            val request = PdfGenerateRequest(
                condominio = data.condominio, endereco = data.endereco,
                numero = data.numero, conjApto = data.conjApto,
                cep = data.cep, bairro = data.bairro,
                cidade = data.cidade, estado = data.estado,
                tipoImovel = data.tipoImovel, finalidade = data.finalidade,
                metragem = data.metragem, mobiliado = data.mobiliado,
                locadora = data.locadora, locadoraCpf = data.locadoraCpf,
                locatario = data.locatario, locatarioCpf = data.locatarioCpf,
                vistoriadora = data.vistoriadora, dataFotografia = data.dataFotografia,
                dataLaudo = data.dataLaudo, solicitante = data.solicitante,
                consideracoes = data.consideracoes,
                rooms = data.rooms.map { room ->
                    val inventoryItems = mutableListOf<String>()
                    if (room.furniture.isNotEmpty()) {
                        inventoryItems.add("Móveis: ${room.furniture.joinToString(", ")}")
                    }
                    if (room.damages.isNotEmpty()) {
                        inventoryItems.addAll(room.damages.map { "Avarias: $it" })
                    }
                    if (room.problems.isNotEmpty()) {
                        inventoryItems.addAll(room.problems)
                    }
                    PdfRoomData(
                        name = room.name,
                        items = (room.items + inventoryItems).ifEmpty {
                            listOf("✓ Cômodo \"${room.name}\" - sem análise automática")
                        },
                        furniture = room.furniture,
                        damages = room.damages,
                        problems = room.problems,
                        photos = room.photos.map { photo ->
                            PdfPhotoData(
                                dataUrl = photo.dataUrl,
                                name = photo.name,
                                annotations = photo.annotations
                            )
                        }
                    )
                }
            )
            val response = api.generatePdf(request)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null && body.success && body.html != null) {
                    Result.success(body.html)
                } else {
                    Result.failure(Exception(body?.error ?: "Erro ao gerar PDF"))
                }
            } else {
                Result.failure(Exception("Erro ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun syncPendingVistorias(): Int {
        val pending = dao.getPendingSyncVistorias()
        var synced = 0
        for (vistoria in pending) {
            try {
                val baseUrl = sessionManager.getBaseUrl()
                val token = sessionManager.getToken() ?: continue
                val api = ApiService.getInstance(baseUrl, token)
                val userId = sessionManager.getToken() ?: ""
                val request = SyncRequest(
                    vistoria = vistoria.toSyncData(),
                    userId = userId
                )
                val response = api.syncVistoria(request)
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.success == true) {
                        val remoteId = body.remoteId
                        val updated = vistoria.copy(
                            remoteId = remoteId ?: vistoria.remoteId,
                            status = "synced",
                            syncedAt = System.currentTimeMillis()
                        )
                        dao.updateVistoria(updated)
                        synced++
                    }
                }
            } catch (_: Exception) { }
        }
        return synced
    }

    suspend fun pullVistoriasFromServer(): Int {
        return try {
            val baseUrl = sessionManager.getBaseUrl()
            val token = sessionManager.getToken() ?: return 0
            val api = ApiService.getInstance(baseUrl, token)
            val response = api.listVistorias()
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true && body.vistorias != null) {
                    var imported = 0
                    val localIds = dao.getAllVistorias().first().map { it.remoteId }.toSet()
                    for (sv in body.vistorias) {
                        if (sv.remoteId in localIds) continue
                        val vistoria = sv.toVistoria()
                        dao.insertVistoria(vistoria)
                        imported++
                    }
                    imported
                } else 0
            } else 0
        } catch (_: Exception) { 0 }
    }

    private suspend fun SyncVistoriaData.toVistoria(): Vistoria {
        return Vistoria(
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
                    furniture = room.furniture,
                    damages = room.damages,
                    problems = room.problems,
                    items = room.items,
                    photos = room.photos.map { photo ->
                        PhotoData(
                            dataUrl = photo.dataUrl,
                            name = photo.name,
                            annotations = photo.annotations.map { ann ->
                                PhotoAnnotation(x = ann.x, y = ann.y, label = ann.label)
                            },
                            filePath = photo.filePath
                        )
                    }
                )
            },
            status = "synced",
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}

private fun Vistoria.toSyncData(): SyncVistoriaData {
    return SyncVistoriaData(
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
                photos = room.photos.map { photo ->
                    SyncPhotoData(
                        dataUrl = photo.dataUrl,
                        name = photo.name,
                        annotations = photo.annotations.map { ann ->
                            SyncAnnotationData(x = ann.x, y = ann.y, label = ann.label)
                        },
                        filePath = photo.filePath
                    )
                }
            )
        },
        status = status, createdAt = createdAt, updatedAt = updatedAt
    )
}
}
