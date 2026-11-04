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

    // ------------------------------------------------------------------ comparativo entrada × saída

    private const val SYSTEM_ROOM = """Você compara a vistoria de ENTRADA e a de SAÍDA de um mesmo cômodo de imóvel alugado, no Brasil.
Regras:
- Baseie-se nas fotos (se houver) e nos dados fornecidos. Nunca invente diferenças. Se as fotos forem insuficientes ou de ângulos diferentes, diga isso e reduza a confiança.
- Classifique cada diferença: dano_novo, item_ausente, piora, melhoria, desgaste_normal (uso comum, sem dano) ou sem_alteracao.
- "confidence" de 0 a 1 reflete a certeza visual/documental.
- Linguagem neutra e factual, sem atribuir culpa nem fazer conclusões jurídicas. Português do Brasil.
- Responda APENAS com JSON: {"summary": "1 a 2 frases", "differences": [{"type": "...", "description": "...", "severity": "leve|moderada|grave", "confidence": 0.8}]}. No máximo 8 diferenças."""

    private const val SYSTEM_SUMMARY = """Você resume a comparação entre vistoria de entrada e de saída de um imóvel alugado, no Brasil.
Use SOMENTE os resultados por cômodo fornecidos. Seja factual, neutro e conciso (máx. 150 palavras), sem conclusões jurídicas.
Responda APENAS com JSON: {"summary": "...", "attention": ["até 6 pontos que merecem conferência humana"]}."""

    fun imagePart(dataUrl: String): Map<String, Any>? {
        val mime = dataUrl.substringAfter("data:", "").substringBefore(";").ifBlank { "image/jpeg" }
        val data = dataUrl.substringAfter(",", "")
        if (data.isBlank()) return null
        return mapOf("inline_data" to mapOf("mime_type" to mime, "data" to data))
    }

    /** Chamada genérica que devolve o JSON da resposta (já sem cercas de markdown). */
    suspend fun generateJson(
        apiKey: String,
        parts: List<Map<String, Any>>,
        system: String,
        maxTokens: Int
    ): JsonObject = withContext(Dispatchers.IO) {
        val body = gson.toJson(
            mapOf(
                "system_instruction" to mapOf("parts" to listOf(mapOf("text" to system))),
                "contents" to listOf(mapOf("role" to "user", "parts" to parts)),
                "generationConfig" to mapOf(
                    "temperature" to 0.2,
                    "maxOutputTokens" to maxTokens,
                    "responseMimeType" to "application/json"
                )
            )
        ).toRequestBody("application/json; charset=utf-8".toMediaType())

        var lastError: Exception? = null
        for (model in listOf("gemini-2.5-flash", "gemini-1.5-flash")) {
            try {
                val request = Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent")
                    .header("x-goog-api-key", apiKey)
                    .post(body)
                    .build()
                client.newCall(request).execute().use { response ->
                    val text = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        lastError = Exception("Gemini ($model) HTTP ${response.code}")
                        return@use
                    }
                    val out = gson.fromJson(text, JsonObject::class.java)
                        .getAsJsonArray("candidates")?.get(0)?.asJsonObject
                        ?.getAsJsonObject("content")?.getAsJsonArray("parts")?.get(0)?.asJsonObject
                        ?.get("text")?.asString.orEmpty()
                    val start = out.indexOf('{')
                    val end = out.lastIndexOf('}')
                    if (start >= 0 && end > start) {
                        return@withContext gson.fromJson(out.substring(start, end + 1), JsonObject::class.java)
                    }
                    lastError = Exception("Resposta da IA sem JSON")
                }
            } catch (e: Exception) {
                lastError = e
            }
        }
        throw lastError ?: Exception("Falha ao consultar a IA")
    }

    suspend fun compareRoomDirect(apiKey: String, req: com.imobweb.app.model.CompareRoomRequest): Result<com.imobweb.app.model.AiRoomResult> = runCatching {
        val parts = mutableListOf<Map<String, Any>>()
        req.entradaPhotos.take(3).forEachIndexed { i, p -> imagePart(p)?.let { parts += mapOf("text" to "ENTRADA — foto $i:"); parts += it } }
        req.saidaPhotos.take(3).forEachIndexed { i, p -> imagePart(p)?.let { parts += mapOf("text" to "SAÍDA — foto $i:"); parts += it } }
        fun side(s: com.imobweb.app.model.CompareSide?) = mapOf(
            "itens" to s?.items.orEmpty(), "moveis" to s?.furniture.orEmpty(), "avarias" to s?.damages.orEmpty(),
            "conservação" to s?.checklist.orEmpty(), "observações" to s?.observations.orEmpty()
        )
        parts += mapOf("text" to "Cômodo: ${req.name}\nDados (JSON):\n${gson.toJson(mapOf("entrada" to side(req.entrada), "saída" to side(req.saida)))}\n\nCompare entrada e saída.")
        val json = generateJson(apiKey, parts, SYSTEM_ROOM, 2500)
        val diffs = json.getAsJsonArray("differences")?.mapNotNull { el ->
            runCatching { gson.fromJson(el, com.imobweb.app.model.AiDiff::class.java).sanitized() }.getOrNull()
        }.orEmpty().filter { it.description.isNotBlank() }.take(8)
        com.imobweb.app.model.AiRoomResult(json.get("summary")?.asString.orEmpty().take(400), diffs)
    }

    suspend fun compareSummaryDirect(apiKey: String, req: com.imobweb.app.model.CompareSummaryRequest): Result<Pair<String, List<String>>> = runCatching {
        val rooms = req.rooms.take(40).map { r ->
            mapOf("cômodo" to r.name, "resumo" to r.summary,
                "diferenças" to r.differences.take(8).map { mapOf("tipo" to it.type, "descrição" to it.description, "gravidade" to it.severity) })
        }
        val json = generateJson(apiKey, listOf(mapOf("text" to "Resultados por cômodo (JSON):\n${gson.toJson(rooms)}")), SYSTEM_SUMMARY, 1200)
        val attention = json.getAsJsonArray("attention")?.mapNotNull { runCatching { it.asString }.getOrNull() }.orEmpty().take(6)
        json.get("summary")?.asString.orEmpty().take(1500) to attention
    }
}

data class AiInspectionResult(
    val furniture: List<String> = emptyList(),
    val damages: List<String> = emptyList(),
    val problems: List<String> = emptyList(),
    val observations: List<String> = emptyList()
)
