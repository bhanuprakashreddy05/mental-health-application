package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.database.DiaryEntity
import com.example.ui.theme.PeacePrimary
import com.example.ui.theme.PeaceSecondary
import com.example.ui.theme.SleepColor
import com.example.ui.theme.StressRed
import com.example.ui.viewmodel.PeaceMindViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DiaryScreen(viewModel: PeaceMindViewModel) {
    val diaries by viewModel.diaryEntries.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()

    // Form modal state
    var showJournalForm by remember { mutableStateOf(false) }
    var selectedDiaryToEdit by remember { mutableStateOf<DiaryEntity?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .testTag("diary_screen")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // --- Title section ---
            Text(
                text = "My Personal Sanctuary",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "Pour your thoughts onto pages. Secure & offline.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // --- Search Bar ---
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.updateSearchQuery(it) },
                placeholder = { Text("Search pages, moods or triggers...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search Icon") },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear Search")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("diary_search_input"),
                shape = RoundedCornerShape(28.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PeacePrimary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // --- Diary List OR Empty State ---
            if (diaries.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.EditNote,
                            contentDescription = null,
                            tint = PeaceSecondary.copy(alpha = 0.4f),
                            modifier = Modifier.size(80.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = if (searchQuery.isEmpty()) "Empty Sanctuary" else "No matches found",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            text = if (searchQuery.isEmpty()) "Your thoughts want to be recorded. Tap the '+' floating button below to write your first secure diary entry." else "Try adjusting your search criteria.",
                            textAlign = TextAlign.Center,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(diaries) { entry ->
                        DiaryRow(
                            entry = entry,
                            onEdit = {
                                selectedDiaryToEdit = entry
                                showJournalForm = true
                            },
                            onDelete = { viewModel.deleteDiaryEntry(entry.id) }
                        )
                    }
                    item {
                        Spacer(modifier = Modifier.height(80.dp))
                    }
                }
            }
        }

        // --- Floating Action Button to Add ---
        FloatingActionButton(
            onClick = {
                selectedDiaryToEdit = null
                showJournalForm = true
            },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(24.dp)
                .testTag("add_diary_fab"),
            containerColor = PeacePrimary,
            contentColor = Color.White,
            shape = CircleShape
        ) {
            Icon(Icons.Default.Add, contentDescription = "Write Diary Entry", modifier = Modifier.size(28.dp))
        }

        // --- Add/Edit Overlay Screen (Fired on click) ---
        if (showJournalForm) {
            DiaryFormDialog(
                entryToEdit = selectedDiaryToEdit,
                onDismiss = { showJournalForm = false },
                onSave = { title, content, moodTag ->
                    if (selectedDiaryToEdit == null) {
                        viewModel.addDiaryEntry(title, content, moodTag) {}
                    } else {
                        viewModel.updateDiaryEntry(selectedDiaryToEdit!!.id, title, content, moodTag) {}
                    }
                    showJournalForm = false
                }
            )
        }
    }
}

@Composable
fun DiaryRow(
    entry: DiaryEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val readableDate = remember(entry.timestamp) {
        val sdf = SimpleDateFormat("EEEE, MMMM dd, yyyy", Locale.getDefault())
        sdf.format(Date(entry.timestamp))
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("diary_item_${entry.id}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Header: Date, Mood Tag, edit/delete actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = readableDate,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit page", modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete page", tint = StressRed, modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Mood tag bubble
            Surface(
                color = when {
                    entry.moodTag.contains("Happy") || entry.moodTag.contains("Good") -> PeaceSecondary.copy(alpha = 0.15f)
                    entry.moodTag.contains("Sad") || entry.moodTag.contains("Anxious") -> SleepColor.copy(alpha = 0.15f)
                    else -> PeacePrimary.copy(alpha = 0.15f)
                },
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Text(
                    text = entry.moodTag,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Text(
                text = entry.title,
                fontSize = 17.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = entry.content,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.75f),
                maxLines = 4,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 20.sp
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiaryFormDialog(
    entryToEdit: DiaryEntity?,
    onDismiss: () -> Unit,
    onSave: (String, String, String) -> Unit
) {
    var title by remember { mutableStateOf(entryToEdit?.title ?: "") }
    var content by remember { mutableStateOf(entryToEdit?.content ?: "") }
    val moodsList = listOf("😄 Happy", "😊 Peaceful", "😐 Neutral", "😔 Healing", "😰 Anxious", "😡 Releasing")
    var selectedMoodTag by remember { mutableStateOf(entryToEdit?.moodTag ?: "😐 Neutral") }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = { if (title.isNotBlank() && content.isNotBlank()) onSave(title, content, selectedMoodTag) },
                colors = ButtonDefaults.buttonColors(containerColor = PeacePrimary)
            ) {
                Text("Save Page", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        title = {
            Text(
                text = if (entryToEdit == null) "New Journal Page" else "Edit Page",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Title
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("dialog_diary_title"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                // Mood Selection
                Column {
                    Text(text = "Mood Filter Tag", fontSize = 12.sp, modifier = Modifier.padding(bottom = 6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val rowChunks = moodsList.chunked(3)
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            rowChunks.forEach { list ->
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    list.forEach { mood ->
                                        val isSelected = selectedMoodTag == mood
                                        Surface(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clickable { selectedMoodTag = mood },
                                            shape = RoundedCornerShape(10.dp),
                                            color = if (isSelected) PeacePrimary.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant,
                                            border = if (isSelected) BorderStroke(1.5.dp, PeacePrimary) else null
                                        ) {
                                            Text(
                                                text = mood,
                                                fontSize = 11.sp,
                                                modifier = Modifier.padding(vertical = 10.dp),
                                                textAlign = TextAlign.Center,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Description Content
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("What is on your mind? Begin spilling...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .testTag("dialog_diary_content"),
                    shape = RoundedCornerShape(12.dp),
                    maxLines = 10
                )
            }
        },
        shape = RoundedCornerShape(24.dp)
    )
}
