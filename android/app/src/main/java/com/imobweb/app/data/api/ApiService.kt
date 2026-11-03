package com.imobweb.app.data.api

import com.imobweb.app.BuildConfig
import com.imobweb.app.model.*
import okhttp3.OkHttpClient
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface ApiService {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("/api/admin/vistoria/analyze")
    suspend fun analyze(@Body request: AnalyzeRequest): Response<AnalyzeResponse>

    @POST("/api/admin/vistoria/sync")
    suspend fun syncVistoria(@Body request: SyncRequest): Response<SyncSaveResponse>

    /** Sem [id]: resumo (sem cômodos/fotos). Com [id]: a vistoria completa. */
    @GET("/api/admin/vistoria/list")
    suspend fun listVistorias(@Query("id") id: String? = null): Response<SyncListResponse>

    @DELETE("/api/admin/vistoria/sync")
    suspend fun deleteVistoria(@Query("id") id: String): Response<ResponseBody>

    companion object {
        private val instances = mutableMapOf<String, ApiService>()

        @Synchronized
        fun getInstance(baseUrl: String, token: String? = null): ApiService {
            val key = "$baseUrl|${token ?: "no-auth"}"
            return instances.getOrPut(key) { create(baseUrl, token) }
        }

        @Synchronized
        fun resetInstance(baseUrl: String? = null) {
            if (baseUrl != null) instances.keys.removeAll { it.startsWith(baseUrl) } else instances.clear()
        }

        /** Um único pool de conexões para todas as instâncias. */
        private val baseClient: OkHttpClient by lazy {
            OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(90, TimeUnit.SECONDS)
                // Sincronização envia fotos em base64: dá mais tempo para upload em rede móvel
                .writeTimeout(180, TimeUnit.SECONDS)
                .apply {
                    // Nunca logar corpo: contém CPFs, fotos e o token. Em release, nada.
                    if (BuildConfig.DEBUG) {
                        addInterceptor(HttpLoggingInterceptor().apply {
                            level = HttpLoggingInterceptor.Level.BASIC
                        })
                    }
                }
                .build()
        }

        private fun create(baseUrl: String, token: String?): ApiService {
            val client = baseClient.newBuilder()
                .addInterceptor { chain ->
                    val builder = chain.request().newBuilder()
                    token?.let { builder.header("Authorization", "Bearer $it") }
                    chain.proceed(builder.build())
                }
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl.trimEnd('/') + "/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
}
