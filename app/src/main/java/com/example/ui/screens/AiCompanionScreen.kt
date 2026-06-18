package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.data.database.ChatHistoryEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.PeaceMindViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AiCompanionScreen(viewModel: PeaceMindViewModel) {
    val messages by viewModel.chatMessages.collectAsState()
    val isGenerating by viewModel.isGeneratingResponse.collectAsState()
    val selectedPersonality by viewModel.selectedPersonality.collectAsState()

    var chatInputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Personalities definition matching requirements
    val personalities = listOf(
        PersonalityInfo("Supportive Friend", "PeaceCompanion", "Warm comfort, close listening, friendly comfort.", Icons.Default.SentimentSatisfied, PeaceSecondary),
        PersonalityInfo("Motivational Coach", "PeaceCoach", "High energy, tiny affirmations, action plans.", Icons.Default.FlashOn, PeaceAccent),
        PersonalityInfo("Calm Listener", "PeaceSpace", "Quiet reflecting focus, feelings validator.", Icons.Default.Spa, PeacePrimary),
        PersonalityInfo("Mindfulness Guide", "PeaceZen", "Breathing routines, physical grounding guidance.", Icons.Default.FilterVintage, SleepColor)
    )

    // Scroll to bottom when new messages arrive
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("ai_companion_screen")
    ) {
        // --- 1. Horizontal Personalities Selection bar ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(bottom = 12.dp, top = 8.dp)
        ) {
            Text(
                text = "Choose Your Peace Companion",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                modifier = Modifier.padding(start = 16.dp, bottom = 8.dp)
            )

            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(personalities) { pers ->
                    val isSelected = selectedPersonality == pers.id
                    val colorBrush = if (isSelected) pers.themeColor else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    val border = if (isSelected) BorderStroke(2.dp, pers.themeColor) else BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))

                    Card(
                        modifier = Modifier
                            .width(135.dp)
                            .clickable { viewModel.setPersonality(pers.id) }
                            .testTag("personality_${pers.id}"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = border
                    ) {
                        Column(
                            modifier = Modifier.padding(10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(pers.themeColor.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(imageVector = pers.icon, contentDescription = null, tint = pers.themeColor, modifier = Modifier.size(20.dp))
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = pers.id,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = pers.nickname,
                                fontSize = 9.sp,
                                color = pers.themeColor,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f))

        // --- 2. Chat Space Area ---
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            MaterialTheme.colorScheme.background,
                            MaterialTheme.colorScheme.background.copy(alpha = 0.95f),
                            PeacePrimary.copy(alpha = 0.05f)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            if (messages.isEmpty()) {
                // Intro Guidance message
                val activeInfo = personalities.first { it.id == selectedPersonality }
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(activeInfo.themeColor.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = activeInfo.icon, contentDescription = null, tint = activeInfo.themeColor, modifier = Modifier.size(36.dp))
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Connect with ${activeInfo.nickname}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = activeInfo.description,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(start = 24.dp, end = 24.dp, top = 2.dp)
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    OutlinedButton(
                        onClick = {
                            viewModel.sendChatMessage("Hello! Can you help me feel a bit more calm right now?")
                        },
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text("Send icebreaker prompt")
                    }
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(messages) { msg ->
                        ChatBubbleRow(msg = msg, companionColor = personalities.first { it.id == selectedPersonality }.themeColor)
                    }

                    if (isGenerating) {
                        item {
                            TypingAnimationRow(color = personalities.first { it.id == selectedPersonality }.themeColor)
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            }
        }

        // --- 3. Chat Control Bottom Input row ---
        Surface(
            tonalElevation = 6.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .imePadding()
                    .windowInsetsPadding(WindowInsets.navigationBars),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Clear History Option
                IconButton(onClick = { viewModel.clearChat() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Clear Chat Conversation history", tint = StressRed)
                }

                // Chat Input Text Slot
                OutlinedTextField(
                    value = chatInputText,
                    onValueChange = { chatInputText = it },
                    placeholder = { Text("What is weighing on your mind?...") },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("ai_chat_input"),
                    shape = RoundedCornerShape(24.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PeacePrimary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                    )
                )

                Spacer(modifier = Modifier.width(8.dp))

                // Send Trigger
                FloatingActionButton(
                    onClick = {
                        if (chatInputText.trim().isNotEmpty()) {
                            viewModel.sendChatMessage(chatInputText.trim())
                            chatInputText = ""
                        }
                    },
                    shape = CircleShape,
                    containerColor = PeacePrimary,
                    contentColor = Color.White,
                    modifier = Modifier
                        .size(48.dp)
                        .testTag("ai_send_button")
                ) {
                    Icon(Icons.Filled.Send, contentDescription = "Send text", modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@Composable
fun ChatBubbleRow(msg: ChatHistoryEntity, companionColor: Color) {
    val isUser = msg.sender == "USER"
    val bubbleColor = if (isUser) PeacePrimary else MaterialTheme.colorScheme.surface
    val textColor = if (isUser) Color.White else MaterialTheme.colorScheme.onSurface
    val alignment = if (isUser) Alignment.End else Alignment.Start

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("chat_bubble_${msg.id}"),
        horizontalAlignment = alignment
    ) {
        // Row avatar + balloon
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Top,
            modifier = Modifier.fillMaxWidth(0.85f)
        ) {
            if (!isUser) {
                Surface(
                    shape = CircleShape,
                    color = companionColor.copy(alpha = 0.15f),
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = when (msg.personality) {
                                "Supportive Friend" -> "😄"
                                "Motivational Coach" -> "⚡"
                                "Calm Listener" -> "🌸"
                                else -> "🧘"
                            },
                            fontSize = 14.sp
                        )
                    }
                }
            } else {
                Spacer(modifier = Modifier.weight(1f))
            }

            // Balloon
            Card(
                shape = RoundedCornerShape(
                    topStart = 16.dp,
                    topEnd = 16.dp,
                    bottomStart = if (isUser) 16.dp else 4.dp,
                    bottomEnd = if (isUser) 4.dp else 16.dp
                ),
                colors = CardDefaults.cardColors(containerColor = bubbleColor),
                border = if (!isUser) CardDefaults.outlinedCardBorder() else null
            ) {
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                    Text(
                        text = msg.message,
                        fontSize = 14.sp,
                        color = textColor,
                        lineHeight = 20.sp
                    )
                }
            }

            if (isUser) {
                Surface(
                    shape = CircleShape,
                    color = PeaceSecondary.copy(alpha = 0.15f),
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "🧘", fontSize = 14.sp)
                    }
                }
            } else {
                Spacer(modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun TypingAnimationRow(color: Color) {
    val transition = rememberInfiniteTransition(label = "dots")
    val scale1 by transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(animation = tween(600, easing = LinearEasing), repeatMode = RepeatMode.Reverse),
        label = "dot1"
    )
    val scale2 by transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(animation = tween(600, delayMillis = 150, easing = LinearEasing), repeatMode = RepeatMode.Reverse),
        label = "dot2"
    )
    val scale3 by transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(animation = tween(600, delayMillis = 300, easing = LinearEasing), repeatMode = RepeatMode.Reverse),
        label = "dot3"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("typing_indicator"),
        horizontalArrangement = Arrangement.Start
    ) {
        Row(
            modifier = Modifier.padding(start = 36.dp, top = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Companion is writing", fontSize = 11.sp, color = color, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.width(4.dp))
            Box(modifier = Modifier.size(5.dp * scale1).clip(CircleShape).background(color))
            Box(modifier = Modifier.size(5.dp * scale2).clip(CircleShape).background(color))
            Box(modifier = Modifier.size(5.dp * scale3).clip(CircleShape).background(color))
        }
    }
}

data class PersonalityInfo(
    val id: String,
    val nickname: String,
    val description: String,
    val icon: ImageVector,
    val themeColor: Color
)
