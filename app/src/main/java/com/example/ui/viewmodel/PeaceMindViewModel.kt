package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.database.ChatHistoryEntity
import com.example.data.database.DiaryEntity
import com.example.data.database.ExerciseProgressEntity
import com.example.data.database.MoodEntity
import com.example.data.database.PeaceMindDatabase
import com.example.data.database.UserEntity
import com.example.data.repository.PeaceMindRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class PeaceMindViewModel(application: Application) : AndroidViewModel(application) {

    private val database = PeaceMindDatabase.getDatabase(application)
    private val repository = PeaceMindRepository(database)

    // --- Core Dynamic State Streams ---
    val currentUser: StateFlow<UserEntity?> = repository.loggedInUser
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    val moodLogs: StateFlow<List<MoodEntity>> = currentUser
        .flatMapLatest { user ->
            if (user != null) repository.getMoodLogs(user.uid) else flowOf(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val diaryEntries: StateFlow<List<DiaryEntity>> = combine(currentUser, _searchQuery) { user, query ->
        user to query
    }.flatMapLatest { (user, query) ->
        if (user != null) repository.getDiaries(user.uid, query) else flowOf(emptyList())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedPersonality = MutableStateFlow("Supportive Friend")
    val selectedPersonality: StateFlow<String> = _selectedPersonality.asStateFlow()

    val chatMessages: StateFlow<List<ChatHistoryEntity>> = combine(currentUser, _selectedPersonality) { user, personality ->
        user to personality
    }.flatMapLatest { (user, personality) ->
        if (user != null) repository.getChatMessages(user.uid, personality) else flowOf(emptyList())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val completedExercises: StateFlow<List<ExerciseProgressEntity>> = currentUser
        .flatMapLatest { user ->
            if (user != null) repository.getCompletedProgress(user.uid) else flowOf(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- UI/Action States ---
    private val _isGeneratingResponse = MutableStateFlow(false)
    val isGeneratingResponse: StateFlow<Boolean> = _isGeneratingResponse.asStateFlow()

    private val _isAuthenticating = MutableStateFlow(false)
    val isAuthenticating: StateFlow<Boolean> = _isAuthenticating.asStateFlow()

    private val _tempErrorMessage = MutableStateFlow<String?>(null)
    val tempErrorMessage: StateFlow<String?> = _tempErrorMessage.asStateFlow()

    private val _tempSuccessMessage = MutableStateFlow<String?>(null)
    val tempSuccessMessage: StateFlow<String?> = _tempSuccessMessage.asStateFlow()

    // --- App System Preferences ---
    private val _darkModeEnabled = MutableStateFlow(false)
    val darkModeEnabled: StateFlow<Boolean> = _darkModeEnabled.asStateFlow()

    private val _notificationsEnabled = MutableStateFlow(true)
    val notificationsEnabled: StateFlow<Boolean> = _notificationsEnabled.asStateFlow()

    private val _languagesEnabled = MutableStateFlow("English")
    val languagesEnabled: StateFlow<String> = _languagesEnabled.asStateFlow()

    init {
        // Run auto login for convenient immediate access to demo user,
        // which fulfills standard guidelines and ensures immediate emulator visualization
        viewModelScope.launch {
            repository.autoLoginDemoUser()
        }
    }

    // --- Auth Actions ---
    fun register(name: String, email: String, secret: String, onSuccess: () -> Unit) {
        _isAuthenticating.value = true
        viewModelScope.launch {
            repository.registerUser(name, email, secret).onSuccess {
                _tempSuccessMessage.value = "Welcome onboard, $name!"
                _isAuthenticating.value = false
                onSuccess()
            }.onFailure {
                _tempErrorMessage.value = it.message ?: "Registration failed."
                _isAuthenticating.value = false
            }
        }
    }

    fun login(email: String, secret: String, onSuccess: () -> Unit) {
        _isAuthenticating.value = true
        viewModelScope.launch {
            repository.loginUser(email, secret).onSuccess {
                _tempSuccessMessage.value = "Welcome back, ${it.name}!"
                _isAuthenticating.value = false
                onSuccess()
            }.onFailure {
                _tempErrorMessage.value = it.message ?: "Authentication failed."
                _isAuthenticating.value = false
            }
        }
    }

    fun forgotPassword(email: String, secret: String, onComplete: () -> Unit) {
        _isAuthenticating.value = true
        viewModelScope.launch {
            repository.resetPassword(email, secret).onSuccess {
                _tempSuccessMessage.value = "Password recovered successfully! Temp password: '$secret'"
                _isAuthenticating.value = false
                onComplete()
            }.onFailure {
                _tempErrorMessage.value = it.message ?: "Password recovery failed."
                _isAuthenticating.value = false
            }
        }
    }

    fun logout(onSuccess: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            _tempSuccessMessage.value = "Logged out successfully"
            onSuccess()
        }
    }

    fun updateProfile(name: String, email: String, avatar: String?) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.updateProfile(user.uid, name, email, avatar).onSuccess {
                _tempSuccessMessage.value = "Profile updated beautifully!"
            }.onFailure {
                _tempErrorMessage.value = it.message ?: "Failed to save profile changes"
            }
        }
    }

    // --- Search Triggers ---
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    // --- Mood Entries Actions ---
    fun addMoodEntry(
        mood: String,
        note: String,
        stressLevel: Int,
        energyLevel: Int,
        sleepRating: Int,
        onComplete: () -> Unit
    ) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.saveMood(user.uid, mood, note, stressLevel, energyLevel, sleepRating)
            _tempSuccessMessage.value = "Mood entry saved. Deep breath, you are taking great care of yourself!"
            onComplete()
        }
    }

    fun removeMoodEntry(id: Int) {
        viewModelScope.launch {
            repository.deleteMood(id)
        }
    }

    // --- Journal / Diary Actions ---
    fun addDiaryEntry(title: String, content: String, moodTag: String, onComplete: () -> Unit) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.saveDiary(0, user.uid, title, content, moodTag)
            _tempSuccessMessage.value = "Journal entry logged successfully."
            onComplete()
        }
    }

    fun updateDiaryEntry(id: Int, title: String, content: String, moodTag: String, onComplete: () -> Unit) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.saveDiary(id, user.uid, title, content, moodTag)
            _tempSuccessMessage.value = "Journal entry updated successfully."
            onComplete()
        }
    }

    fun deleteDiaryEntry(id: Int) {
        viewModelScope.launch {
            repository.deleteDiary(id)
            _tempSuccessMessage.value = "Journal entry deleted safely."
        }
    }

    // --- Exercises Tracker Actions ---
    fun logExerciseCompletion(exerciseId: String) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.completeExercise(user.uid, exerciseId)
            _tempSuccessMessage.value = "Fantastic job completing this self-care routine!"
        }
    }

    // --- Chat Companion Actions ---
    fun setPersonality(personality: String) {
        _selectedPersonality.value = personality
    }

    fun clearChat() {
        val user = currentUser.value ?: return
        val personality = selectedPersonality.value
        viewModelScope.launch {
            repository.clearChatHistory(user.uid, personality)
            _tempSuccessMessage.value = "Chat space refreshed."
        }
    }

    fun sendChatMessage(textPrompt: String) {
        val user = currentUser.value ?: return
        if (textPrompt.trim().isEmpty()) return
        val personality = selectedPersonality.value

        viewModelScope.launch {
            _isGeneratingResponse.value = true
            repository.sendChatMessage(user.uid, textPrompt, personality)
            _isGeneratingResponse.value = false
        }
    }

    // --- Preference Adjustments ---
    fun toggleDarkMode() {
        _darkModeEnabled.value = !_darkModeEnabled.value
    }

    fun toggleNotifications() {
        _notificationsEnabled.value = !_notificationsEnabled.value
    }

    fun setLanguage(lang: String) {
        _languagesEnabled.value = lang
    }

    fun clearNotifications() {
        _tempSuccessMessage.value = null
        _tempErrorMessage.value = null
    }

    fun setErrorMessage(msg: String) {
        _tempErrorMessage.value = msg
    }

    fun setSuccessMessage(msg: String) {
        _tempSuccessMessage.value = msg
    }

    // --- Factory Class ---
    class Factory(private val application: Application) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(PeaceMindViewModel::class.java)) {
                return PeaceMindViewModel(application) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
