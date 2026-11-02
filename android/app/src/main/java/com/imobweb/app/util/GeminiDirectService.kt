package com.imobweb.app.util

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.imobweb.app.model.AnalyzeResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * Cliente direto da API Google Gemini para análise de fotos de vistoria.
 * Funciona diretamente no aparelho caso o usuário tenha informado sua chave
 * de API Gemini em Configurações, sem depender de autenticação do backend.
 */
object GeminiDirectService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()

    suspend fun analyzeRoomDirect(
        apiKey: String,
        roomName: String,
        photosBase64: List<String>,
        propertyType: String = "Imóvel",
        finality: String = "Residencial"
    ): Result<List<String>> = withContext(Dispatchers.IO) {
        try {
            val prompt = """
                Você é uma vistoriadora técnica de imóveis no Brasil.
                Analise as fotos do cômodo "$roomName" de um(a) $propertyType ($finality).
                Descreva objetivamente o que está visível, identificando:
                - Estado de conservação das paredes, piso, teto e portas/janelas.
                - Móveis ou itens presentes e seu estado.
                - Eventuais avarias, marcas, manchas ou problemas encontrados.

                Retorne de 4 a 10 constatações em linhas separadas, começando cada linha com "✓ ".
                Exemplo:
                ✓ Paredes com pintura em bom estado de conservação
                ✓ Piso cerâmico limpo e sem trincas visíveis
                ✓ Janela de alumínio com funcionamento adequado
                ✓ Leve mancha de umidade próxima ao rodapé
            """.trimIndent()

            val partsArray = mutableListOf<Map<String, Any>>()
            partsArray.add(mapOf("text" to prompt))

            photosBase64.take(6).forEach { rawDataUrl ->
                val pureBase64 = if (rawDataUrl.contains(",")) {
                    rawDataUrl.substringAfter(",")
                } else rawDataUrl

                if (pureBase64.isNotBlank()) {
                    partsArray.add(
                        mapOf(
                            "inline_data" to mapOf(
                                "mime_type" to "image/jpeg",
                                "data" to pureBase64
                            )
                        )
                    )
                }
            }

            val requestBodyMap = mapOf(
                "contents" to listOf(
                    mapOf("parts" to partsArray)
                ),
                "generationConfig" to mapOf(
                    "temperature" to 0.2,
                    "maxOutputTokens" to 2048
                )
            )

            val jsonBody = gson.toJson(requestBodyMap)
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = jsonBody.toRequestBody(mediaType)

            // Tenta primeiro com gemini-2.5-flash, com fallback para gemini-1.5-flash
            val models = listOf("gemini-2.5-flash", "gemini-1.5-flash")
            var lastError: Exception? = null

            for (model in models) {
                try {
                    val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
                    val request = Request.Builder()
                        .url(url)
                        .post(requestBody)
                        .build()

                    val response = client.newCall(request).execute()
                    val responseStr = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val parsed = gson.fromJson(responseStr, JsonObject::class.java)
                        val text = parsed.getAsJsonArray("candidates")
                            ?.get(0)?.asJsonObject
                            ?.getAsJsonObject("content")
                            ?.getAsJsonArray("parts")
                            ?.get(0)?.asJsonObject
                            ?.get("text")?.asString ?: ""

                        val lines = text.lines()
                            .map { it.trim() }
                            .filter { it.isNotBlank() }
                            .map { line ->
                                if (line.startsWith("✓") || line.startsWith("-") || line.startsWith("*")) {
                                    "✓ " + line.removePrefix("✓").removePrefix("-").removePrefix("*").trim()
                                } else {
                                    "✓ $line"
                                }
                            }

                        if (lines.isNotEmpty()) {
                            return@withContext Result.success(lines)
                        }
                    } else {
                        lastError = Exception("Gemini API ($model) HTTP ${response.code}: $responseStr")
                    }
                } catch (e: Exception) {
                    lastError = e
                }
            }

            Result.failure(lastError ?: Exception("Falha ao analisar fotos com Gemini AI"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeRoomStructuredDirect(
        apiKey: String,
        roomName: String,
        photosBase64: List<String>,
        propertyType: String = "Imóvel",
        finality: String = "Residencial"
    ): Result<AiInspectionResult> = withContext(Dispatchers.IO) {
        try {
            val prompt = """
                Você é um(a) vistoriador(a) técnico(a) de imóveis no Brasil.
                Analise com atenção as fotos anexadas do cômodo "$roomName" de um(a) $propertyType ($finality).
                Identifique detalhadamente:
                1. "moveis": Móveis, mobília, eletrodomésticos ou itens visíveis (ex: Sofá, Mesa de jantar, Geladeira, Fogão, Armário planejado, Cama, Televisão, etc.).
                2. "avarias": Riscos, arranhões, pintura descascando, manchas, furos na alvenaria ou desgastes estéticos visíveis.
                3. "problemas": Problemas estruturais, hidráulicos, elétricos, infiltração, mofo, fiação exposta ou trincas.
                4. "observacoes": Constatações gerais sobre conservação (ex: Pintura conservada, Piso em bom estado).

                RESPONDA ESTRITAMENTE EM JSON VÁLIDO no seguinte formato (sem código markdown adicional):
                {
                  "moveis": ["item 1", "item 2"],
                  "avarias": ["avaria 1", "avaria 2"],
                  "problemas": ["problema 1"],
                  "observacoes": ["observação 1"]
                }
            """.trimIndent()

            val partsArray = mutableListOf<Map<String, Any>>()
            partsArray.add(mapOf("text" to prompt))

            photosBase64.take(6).forEach { rawDataUrl ->
                val pureBase64 = if (rawDataUrl.contains(",")) {
                    rawDataUrl.substringAfter(",")
                } else rawDataUrl

                if (pureBase64.isNotBlank()) {
                    partsArray.add(
                        mapOf(
                            "inline_data" to mapOf(
                                "mime_type" to "image/jpeg",
                                "data" to pureBase64
                            )
                        )
                    )
                }
            }

            val requestBodyMap = mapOf(
                "contents" to listOf(
                    mapOf("parts" to partsArray)
                ),
                "generationConfig" to mapOf(
                    "temperature" to 0.2,
                    "maxOutputTokens" to 2048
                )
            )

            val jsonBody = gson.toJson(requestBodyMap)
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = jsonBody.toRequestBody(mediaType)

            val models = listOf("gemini-2.5-flash", "gemini-1.5-flash")
            var lastError: Exception? = null

            for (model in models) {
                try {
                    val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
                    val request = Request.Builder()
                        .url(url)
                        .post(requestBody)
                        .build()

                    val response = client.newCall(request).execute()
                    val responseStr = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val parsed = gson.fromJson(responseStr, JsonObject::class.java)
                        val text = parsed.getAsJsonArray("candidates")
                            ?.get(0)?.asJsonObject
                            ?.getAsJsonObject("content")
                            ?.getAsJsonArray("parts")
                            ?.get(0)?.asJsonObject
                            ?.get("text")?.asString ?: ""

                        var clean = text.trim()
                        if (clean.contains("```json")) {
                            clean = clean.substringAfter("```json").substringBeforeLast("```").trim()
                        } else if (clean.contains("```")) {
                            clean = clean.substringAfter("```").substringBeforeLast("```").trim()
                        }

                        val jsonStart = clean.indexOf('{')
                        val jsonEnd = clean.lastIndexOf('}')
                        if (jsonStart != -1 && jsonEnd > jsonStart) {
                            clean = clean.substring(jsonStart, jsonEnd + 1)
                        }

                        val resJson = try {
                            gson.fromJson(clean, JsonObject::class.java)
                        } catch (_: Exception) { null }

                        if (resJson != null) {
                            val moveis = resJson.getAsJsonArray("moveis")?.map { it.asString.trim() }?.filter { it.isNotBlank() } ?: emptyList()
                            val avarias = resJson.getAsJsonArray("avarias")?.map { it.asString.trim() }?.filter { it.isNotBlank() } ?: emptyList()
                            val problemas = resJson.getAsJsonArray("problemas")?.map { it.asString.trim() }?.filter { it.isNotBlank() } ?: emptyList()
                            val observacoes = resJson.getAsJsonArray("observacoes")?.map { it.asString.trim() }?.filter { it.isNotBlank() } ?: emptyList()

                            return@withContext Result.success(
                                AiInspectionResult(
                                    furniture = moveis,
                                    damages = avarias,
                                    problems = problemas,
                                    observations = observacoes
                                )
                            )
                        }
                    } else {
                        lastError = Exception("Gemini API ($model) HTTP ${response.code}: $responseStr")
                    }
                } catch (e: Exception) {
                    lastError = e
                }
            }

            Result.failure(lastError ?: Exception("Falha ao analisar fotos com Gemini AI"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

data class AiInspectionResult(
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
    val observations: List<String> = emptyList()
)
