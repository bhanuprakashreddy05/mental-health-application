package com.example.data.repository

import android.util.Log
import com.example.BuildConfig
import com.example.data.database.*
import com.example.data.network.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class PeaceMindRepository(private val db: PeaceMindDatabase) {

    private val userDao = db.userDao()
    private val moodDao = db.moodDao()
    private val diaryDao = db.diaryDao()
    private val exerciseProgressDao = db.exerciseProgressDao()
    private val chatHistoryDao = db.chatHistoryDao()

    // --- Authentication Flow & User Profiles ---
    val loggedInUser: Flow<UserEntity?> = userDao.getLoggedInUser()

    suspend fun registerUser(name: String, email: String, passwordSecret: String): Result<UserEntity> = withContext(Dispatchers.IO) {
        try {
            val existing = userDao.getUserByEmail(email)
            if (existing != null) {
                return@withContext Result.failure(Exception("An account with this email already exists."))
            }
            val uid = "user_" + System.currentTimeMillis()
            val newUser = UserEntity(
                uid = uid,
                name = name,
                email = email,
                password = passwordSecret,
                isLoggedIn = true
            )
            userDao.logoutAll()
            userDao.insertUser(newUser)
            Result.success(newUser)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun loginUser(email: String, passwordSecret: String): Result<UserEntity> = withContext(Dispatchers.IO) {
        try {
            val user = userDao.getUserByEmail(email)
            if (user == null) {
                return@withContext Result.failure(Exception("No account found with this email. Please register first."))
            }
            if (user.password != passwordSecret) {
                return@withContext Result.failure(Exception("Incorrect password. Please try again."))
            }
            userDao.logoutAll()
            val loggedIn = user.copy(isLoggedIn = true)
            userDao.insertUser(loggedIn)
            Result.success(loggedIn)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun autoLoginDemoUser() = withContext(Dispatchers.IO) {
        val currentlyLoggedIn = userDao.getLoggedInUserSnapshot()
        if (currentlyLoggedIn == null) {
            val existingActive = userDao.getUserByEmail("demo@peacemind.com")
            if (existingActive == null) {
                val demo = UserEntity(
                    uid = "demo_uid",
                    name = "Alex Stone",
                    email = "demo@peacemind.com",
                    password = "demo",
                    profileImage = "avatar_1",
                    isLoggedIn = true
                )
                userDao.insertUser(demo)
            }
        }
    }

    suspend fun resetPassword(email: String, passwordSecret: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val user = userDao.getUserByEmail(email)
                ?: return@withContext Result.failure(Exception("No account found registered with $email."))
            val updated = user.copy(password = passwordSecret)
            userDao.insertUser(updated)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProfile(uid: String, name: String, email: String, avatar: String?): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val existing = userDao.getUserByUid(uid) ?: return@withContext Result.failure(Exception("User not found"))
            val updated = existing.copy(name = name, email = email, profileImage = avatar)
            userDao.insertUser(updated)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        userDao.logoutAll()
    }

    // --- Mood Tracking Module ---
    fun getMoodLogs(uid: String): Flow<List<MoodEntity>> {
        return moodDao.getMoodsForUser(uid)
    }

    suspend fun saveMood(
        uid: String,
        mood: String,
        note: String,
        stressLevel: Int,
        energyLevel: Int,
        sleepRating: Int
    ) = withContext(Dispatchers.IO) {
        val entry = MoodEntity(
            uid = uid,
            mood = mood,
            note = note,
            stressLevel = stressLevel,
            energyLevel = energyLevel,
            sleepRating = sleepRating
        )
        moodDao.insertMood(entry)
    }

    suspend fun deleteMood(id: Int) = withContext(Dispatchers.IO) {
        moodDao.deleteMoodById(id)
    }

    // --- Journal / Diary Entries ---
    fun getDiaries(uid: String, query: String = ""): Flow<List<DiaryEntity>> {
        return if (query.isEmpty()) {
            diaryDao.getDiariesForUser(uid)
        } else {
            diaryDao.searchDiaries(uid, query)
        }
    }

    suspend fun saveDiary(
        id: Int = 0,
        uid: String,
        title: String,
        content: String,
        moodTag: String
    ) = withContext(Dispatchers.IO) {
        val entry = DiaryEntity(
            id = id,
            uid = uid,
            title = title,
            content = content,
            moodTag = moodTag
        )
        diaryDao.insertDiary(entry)
    }

    suspend fun deleteDiary(id: Int) = withContext(Dispatchers.IO) {
        diaryDao.deleteDiaryById(id)
    }

    // --- Exercises Progress Module ---
    fun getCompletedProgress(uid: String): Flow<List<ExerciseProgressEntity>> {
        return exerciseProgressDao.getProgressForUser(uid)
    }

    suspend fun completeExercise(uid: String, exerciseId: String) = withContext(Dispatchers.IO) {
        val entry = ExerciseProgressEntity(uid = uid, exerciseId = exerciseId)
        exerciseProgressDao.insertProgress(entry)
    }

    // --- AI Companion Module & Multi-Turn Gemini Dialogue ---
    fun getChatMessages(uid: String, personality: String): Flow<List<ChatHistoryEntity>> {
        return chatHistoryDao.getChatHistory(uid, personality)
    }

    suspend fun clearChatHistory(uid: String, personality: String) = withContext(Dispatchers.IO) {
        chatHistoryDao.clearHistory(uid, personality)
    }

    suspend fun sendChatMessage(
        uid: String,
        messageText: String,
        personality: String
    ): String = withContext(Dispatchers.IO) {
        // 1. Save user's message
        val userChat = ChatHistoryEntity(
            uid = uid,
            message = messageText,
            sender = "USER",
            personality = personality
        )
        chatHistoryDao.insertChat(userChat)

        // Setup System Instruction based on personality
        val systemPrompt = when (personality) {
            "Supportive Friend" -> {
                "You are a warm, kind, and supportive close friend named PeaceCompanion. " +
                "Focus on warmth, comfort, and listening actively. Ask how their day is and offer emotional comfort. " +
                "Never provide medical/psychiatric diagnoses. Suggest journal writing, self-care, or light exercises if they feel down."
            }
            "Motivational Coach" -> {
                "You are PeaceCoach, an enthusiastic, caring, and highly encouraging motivational coach. " +
                "Inject optimism and positive energy. Focus on dynamic actions, setting gentle physical or emotional goals, " +
                "sharing positive affirmations, and establishing tiny, positive habit streaks. Never diagnose."
            }
            "Calm Listener" -> {
                "You are PeaceSpace, a reassuring, peaceful, and non-judgmental calm listener. " +
                "Focus heavily on reflective, empathetic listening (e.g. 'It sounds like you are feeling...', 'Tell me more about...'). " +
                "Keep responses moderate in length, relaxing, and focused on validating their emotions. Never diagnose."
            }
            "Mindfulness Guide" -> {
                "You are PeaceZen, a highly serene, tranquil, and centered mindfulness guide. " +
                "Recommend breathing routines, physical grounding practices (like the 5-4-3-2-1 technique), " +
                "and progressive body scans. Guide them step-by-step through calm mental visualizations. Never diagnose."
            }
            else -> "You are a gentle, supportive mental wellness assistant. Encourage self-care, journal writing, and mindfulness. Never diagnose."
        }

        val groqApiKey = BuildConfig.GROQ_API_KEY
        val useGroq = groqApiKey.isNotEmpty() && groqApiKey != "MY_GROQ_API_KEY"

        if (useGroq) {
            try {
                val bearerToken = "Bearer $groqApiKey"
                val request = GroqChatRequest(
                    model = "llama3-8b-8192",
                    messages = listOf(
                        GroqMessage(role = "system", content = systemPrompt),
                        GroqMessage(role = "user", content = messageText)
                    ),
                    temperature = 0.7f
                )
                val response = GroqClient.service.getChatCompletion(bearerToken, request)
                val responseText = response.choices?.firstOrNull()?.message?.content
                    ?: "I am listening and support you. Take a brief deep breath and let's go on."

                val aiChat = ChatHistoryEntity(
                    uid = uid,
                    message = responseText,
                    sender = "AI",
                    personality = personality
                )
                chatHistoryDao.insertChat(aiChat)
                return@withContext responseText
            } catch (e: Exception) {
                Log.e("PeaceMindRepository", "Groq query failed, falling back to Gemini", e)
            }
        }

        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            val fallback = "I'm here for you! (Please make sure your Gemini API key is configured in the AI Studio Secrets panel)."
            val aiChat = ChatHistoryEntity(
                uid = uid,
                message = fallback,
                sender = "AI",
                personality = personality
            )
            chatHistoryDao.insertChat(aiChat)
            return@withContext fallback
        }

        try {
            val request = GenerateContentRequest(
                contents = listOf(
                    Content(
                        role = "user",
                        parts = listOf(Part(text = messageText))
                    )
                ),
                systemInstruction = Content(
                    parts = listOf(Part(text = systemPrompt))
                )
            )

            val apiResponse = GeminiClient.service.generateContent(apiKey, request)
            val responseText = apiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: "I am listening and support you. Take a brief deep breath and let's go on."

            // Save AI message response
            val aiChat = ChatHistoryEntity(
                uid = uid,
                message = responseText,
                sender = "AI",
                personality = personality
            )
            chatHistoryDao.insertChat(aiChat)

            responseText
        } catch (e: Exception) {
            Log.e("PeaceMindRepository", "Gemini error", e)
            val failureMessage = "I'm listening. Sometimes the connection is a bit heavy, but remember: you are strong, and you are doing your best. Let's take a deep breath together."
            val aiChat = ChatHistoryEntity(
                uid = uid,
                message = failureMessage,
                sender = "AI",
                personality = personality
            )
            chatHistoryDao.insertChat(aiChat)
            failureMessage
        }
    }
}
