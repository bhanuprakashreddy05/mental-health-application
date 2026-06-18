package com.example.ui.screens

import androidx.activity.compose.BackHandler
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PeacePrimary
import com.example.ui.viewmodel.PeaceMindViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainContainer(
    viewModel: PeaceMindViewModel,
    onLogoutNavigate: () -> Unit
) {
    var activeTab by remember { mutableStateOf("home") } // "home", "mood", "diary", "chat", "exercises", "settings"
    var previousTab by remember { mutableStateOf("home") }
    val context = LocalContext.current

    // Keep track of the last active tab when we're not in the settings page
    LaunchedEffect(activeTab) {
        if (activeTab != "settings") {
            previousTab = activeTab
        }
    }

    BackHandler(enabled = activeTab != "home") {
        if (activeTab == "settings") {
            activeTab = previousTab
        } else {
            activeTab = "home"
        }
    }

    // Observe ViewModel notifications and display system toast feedback safely
    val successMsg by viewModel.tempSuccessMessage.collectAsState()
    val errorMsg by viewModel.tempErrorMessage.collectAsState()

    LaunchedEffect(successMsg) {
        successMsg?.let {
            Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            viewModel.clearNotifications()
        }
    }

    LaunchedEffect(errorMsg) {
        errorMsg?.let {
            Toast.makeText(context, it, Toast.LENGTH_LONG).show()
            viewModel.clearNotifications()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = when (activeTab) {
                            "home" -> "Peace Mind"
                            "mood" -> "Mood Tracker"
                            "diary" -> "Diary Journal"
                            "chat" -> "AI Peace Space"
                            "exercises" -> "Self-Care Gym"
                            else -> "Profile Settings"
                        },
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                },
                navigationIcon = {
                    if (activeTab == "settings") {
                        IconButton(
                            onClick = { activeTab = previousTab },
                            modifier = Modifier.testTag("top_bar_back_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Go Back",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                },
                actions = {
                    if (activeTab != "settings") {
                        IconButton(
                            onClick = { activeTab = "settings" },
                            modifier = Modifier.testTag("top_bar_settings_button")
                        ) {
                            Icon(Icons.Default.Settings, contentDescription = "Open Settings")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            if (activeTab != "settings") {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp,
                    modifier = Modifier.testTag("bottom_nav_bar")
                ) {
                    // Home Tab
                    NavigationBarItem(
                        selected = activeTab == "home",
                        onClick = { activeTab = "home" },
                        icon = { Icon(imageVector = if (activeTab == "home") Icons.Default.Spa else Icons.Outlined.Spa, contentDescription = "Dashboard") },
                        label = { Text("Home", fontSize = 11.sp) },
                        modifier = Modifier.testTag("nav_home")
                    )

                    // Mood Tab
                    NavigationBarItem(
                        selected = activeTab == "mood",
                        onClick = { activeTab = "mood" },
                        icon = { Icon(imageVector = if (activeTab == "mood") Icons.Default.AddReaction else Icons.Outlined.AddReaction, contentDescription = "Mood") },
                        label = { Text("Mood", fontSize = 11.sp) },
                        modifier = Modifier.testTag("nav_mood")
                    )

                    // Diary Tab
                    NavigationBarItem(
                        selected = activeTab == "diary",
                        onClick = { activeTab = "diary" },
                        icon = { Icon(imageVector = if (activeTab == "diary") Icons.Default.EditNote else Icons.Outlined.EditNote, contentDescription = "Diary") },
                        label = { Text("Diary", fontSize = 11.sp) },
                        modifier = Modifier.testTag("nav_diary")
                    )

                    // AI Companion Tab
                    NavigationBarItem(
                        selected = activeTab == "chat",
                        onClick = { activeTab = "chat" },
                        icon = { Icon(imageVector = if (activeTab == "chat") Icons.Default.Psychology else Icons.Outlined.Psychology, contentDescription = "Companion") },
                        label = { Text("AI Partner", fontSize = 11.sp) },
                        modifier = Modifier.testTag("nav_chat")
                    )

                    // Exercises Tab
                    NavigationBarItem(
                        selected = activeTab == "exercises",
                        onClick = { activeTab = "exercises" },
                        icon = { Icon(imageVector = if (activeTab == "exercises") Icons.Default.DirectionsRun else Icons.Outlined.DirectionsRun, contentDescription = "Exercises") },
                        label = { Text("Gym", fontSize = 11.sp) },
                        modifier = Modifier.testTag("nav_exercises")
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = activeTab,
                transitionSpec = {
                    fadeIn(animationSpec = tween(220)) togetherWith fadeOut(animationSpec = tween(220))
                },
                label = "ScreenTransitionAnimation"
            ) { targetTab ->
                when (targetTab) {
                    "home" -> DashboardScreen(
                        viewModel = viewModel,
                        onQuickActionSelect = { selectedTab -> activeTab = selectedTab },
                        onAvatarClick = { activeTab = "settings" }
                    )
                    "mood" -> MoodScreen(viewModel = viewModel)
                    "diary" -> DiaryScreen(viewModel = viewModel)
                    "chat" -> AiCompanionScreen(viewModel = viewModel)
                    "exercises" -> ExercisesScreen(viewModel = viewModel)
                    "settings" -> SettingsScreen(
                        viewModel = viewModel,
                        onLogoutNavigate = onLogoutNavigate,
                        onBackClick = { activeTab = previousTab }
                    )
                }
            }
        }
    }
}
