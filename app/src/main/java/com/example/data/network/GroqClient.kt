package com.example.data.network

import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

@JsonClass(generateAdapter = true)
data class GroqMessage(
    val role: String,
    val content: String
)

@JsonClass(generateAdapter = true)
data class GroqChatRequest(
    val model: String,
    val messages: List<GroqMessage>,
    val temperature: Float = 0.7f
)

@JsonClass(generateAdapter = true)
data class GroqChatChoice(
    val index: Int? = null,
    val message: GroqMessage? = null,
    val finish_reason: String? = null
)

@JsonClass(generateAdapter = true)
data class GroqChatResponse(
    val choices: List<GroqChatChoice>? = null
)

interface GroqApiService {
    @POST("openai/v1/chat/completions")
    suspend fun getChatCompletion(
        @Header("Authorization") bearerToken: String,
        @Body request: GroqChatRequest
    ): GroqChatResponse
}

object GroqClient {
    private const val BASE_URL = "https://api.groq.com/"

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val service: GroqApiService = retrofit.create(GroqApiService::class.java)
}
