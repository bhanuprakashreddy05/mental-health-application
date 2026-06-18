package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.database.MoodEntity
import com.example.data.database.UserEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.PeaceMindViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: PeaceMindViewModel,
    onQuickActionSelect: (String) -> Unit, // swaps current bottom tab selection
    onAvatarClick: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val moods by viewModel.moodLogs.collectAsState()
    val diaryEntries by viewModel.diaryEntries.collectAsState()
    val completedExercises by viewModel.completedExercises.collectAsState()
    val scrollState = rememberScrollState()

    // 1. Dynamic Greeting based on time of day
    val greeting = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when (hour) {
            in 5..11 -> "Good Morning"
            in 12..16 -> "Good Afternoon"
            in 17..21 -> "Peaceful Evening"
            else -> "Gentle Night"
        }
    }

    // 2. Health & Tranquility calculation metric
    val (tranquilityPercentage, moodSummaryText) = remember(moods) {
        if (moods.isEmpty()) {
            0 to "No logs recorded today yet. Try adding an entry!"
        } else {
            val latest = moods.first()
            val sleepContribution = latest.sleepRating * 16 // up to 80
            val energyContribution = latest.energyLevel * 2 // up to 20
            val stressPenalty = (10 - latest.stressLevel) * 2 // up to 20, higher stress penalizes
            val score = ((sleepContribution + energyContribution + stressPenalty) * 100) / 120
            val cleanScore = score.coerceIn(10, 100)

            val summary = when {
                cleanScore >= 80 -> "Highly serene! Stay in this calm space."
                cleanScore >= 60 -> "Doing well. Balanced thoughts."
                cleanScore >= 40 -> "Slight tension, consider breathing exercises."
                else -> "Heavy stress detected. Let's do grounding exercises."
            }
            cleanScore to summary
        }
    }

    // 3. Dynamic lists of custom wellness content we present elegantly
    val affirmation = remember(moods) {
        val list = listOf(
            "I am worthy of peace, patience, and absolute calm.",
            "Inhale peace, exhale all your built-up expectations.",
            "You possess the strength to handle whatever this day brings.",
            "My body is a safe place to experience my emotions.",
            "Slowing down is an act of courage and self-preservation.",
            "I carry peace inside me, and light floats on my path."
        )
        list[tranquilityPercentage % list.size]
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
            .testTag("dashboard_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(modifier = Modifier.height(4.dp))

        // --- Custom Header Section ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "WELCOME BACK",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    letterSpacing = 1.25.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Hi, ${currentUser?.name ?: "Seeker"}",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onBackground,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // High-Contrast Interactive Profile Avatar
            Surface(
                modifier = Modifier
                    .size(50.dp)
                    .clip(CircleShape)
                    .border(BorderStroke(2.dp, Color.White), CircleShape)
                    .clickable { onAvatarClick() }
                    .testTag("dashboard_profile_avatar"),
                color = PeacePrimary,
                shadowElevation = 2.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    val avatarChar = when (currentUser?.profileImage) {
                        "avatar_1" -> "😄"
                        "avatar_2" -> "🍃"
                        "avatar_3" -> "☀️"
                        "avatar_4" -> "🌊"
                        "avatar_5" -> "🌸"
                        else -> "🦉"
                    }
                    Text(text = avatarChar, fontSize = 26.sp)
                }
            }
        }

        // --- SECTION 1: Daily Mood Score (Full Width Bento Card) ---
        BentoCard(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("tranquility_card"),
            onClick = { onQuickActionSelect("mood") }
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "DAILY MOOD SCORE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "$tranquilityPercentage%",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = PeacePrimary
                        )
                        Text(
                            text = if (tranquilityPercentage >= 70) "+12% today" else "Improving",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF6FCF97)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = moodSummaryText,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Miniature Graphic Indicator (Visual Bento Bars)
                Row(
                    modifier = Modifier.padding(start = 12.dp),
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val baseHeights = listOf(14.dp, 22.dp, 36.dp, 18.dp, 40.dp)
                    baseHeights.forEachIndexed { idx, h ->
                        val barHeight = if (idx == 2 || idx == 4) h else (h * (tranquilityPercentage / 100f).coerceIn(0.5f, 1f))
                        val barColor = if (idx == 2 || idx == 4) PeacePrimary else Color.LightGray.copy(alpha = 0.5f)
                        Box(
                            modifier = Modifier
                                .size(width = 7.dp, height = barHeight)
                                .clip(RoundedCornerShape(4.dp))
                                .background(barColor)
                        )
                    }
                }
            }
        }

        // --- SECTION 2: Split Columns Bento Grid ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // LEFT COLUMN (AI Companion + Box Breathing + Insight)
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // AI Companion Square
                BentoCard(
                    modifier = Modifier.fillMaxWidth().height(125.dp),
                    backgroundColor = Color(0xFFF2C94C), // Radiant gold
                    onClick = { onQuickActionSelect("chat") }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.3f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("✧", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF423400))
                        }

                        Column {
                            Text(
                                text = "Talk to Echo",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF423400)
                            )
                            Text(
                                text = "AI Companion",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF423400).copy(alpha = 0.7f)
                            )
                        }
                    }
                }

                // Quick Exercise Square
                BentoCard(
                    modifier = Modifier.fillMaxWidth().height(125.dp),
                    backgroundColor = Color(0xFF6FCF97), // Soft mint green
                    onClick = { onQuickActionSelect("exercises") }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.3f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("●", fontSize = 18.sp, color = Color(0xFF0D4D2E))
                        }

                        Column {
                            Text(
                                text = "Box Breathing",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0D4D2E)
                            )
                            Text(
                                text = "2 min session",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF0D4D2E).copy(alpha = 0.7f)
                            )
                        }
                    }
                }

                // Insight Card (Dynamic quote banner)
                BentoCard(
                    modifier = Modifier.fillMaxWidth().height(115.dp),
                    backgroundColor = PeacePrimary,
                    onClick = { onQuickActionSelect("exercises") }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "DAILY INSIGHT",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White.copy(alpha = 0.8f),
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "\"Your calm is your superpower today.\"",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            lineHeight = 15.sp
                        )
                    }
                }
            }

            // RIGHT COLUMN (Diary Snippet + Weekly Progress)
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Diary Snippet Card (Vertical Rectangle)
                val latestDiary = diaryEntries.firstOrNull()
                val diaryTitle = latestDiary?.title ?: "Feeling Grateful"
                val diarySnippet = latestDiary?.content ?: "Today I found a quiet spot in the park and just sat for ten minutes. It reminded me that..."
                val diaryDateText = remember(latestDiary) {
                    val timestamp = latestDiary?.timestamp ?: System.currentTimeMillis()
                    SimpleDateFormat("MMM dd", Locale.getDefault()).format(Date(timestamp))
                }

                BentoCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(250.dp),
                    onClick = { onQuickActionSelect("diary") }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFFE1EDFB))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "DIARY",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = PeacePrimary
                                    )
                                }
                                Text(
                                    text = diaryDateText,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Gray
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = diaryTitle,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = diarySnippet,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                lineHeight = 16.sp,
                                maxLines = 6,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        // Creative avatar icon bottom layout
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Start
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(Color.LightGray.copy(alpha = 0.4f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("✎", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                }

                // Progress Tracker
                val totalExercises = completedExercises.size.coerceAtMost(7)
                val progressPercent = if (totalExercises == 0) 0.5f else (totalExercises / 7f)
                val progressLabel = if (totalExercises == 0) "3/7 days" else "$totalExercises/7 days"

                BentoCard(
                    modifier = Modifier.fillMaxWidth().height(115.dp),
                    onClick = { onQuickActionSelect("exercises") }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("☀️", fontSize = 18.sp)
                            Text(
                                text = progressLabel,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Column {
                            LinearProgressIndicator(
                                progress = { progressPercent },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = Color(0xFF6FCF97),
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // --- SECTION 3: Large Affirmation Panel (Spans bottom nicely) ---
        BentoCard(
            modifier = Modifier.fillMaxWidth(),
            onClick = {}
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Lightbulb,
                        contentDescription = "Affirmation Icon",
                        tint = PeaceAccent,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Daily Affirmation",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "\"$affirmation\"",
                    fontSize = 13.sp,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    lineHeight = 18.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun BentoCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = MaterialTheme.colorScheme.surface,
    onClick: () -> Unit,
    content: @Composable BoxScope.() -> Unit
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(26.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(
            width = 1.dp,
            color = if (androidx.compose.foundation.isSystemInDarkTheme()) {
                Color(0xFF2E3E52)
            } else {
                Color(0xFFE2E8F0)
            }
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            content()
        }
    }
}
