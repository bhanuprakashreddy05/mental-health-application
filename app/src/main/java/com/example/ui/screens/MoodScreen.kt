package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.database.MoodEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.PeaceMindViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun MoodScreen(viewModel: PeaceMindViewModel) {
    val moods by viewModel.moodLogs.collectAsState()
    var activeSubTab by remember { mutableStateOf("log") } // "log" or "analytics"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("mood_screen")
    ) {
        // --- Inner Tab Switcher ---
        TabRow(
            selectedTabIndex = if (activeSubTab == "log") 0 else 1,
            containerColor = MaterialTheme.colorScheme.background,
            contentColor = PeacePrimary,
            modifier = Modifier.fillMaxWidth()
        ) {
            Tab(
                selected = activeSubTab == "log",
                onClick = { activeSubTab = "log" },
                text = { Text("Log Feeling", fontWeight = FontWeight.Bold, fontSize = 14.sp) },
                icon = { Icon(Icons.Default.AddReaction, contentDescription = null) }
            )
            Tab(
                selected = activeSubTab == "analytics",
                onClick = { activeSubTab = "analytics" },
                text = { Text("Tranquility Logs", fontWeight = FontWeight.Bold, fontSize = 14.sp) },
                icon = { Icon(Icons.Default.BarChart, contentDescription = null) }
            )
        }

        Crossfade(targetState = activeSubTab, label = "MoodTabAnimation") { state ->
            if (state == "log") {
                MoodLogForm(viewModel = viewModel) {
                    activeSubTab = "analytics" // auto pivot on save
                }
            } else {
                MoodAnalytics(viewModel = viewModel, moods = moods)
            }
        }
    }
}

@Composable
fun MoodLogForm(viewModel: PeaceMindViewModel, onSaveCompleted: () -> Unit) {
    val scrollState = rememberScrollState()

    // Form inputs state
    val moodsList = listOf(
        "😄 Happy", "😊 Good", "😐 Neutral", "😔 Sad", "😢 Very Sad", "😡 Angry", "😰 Anxious"
    )
    var selectedMood by remember { mutableStateOf("😐 Neutral") }
    var energyLevel by remember { mutableFloatStateOf(6f) }
    var stressLevel by remember { mutableFloatStateOf(4f) }
    var sleepRating by remember { mutableIntStateOf(3) }
    var note by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "How do you feel right now outside?",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(12.dp))

                // Scrollable or wrapping chips for emojis selection
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val shapesChunk = moodsList.chunked(4)
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        shapesChunk.forEach { rowMoods ->
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                rowMoods.forEach { item ->
                                    val isSelected = selectedMood == item
                                    val chipBg = if (isSelected) PeacePrimary.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                    val chipBorderSpec = if (isSelected) BorderStroke(2.dp, PeacePrimary) else BorderStroke(1.dp, Color.Transparent)
                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clickable { selectedMood = item }
                                            .testTag("mood_chip_$item"),
                                        shape = RoundedCornerShape(12.dp),
                                        color = chipBg,
                                        border = chipBorderSpec
                                    ) {
                                        Text(
                                            text = item,
                                            fontSize = 13.sp,
                                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Normal,
                                            modifier = Modifier.padding(vertical = 12.dp),
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                                if (rowMoods.size < 4) {
                                    Spacer(modifier = Modifier.weight((4 - rowMoods.size).toFloat()))
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- Sliders Setup ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Energy Level
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Energy level", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = "${energyLevel.toInt()}/10", color = PeacePrimary, fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = energyLevel,
                        onValueChange = { energyLevel = it },
                        valueRange = 1f..10f,
                        steps = 8,
                        colors = SliderDefaults.colors(thumbColor = PeacePrimary, activeTrackColor = PeacePrimary)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Drained", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Radiant", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }

                Divider()

                // Stress Level
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Stress level", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = "${stressLevel.toInt()}/10", color = StressRed, fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = stressLevel,
                        onValueChange = { stressLevel = it },
                        valueRange = 1f..10f,
                        steps = 8,
                        colors = SliderDefaults.colors(thumbColor = StressRed, activeTrackColor = StressRed)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Deep Calm", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("High Overwhelm", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            }
        }

        // --- Sleep Star Rating ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Sleep quality last night",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    for (star in 1..5) {
                        val isFilled = star <= sleepRating
                        Icon(
                            imageVector = if (isFilled) Icons.Filled.Star else Icons.Outlined.Star,
                            contentDescription = "Star $star",
                            tint = if (isFilled) PeaceAccent else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                            modifier = Modifier
                                .size(48.dp)
                                .clickable { sleepRating = star }
                                .padding(4.dp)
                                .testTag("star_rate_$star")
                        )
                    }
                }
            }
        }

        // --- Notes Input ---
        OutlinedTextField(
            value = note,
            onValueChange = { note = it },
            label = { Text("Describe physical triggers or feelings...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .testTag("mood_note_input"),
            shape = RoundedCornerShape(16.dp),
            maxLines = 4
        )

        Button(
            onClick = {
                viewModel.addMoodEntry(
                    mood = selectedMood,
                    note = note,
                    stressLevel = stressLevel.toInt(),
                    energyLevel = energyLevel.toInt(),
                    sleepRating = sleepRating,
                    onComplete = onSaveCompleted
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .testTag("save_mood_button"),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PeacePrimary)
        ) {
            Text("Save Self-Care Entry", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
fun MoodAnalytics(viewModel: PeaceMindViewModel, moods: List<MoodEntity>) {
    if (moods.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.AddReaction,
                    contentDescription = null,
                    tint = PeacePrimary.copy(alpha = 0.4f),
                    modifier = Modifier.size(72.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "No Tranquility Records Yet",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                )
                Text(
                    text = "Log your feeling above to render real-time statistical insights.",
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
                )
            }
        }
        return
    }

    // 1. Calculations
    val averageSleep = remember(moods) {
        moods.map { it.sleepRating }.average().let { String.format("%.1f", it) }
    }
    val averageStress = remember(moods) {
        moods.map { it.stressLevel }.average().let { String.format("%.1f", it) }
    }
    val averageEnergy = remember(moods) {
        moods.map { it.energyLevel }.average().let { String.format("%.1f", it) }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // --- Static Gauge cards ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatMetricCard(
                    title = "Avg Sleep",
                    value = "$averageSleep / 5",
                    icon = Icons.Default.Hotel,
                    color = SleepColor,
                    modifier = Modifier.weight(1f)
                )
                StatMetricCard(
                    title = "Avg Stress",
                    value = "$averageStress / 10",
                    icon = Icons.Default.DirectionsRun,
                    color = StressRed,
                    modifier = Modifier.weight(1f)
                )
                StatMetricCard(
                    title = "Avg Energy",
                    value = "$averageEnergy / 10",
                    icon = Icons.Default.FlashOn,
                    color = PeaceAccent,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // --- Visual Simulated Graph Area ---
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Weekly Mood Tranquility Trend",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    // Simulated bar visual representation of tranquility over days
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .padding(bottom = 6.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        val displayMoods = moods.take(7).reversed()
                        displayMoods.forEach { entry ->
                            val score = ((entry.sleepRating * 16 + entry.energyLevel * 2 + (10 - entry.stressLevel) * 2) * 100) / 120
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.height(100.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .width(16.dp)
                                        .height((score.coerceIn(20, 100)).dp)
                                        .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                                        .background(
                                            Brush.verticalGradient(
                                                listOf(PeacePrimary, PeaceSecondary)
                                            )
                                        )
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = entry.mood.take(2), // just show emoji
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                    Divider()
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Text("Mon", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Tue", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Wed", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Thu", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Fri", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Sat", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text("Sun", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            }
        }

        // --- Historical List ---
        item {
            Text(
                text = "History of Entries",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(moods) { log ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mood_log_item_${log.id}"),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = PeacePrimary.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = log.mood,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = PeacePrimary
                            )
                        }

                        // Date formatter
                        val readableDate = remember(log.timestamp) {
                            val sdf = SimpleDateFormat("MMM dd, hh:mm a", Locale.getDefault())
                            sdf.format(Date(log.timestamp))
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = readableDate,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            IconButton(
                                onClick = { viewModel.removeMoodEntry(log.id) },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DeleteOutline,
                                    contentDescription = "Delete Log",
                                    tint = StressRed,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    if (log.note.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = log.note,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        Text(
                            text = "⚡ Energy: ${log.energyLevel}/10",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "🔴 Stress: ${log.stressLevel}/10",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "⭐ Sleep: ${log.sleepRating}/5",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun StatMetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = title, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}
