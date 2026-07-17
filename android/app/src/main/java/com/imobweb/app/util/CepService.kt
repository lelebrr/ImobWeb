package com.imobweb.app.util

import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.Request
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

data class CepResult(
    val cep: String = "",
    val logradouro: String = "",
    val complemento: String = "",
    val bairro: String = "",
    val localidade: String = "",
    val uf: String = "",
    val ibge: String = "",
    val gia: String = "",
    val ddd: String = "",
    val siafi: String = "",
    val erro: Boolean = false
)

object CepService {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()

    suspend fun lookup(cep: String): Result<CepResult> = withContext(Dispatchers.IO) {
        try {
            val digits = cep.filter { it.isDigit() }
            if (digits.length != 8) {
                return@withContext Result.failure(Exception("CEP deve ter 8 dígitos"))
            }

            val request = Request.Builder()
                .url("https://viacep.com.br/ws/$digits/json/")
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Erro ao consultar CEP: ${response.code()}"))
            }

            val body = response.body?.string() ?: return@withContext Result.failure(Exception("Resposta vazia"))
            val result = gson.fromJson(body, CepResult::class.java)

            if (result.erro) {
                return@withContext Result.failure(Exception("CEP não encontrado"))
            }

            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
