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
                    PdfRoomData(
                        name = room.name,
                        items = room.items.ifEmpty { listOf("✓ Cômodo \"${room.name}\" - sem análise automática") },
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
                // Try to generate PDF on server to confirm data is valid
                val result = generatePdf(vistoria)
                if (result.isSuccess) {
                    dao.markSynced(vistoria.id)
                    synced++
                }
            } catch (_: Exception) { }
        }
        return synced
    }
}
