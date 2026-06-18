package com.example.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val uid: String,
    val name: String,
    val email: String,
    val password: String = "secret",
    val profileImage: String? = null,
    val isLoggedIn: Boolean = false
)

@Entity(tableName = "moods")
data class MoodEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val uid: String,
    val mood: String, // String representation like "😄 Happy", "😔 Sad"
    val note: String,
    val stressLevel: Int, // 1 to 10
    val energyLevel: Int, // 1 to 10
    val sleepRating: Int, // 1 to 5
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "diary_entries")
data class DiaryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val uid: String,
    val title: String,
    val content: String,
    val moodTag: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "exercise_progress")
data class ExerciseProgressEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val uid: String,
    val exerciseId: String,
    val completed: Boolean = true,
    val completionDate: Long = System.currentTimeMillis()
)

@Entity(tableName = "chat_history")
data class ChatHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val uid: String,
    val message: String,
    val sender: String, // "USER" or "AI"
    val personality: String, // Supportive Friend, Motivational Coach, Calm Listener, Mindfulness Guide
    val timestamp: Long = System.currentTimeMillis()
)
