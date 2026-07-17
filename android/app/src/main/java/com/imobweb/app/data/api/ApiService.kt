package com.imobweb.app.data.api

import com.imobweb.app.model.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

interface ApiService {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("/api/admin/vistoria/analyze")
    suspend fun analyze(@Body request: AnalyzeRequest): Response<AnalyzeResponse>

    @POST("/api/admin/vistoria/generate-pdf")
    suspend fun generatePdf(@Body request: PdfGenerateRequest): Response<PdfGenerateResponse>

    companion object {
        private var instance: ApiService? = null

        fun getInstance(baseUrl: String, token: String? = null): ApiService {
            return instance ?: synchronized(this) {
                instance ?: create(baseUrl, token).also { instance = it }
            }
        }

        fun resetInstance() { instance = null }

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
