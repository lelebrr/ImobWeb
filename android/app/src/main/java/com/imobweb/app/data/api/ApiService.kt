package com.imobweb.app.data.api

import com.imobweb.app.model.*
import okhttp3.OkHttpClient
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

    @POST("/api/admin/vistoria/generate-pdf")
    suspend fun generatePdf(@Body request: PdfGenerateRequest): Response<PdfGenerateResponse>

    @POST("/api/admin/vistoria/sync")
    suspend fun syncVistoria(@Body request: SyncRequest): Response<SyncSaveResponse>

    @GET("/api/admin/vistoria/list")
    suspend fun listVistorias(): Response<SyncListResponse>

    companion object {
        private var instances = mutableMapOf<String, ApiService>()

        fun getInstance(baseUrl: String, token: String? = null): ApiService {
            val key = "$baseUrl|${token ?: "no-auth"}"
            return instances.getOrPut(key) { create(baseUrl, token) }
        }

        fun resetInstance(baseUrl: String? = null) {
            if (baseUrl != null) {
                instances.keys.removeAll { it.startsWith(baseUrl) }
            } else {
                instances.clear()
            }
        }

        private fun create(baseUrl: String, token: String?): ApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .addInterceptor { chain ->
                    val original = chain.request()
                    val builder = original.newBuilder()
                        .header("Content-Type", "application/json")
                    token?.let { builder.header("Authorization", "Bearer $it") }
                    chain.proceed(builder.build())
                }
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
}
