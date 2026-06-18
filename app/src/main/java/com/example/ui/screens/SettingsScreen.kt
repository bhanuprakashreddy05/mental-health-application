package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.PeaceMindViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: PeaceMindViewModel,
    onLogoutNavigate: () -> Unit,
    onBackClick: (() -> Unit)? = null
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val darkModeEnabled by viewModel.darkModeEnabled.collectAsState()
    val notificationsEnabled by viewModel.notificationsEnabled.collectAsState()
    val languageSelected by viewModel.languagesEnabled.collectAsState()

    val scrollState = rememberScrollState()

    // Local profile editing states
    var isEditingProfile by remember { mutableStateOf(false) }
    var editName by remember { mutableStateOf(currentUser?.name ?: "") }
    var editEmail by remember { mutableStateOf(currentUser?.email ?: "") }
    var selectedAvatar by remember { mutableStateOf(currentUser?.profileImage ?: "avatar_1") }

    val avatars = listOf("avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_5", "avatar_6")
    val avatarEmojiMap = mapOf(
        "avatar_1" to "😄",
        "avatar_2" to "🍃",
        "avatar_3" to "☀️",
        "avatar_4" to "🌊",
        "avatar_5" to "🌸",
        "avatar_6" to "🦉"
    )

    // Sync state when currentUser is loaded
    LaunchedEffect(currentUser) {
        currentUser?.let {
            editName = it.name
            editEmail = it.email
            selectedAvatar = it.profileImage ?: "avatar_1"
        }
    }

    // Modal dialogue states
    var showTermsModal by remember { mutableStateOf(false) }
    var showPrivacyModal by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            if (onBackClick != null) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.testTag("settings_back_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Go Back",
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                }
            }
            Text(
                text = "App Hub & Tuning",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        // --- SECTION 1: Profile Editing Card ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "My Identity",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onBackground
                    )

                    TextButton(
                        onClick = {
                            if (isEditingProfile) {
                                // Save profile changes
                                viewModel.updateProfile(editName, editEmail, selectedAvatar)
                            }
                            isEditingProfile = !isEditingProfile
                        },
                        modifier = Modifier.testTag("edit_profile_toggle")
                    ) {
                        Text(if (isEditingProfile) "Save Profile" else "Edit details")
                    }
                }

                // Profile Display / Edit Fields
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Surface(
                        modifier = Modifier.size(60.dp),
                        shape = CircleShape,
                        color = PeacePrimary.copy(alpha = 0.2f)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(text = avatarEmojiMap[selectedAvatar] ?: "😄", fontSize = 32.sp)
                        }
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        if (!isEditingProfile) {
                            Text(text = currentUser?.name ?: "Valued Seeker", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(text = currentUser?.email ?: "", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        } else {
                            OutlinedTextField(
                                value = editName,
                                onValueChange = { editName = it },
                                label = { Text("Display Name") },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("settings_name_input"),
                                shape = RoundedCornerShape(12.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = editEmail,
                                onValueChange = { editEmail = it },
                                label = { Text("Email Address") },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("settings_email_input"),
                                shape = RoundedCornerShape(12.dp)
                            )
                        }
                    }
                }

                if (isEditingProfile) {
                    Column {
                        Text(text = "Choose Profile Avatar", fontSize = 12.sp, modifier = Modifier.padding(bottom = 6.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(avatars) { av ->
                                val isSelected = selectedAvatar == av
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(CircleShape)
                                        .background(if (isSelected) PeacePrimary.copy(alpha = 0.25f) else Color.Transparent)
                                        .border(
                                            width = if (isSelected) 2.dp else 1.dp,
                                            color = if (isSelected) PeacePrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                                            shape = CircleShape
                                        )
                                        .clickable { selectedAvatar = av }
                                        .testTag("avatar_select_$av"),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = avatarEmojiMap[av] ?: "😄", fontSize = 22.sp)
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- SECTION 2: General Tuning Controls ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(
                    text = "App Integration Tuning",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )

                // Dark Mode Switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Brightness4, contentDescription = null, tint = SleepColor)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Serene Dark Mode", fontSize = 14.sp)
                    }
                    Switch(
                        checked = darkModeEnabled,
                        onCheckedChange = { viewModel.toggleDarkMode() },
                        modifier = Modifier.testTag("dark_mode_switch")
                    )
                }

                Divider()

                // Notifications Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Notifications, contentDescription = null, tint = PeacePrimary)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Daily Affirmation Reminders", fontSize = 14.sp)
                    }
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { viewModel.toggleNotifications() },
                        modifier = Modifier.testTag("reminders_switch")
                    )
                }

                Divider()

                // Language selection
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Language, contentDescription = null, tint = PeaceSecondary)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "App Language", fontSize = 14.sp)
                    }

                    // A Row of toggle buttons or simple indicator
                    Text(
                        text = languageSelected,
                        fontWeight = FontWeight.Bold,
                        color = PeacePrimary,
                        modifier = Modifier
                            .clickable {
                                viewModel.setLanguage(if (languageSelected == "English") "Spanish" else "English")
                            }
                            .testTag("language_toggle")
                    )
                }
            }
        }

        // --- SECTION 3: Legal & Credentials ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(
                    text = "Account Legal Space",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPrivacyModal = true }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Security, contentDescription = null, tint = Color.Gray)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Privacy Policy", fontSize = 14.sp)
                    }
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
                }

                Divider()

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showTermsModal = true }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Assignment, contentDescription = null, tint = Color.Gray)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Terms of Service", fontSize = 14.sp)
                    }
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
                }
            }
        }

        // --- Log out and delete indicators ---
        Button(
            onClick = {
                viewModel.logout {
                    onLogoutNavigate()
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .testTag("logout_button"),
            colors = ButtonDefaults.buttonColors(containerColor = StressRed.copy(alpha = 0.15f)),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, StressRed)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.ExitToApp, contentDescription = null, tint = StressRed)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Logout Securely", color = StressRed, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }

    // --- Terms Dialog ---
    if (showTermsModal) {
        AlertDialog(
            onDismissRequest = { showTermsModal = false },
            confirmButton = {
                TextButton(onClick = { showTermsModal = false }) { Text("Acknowledge") }
            },
            title = { Text("Terms of Service") },
            text = {
                Text(
                    text = "Welcome to Peace Mind. By utilizing this wellness app, you acknowledge that all data represents simulated mindfulness guidance. We strive to help you find relaxation, but remember that Peace Mind and its AI Companions DO NOT provide clinical medical or psychological diagnoses. Please consult a licensed professional for certified clinical treatment."
                )
            }
        )
    }

    // --- Privacy Dialog ---
    if (showPrivacyModal) {
        AlertDialog(
            onDismissRequest = { showPrivacyModal = false },
            confirmButton = {
                TextButton(onClick = { showPrivacyModal = false }) { Text("Deeply Understand") }
            },
            title = { Text("Privacy Policy") },
            text = {
                Text(
                    text = "Your safety and cognitive boundaries are extremely important. Peace Mind operates as an offline-first container, utilizing secure SQLite databases compiled inside your local device boundaries. All chat contexts are preserved locally. External Gemini query text is evaluated with general token parameters securely, and absolutely no identifiers are packaged or leaked to advertising agencies."
                )
            }
        )
    }
}
