package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.PeaceMindViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ExercisesScreen(viewModel: PeaceMindViewModel) {
    val completedData by viewModel.completedExercises.collectAsState()
    var selectedCategory by remember { mutableStateOf("Breathing") }
    var activeExerciseItem by remember { mutableStateOf<ExerciseItem?>(null) }

    val categories = listOf("Breathing", "Meditation", "Mindfulness", "Stress Relief")

    val exercisesList = remember {
        listOf(
            // Breathing
            ExerciseItem("box_breath", "Box Breathing", "Symmetrical 4-second pattern used to reset nerves and find calm.", "Breathing", listOf(
                "Inhale deeply through your nose for 4 seconds.",
                "Hold your breath gently for 4 seconds.",
                "Slowly exhale through your mouth for 4 seconds.",
                "Hold empty for 4 seconds, then repeat."
            ), 16),
            ExerciseItem("deep_breath", "Deep Breathing", "A long, steady respiration flow that cools down physical panic.", "Breathing", listOf(
                "Breathe in through nose for 5 seconds.",
                "Breathe out completely through pursed lips for 5 seconds.",
                "Repeat this cyclic focus for several minutes."
            ), 10),
            ExerciseItem("478_breath", "4-7-8 Breathing", "Natural tranquilizer for the nervous system, helpful for drifting to sleep.", "Breathing", listOf(
                "Empty your lungs completely.",
                "Inhale quietly through your nose for 4 seconds.",
                "Hold your breath for a count of 7 seconds.",
                "Exhale forcefully through mouth with a 'whoosh' for 8 seconds."
            ), 19),

            // Meditation
            ExerciseItem("med_5", "5 Minute Meditation", "A brief mental pause. Sit upright, close your eyes, and watch your thoughts flow.", "Meditation", listOf(
                "Find a comfortable, upright resting posture.",
                "Close your eyes gently, focusing on where you feel your breath.",
                "If thoughts arise, label them neutrally and return to breath count."
            ), 300),
            ExerciseItem("med_10", "10 Minute Deep Meditation", "Deeper cognitive decompression. Great for anchoring morning intentions.", "Meditation", listOf(
                "Sit comfortably, release shoulder tension.",
                "Observe the rise and fall of chest or breath sensations at nostrils.",
                "Gently lean into sensory awareness without commentary."
            ), 600),
            ExerciseItem("gu_relax", "Guided Relaxation", "A mental scan to release bodily lockouts and accumulated fatigue.", "Meditation", listOf(
                "Lie flat on your back, letting feet spin outward.",
                "Bring warm visual awareness to your face, neck, and shoulder muscle groups.",
                "Consciously let them melt down into the earth."
            ), 180),

            // Mindfulness
            ExerciseItem("grat_prac", "Gratitude Practice", "Rewiring the brain's selection bias toward joy and appreciation.", "Mindfulness", listOf(
                "Close your eyes and breathe comfortably.",
                "Visualize three specific simple elements (a warm coffee, a cozy socks, a message) that brought comfort today.",
                "Say 'Thank you' inside your mind to each element."
            ), 60),
            ExerciseItem("body_scan", "Body Scan Deconstruction", "Grounding into bodily reality to disperse intellectual anxiety.", "Mindfulness", listOf(
                "Close your eyes, feel the weight of your body on the chair.",
                "Scan slowly downwards from crown, face, neck, chest, thighs to toes.",
                "Notice sensations, temperature, or tightness, letting them be."
            ), 120),
            ExerciseItem("grounding_54321", "5-4-3-2-1 Grounding technique", "The classic cognitive anchoring method for sudden panic or floating.", "Mindfulness", listOf(
                "Look surrounding you: Name 5 objects you can see.",
                "Touch: 4 physical textures (e.g. fabric, wood).",
                "Hear: 3 separate ambient sounds (e.g. fan hum, traffic).",
                "Smell: 2 scents you can perceive.",
                "Taste: 1 thing you can taste right now."
            ), 90),

            // Stress Relief
            ExerciseItem("qk_relax", "Quick Relaxation", "A fast 60-second muscular squeeze-and-release reset.", "Stress Relief", listOf(
                "Clench your fists and pull shoulders tight.",
                "Hold this tense stance for 5 seconds.",
                "Exhale completely and drop shoulders, letting everything go."
            ), 60),
            ExerciseItem("pos_vis", "Positive Visualization", "Transporting your nervous system into a warm sanctuary.", "Stress Relief", listOf(
                "Visualize a tranquil golden beach or forest path.",
                "Imagine the precise warm sun on your head and sound of waves.",
                "Experience the complete safety of this imagination."
            ), 120),
            ExerciseItem("calm_mind", "Calm Mind Session", "Gently repeating core affirmations to replace looping worries.", "Stress Relief", listOf(
                "Quietly whisper or repeat silently: 'I am safe in this body.'",
                "Repeat: 'This feeling too shall pass.'",
                "Let your breathing coordinate smoothly with the phrase."
            ), 120)
        )
    }

    val filteredList = remember(selectedCategory) {
        exercisesList.filter { it.category == selectedCategory }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .testTag("exercises_screen")
    ) {
        if (activeExerciseItem == null) {
            // Main List Grid View
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Title and streak counter
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Wellness Gym",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Daily exercises for peace & focus",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                        )
                    }

                    // Completed counter chip
                    Surface(
                        color = PeaceSecondary.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = PeaceSecondary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${completedData.size} Done",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // --- Category Tab Filter pill row ---
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(categories) { cat ->
                        val isSelected = selectedCategory == cat
                        Surface(
                            modifier = Modifier
                                .clickable { selectedCategory = cat }
                                .testTag("cat_pill_$cat"),
                            shape = RoundedCornerShape(16.dp),
                            color = if (isSelected) PeacePrimary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = if (isSelected) null else BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                        ) {
                            Text(
                                text = cat,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                            )
                        }
                    }
                }

                // --- Exercises dynamic list ---
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredList) { item ->
                        val hasCompleted = completedData.any { it.exerciseId == item.id }
                        ExerciseRowCard(item = item, isCompleted = hasCompleted) {
                            activeExerciseItem = item
                        }
                    }
                    item {
                        Spacer(modifier = Modifier.height(40.dp))
                    }
                }
            }
        } else {
            // Active timer with respiratory animation interface
            ExercisePlayerHUD(
                item = activeExerciseItem!!,
                onDismiss = { activeExerciseItem = null },
                onLogged = {
                    viewModel.logExerciseCompletion(activeExerciseItem!!.id)
                    activeExerciseItem = null
                }
            )
        }
    }
}

@Composable
fun ExerciseRowCard(item: ExerciseItem, isCompleted: Boolean, onSelect: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() }
            .testTag("exercise_card_${item.id}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(
                        when (item.category) {
                            "Breathing" -> PeacePrimary.copy(alpha = 0.15f)
                            "Meditation" -> SleepColor.copy(alpha = 0.15f)
                            "Mindfulness" -> PeaceSecondary.copy(alpha = 0.15f)
                            else -> PeaceAccent.copy(alpha = 0.15f)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (item.category) {
                        "Breathing" -> Icons.Default.DirectionsRun
                        "Meditation" -> Icons.Default.Hotel
                        "Mindfulness" -> Icons.Default.Spa
                        else -> Icons.Default.OfflineBolt
                    },
                    contentDescription = null,
                    tint = when (item.category) {
                        "Breathing" -> PeacePrimary
                        "Meditation" -> SleepColor
                        "Mindfulness" -> PeaceSecondary
                        else -> PeaceAccent
                    },
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = item.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    if (isCompleted) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = "Finished status", tint = PeaceSecondary, modifier = Modifier.size(14.dp))
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = item.shortDesc,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    maxLines = 2
                )
            }

            Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.outline)
        }
    }
}

@Composable
fun ExercisePlayerHUD(
    item: ExerciseItem,
    onDismiss: () -> Unit,
    onLogged: () -> Unit
) {
    var isTimerActive by remember { mutableStateOf(false) }
    var secondsElapsed by remember { mutableIntStateOf(0) }
    val totalGoalSeconds = item.totalSeconds

    // Breathing sequence: Inhale -> Hold -> Exhale -> HoldEmpty, or simple cycle
    var currentBreathingState by remember { mutableStateOf("Ready") }

    // Countdown logic
    LaunchedEffect(isTimerActive, secondsElapsed) {
        if (isTimerActive && secondsElapsed < totalGoalSeconds) {
            delay(1000)
            secondsElapsed += 1

            // Dynamic instruction text switching for breathing tasks
            if (item.category == "Breathing") {
                if (item.id == "box_breath") {
                    val phase = secondsElapsed % 16
                    currentBreathingState = when (phase) {
                        in 0..3 -> "Inhale... (Expand Chest)"
                        in 4..7 -> "Gentle Hold... (Keep Still)"
                        in 8..11 -> "Exhale slowly... (Let Go)"
                        else -> "Hold empty... (Quiet Peace)"
                    }
                } else if (item.id == "deep_breath") {
                    val phase = secondsElapsed % 10
                    currentBreathingState = if (phase in 0..4) "Inhale... (Breathe Life)" else "Exhale... (Shed Tension)"
                } else {
                    // 4-7-8 sequence
                    val phase = secondsElapsed % 19
                    currentBreathingState = when (phase) {
                        in 0..3 -> "Inhale... (Quietly 4s)"
                        in 4..10 -> "Subtle Hold... (Centering 7s)"
                        else -> "Whoosh Exhale... (Deep Release 8s)"
                    }
                }
            } else {
                currentBreathingState = "Focus on the quiet stillness..."
            }
        } else if (secondsElapsed >= totalGoalSeconds) {
            isTimerActive = false
            currentBreathingState = "Finished. Well done!"
        }
    }

    // --- Breathing Circle Animation State ---
    // Circle size bounces based on breathing instructions!
    val circleSizeMultiplier by animateFloatAsState(
        targetValue = when {
            !isTimerActive -> 1.0f
            currentBreathingState.startsWith("Inhale") -> 1.6f
            currentBreathingState.startsWith("Hold") || currentBreathingState.startsWith("Subtle") -> 1.6f
            currentBreathingState.startsWith("Exhale") || currentBreathingState.startsWith("Whoosh") -> 1.0f
            else -> 1.0f
        },
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "circle_swell"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AmbientBgDark)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
            .testTag("exercise_player_hud"),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Back header Close button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            IconButton(onClick = onDismiss, modifier = Modifier.testTag("close_player")) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Quiet screen", tint = Color.White)
            }
        }

        Text(
            text = item.title,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            textAlign = TextAlign.Center
        )

        Text(
            text = item.category,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = PeaceSecondary,
            modifier = Modifier
                .border(1.dp, PeaceSecondary.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                .padding(horizontal = 14.dp, vertical = 4.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        // --- Core Animated Node Circular HUD ---
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(240.dp)
        ) {
            // Ripple background aura
            Box(
                modifier = Modifier
                    .size(150.dp * circleSizeMultiplier)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                PeacePrimary.copy(alpha = 0.35f),
                                PeaceSecondary.copy(alpha = 0.15f),
                                Color.Transparent
                            )
                        )
                    )
            )

            // Dynamic pulsating circle
            Box(
                modifier = Modifier
                    .size(110.dp * circleSizeMultiplier)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(PeacePrimary, PeaceSecondary)
                        )
                    )
            )

            // Central time text
            val timeLeft = (totalGoalSeconds - secondsElapsed).coerceAtLeast(0)
            val minutes = timeLeft / 60
            val seconds = timeLeft % 60
            val formattedTime = String.format("%02d:%02d", minutes, seconds)

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = formattedTime,
                    fontSize = 32.sp,
                    color = Color.White,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = if (isTimerActive) "Active" else "Paused",
                    fontSize = 11.sp,
                    color = Color.White.copy(alpha = 0.6f)
                )
            }
        }

        // Live text guide line
        Text(
            text = if (!isTimerActive && secondsElapsed == 0) "Tap Start to begin exercise" else currentBreathingState,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.height(24.dp),
            textAlign = TextAlign.Center
        )

        Divider(color = Color.White.copy(alpha = 0.12f), modifier = Modifier.padding(horizontal = 24.dp))

        // Instructions list card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBgDark),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Instructions for practice:",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color.White
                )

                item.instructions.forEachIndexed { i, rule ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            text = "${i + 1}.",
                            color = PeaceAccent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.width(20.dp)
                        )
                        Text(
                            text = rule,
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // --- Action Buttons Play/Pause/Complete ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Play / Pause Button
            Button(
                onClick = { isTimerActive = !isTimerActive },
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp)
                    .testTag("play_pause_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = if (isTimerActive) StressRed else PeacePrimary)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = if (isTimerActive) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Control action",
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = if (isTimerActive) "Pause" else "Start Practice", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            // Finish check logic
            Button(
                onClick = onLogged,
                modifier = Modifier
                    .weight(1.5f)
                    .height(56.dp)
                    .testTag("complete_exercise_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PeaceSecondary)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(imageVector = Icons.Default.Check, contentDescription = "Log", tint = Color.White)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Mark As Completed", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}

data class ExerciseItem(
    val id: String,
    val title: String,
    val shortDesc: String,
    val category: String,
    val instructions: List<String>,
    val totalSeconds: Int
)
