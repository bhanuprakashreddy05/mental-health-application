package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        UserEntity::class,
        MoodEntity::class,
        DiaryEntity::class,
        ExerciseProgressEntity::class,
        ChatHistoryEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class PeaceMindDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun moodDao(): MoodDao
    abstract fun diaryDao(): DiaryDao
    abstract fun exerciseProgressDao(): ExerciseProgressDao
    abstract fun chatHistoryDao(): ChatHistoryDao

    companion object {
        @Volatile
        private var INSTANCE: PeaceMindDatabase? = null

        fun getDatabase(context: Context): PeaceMindDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PeaceMindDatabase::class.java,
                    "peace_mind_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
