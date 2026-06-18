package com.example.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE isLoggedIn = 1 LIMIT 1")
    fun getLoggedInUser(): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE isLoggedIn = 1 LIMIT 1")
    suspend fun getLoggedInUserSnapshot(): UserEntity?

    @Query("SELECT * FROM users WHERE email = :email LIMIT 1")
    suspend fun getUserByEmail(email: String): UserEntity?

    @Query("SELECT * FROM users WHERE uid = :uid LIMIT 1")
    suspend fun getUserByUid(uid: String): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Query("UPDATE users SET isLoggedIn = 0")
    suspend fun logoutAll()

    @Query("UPDATE users SET isLoggedIn = 1 WHERE uid = :uid")
    suspend fun loginUser(uid: String)
}

@Dao
interface MoodDao {
    @Query("SELECT * FROM moods WHERE uid = :uid ORDER BY timestamp DESC")
    fun getMoodsForUser(uid: String): Flow<List<MoodEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMood(mood: MoodEntity)

    @Query("DELETE FROM moods WHERE id = :id")
    suspend fun deleteMoodById(id: Int)
}

@Dao
interface DiaryDao {
    @Query("SELECT * FROM diary_entries WHERE uid = :uid ORDER BY timestamp DESC")
    fun getDiariesForUser(uid: String): Flow<List<DiaryEntity>>

    @Query("SELECT * FROM diary_entries WHERE uid = :uid AND (title LIKE '%' || :searchQuery || '%' OR content LIKE '%' || :searchQuery || '%') ORDER BY timestamp DESC")
    fun searchDiaries(uid: String, searchQuery: String): Flow<List<DiaryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDiary(diary: DiaryEntity)

    @Query("DELETE FROM diary_entries WHERE id = :id")
    suspend fun deleteDiaryById(id: Int)
}

@Dao
interface ExerciseProgressDao {
    @Query("SELECT * FROM exercise_progress WHERE uid = :uid ORDER BY completionDate DESC")
    fun getProgressForUser(uid: String): Flow<List<ExerciseProgressEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProgress(progress: ExerciseProgressEntity)
}

@Dao
interface ChatHistoryDao {
    @Query("SELECT * FROM chat_history WHERE uid = :uid AND personality = :personality ORDER BY timestamp ASC")
    fun getChatHistory(uid: String, personality: String): Flow<List<ChatHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChat(chat: ChatHistoryEntity)

    @Query("DELETE FROM chat_history WHERE uid = :uid AND personality = :personality")
    suspend fun clearHistory(uid: String, personality: String)
}
