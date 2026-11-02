package com.imobweb.app.ui.vistoria

import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.imobweb.app.model.CommonProblems
import com.imobweb.app.model.PhotoAnnotation

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhotoAnnotatorScreen(
    imageDataUrl: String,
    initialAnnotations: List<PhotoAnnotation>,
    onSave: (List<PhotoAnnotation>) -> Unit,
    onClose: () -> Unit
) {
    var annotations by remember { mutableStateOf(initialAnnotations) }
    var pendingPosition by remember { mutableStateOf<Offset?>(null) }
    var selectedAnnotationIdx by remember { mutableStateOf(-1) }
    var editingText by remember { mutableStateOf("") }
    var annotationIdCounter by remember { mutableIntStateOf(initialAnnotations.size) }
    var imageSize by remember { mutableStateOf(Offset.Zero) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Anotações na Foto", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.Close, contentDescription = "Fechar")
                    }
                },
                actions = {
                    Text(
                        "${annotations.size} pontos",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.width(8.dp))
                    Button(
                        onClick = { onSave(annotations) },
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Salvar", fontSize = 13.sp)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Photo with annotation overlay
            BoxWithConstraints(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(Color.Black)
            ) {
                val boxWidth = maxWidth
                val boxHeight = maxHeight

                // The image
                AsyncImage(
                    model = imageDataUrl,
                    contentDescription = "Foto",
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectTapGestures { offset ->
                                val x = (offset.x.toDouble() / size.width * 100.0).coerceIn(0.0, 100.0)
                                val y = (offset.y.toDouble() / size.height * 100.0).coerceIn(0.0, 100.0)
                                pendingPosition = Offset(x.toFloat(), y.toFloat())
                                annotationIdCounter++
                                editingText = ""
                                selectedAnnotationIdx = annotations.size
                            }
                        },
                    contentScale = ContentScale.Fit
                )

                // Floating markers overlay
                annotations.forEachIndexed { idx, ann ->
                    val isSelected = idx == selectedAnnotationIdx
                    val markerX = (boxWidth * (ann.x.toFloat() / 100f)) - 14.dp
                    val markerY = (boxHeight * (ann.y.toFloat() / 100f)) - 14.dp

                    // Marker pin
                    Box(
                        modifier = Modifier
                            .offset(x = markerX, y = markerY)
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(if (isSelected) Color(0xFFF59E0B) else Color(0xFFEF4444))
                            .border(2.dp, Color.White, CircleShape)
                            .clickable { selectedAnnotationIdx = idx },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "${idx + 1}",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Label tag
                    if (ann.label.isNotBlank()) {
                        val labelX = if (ann.x < 60) markerX + 32.dp else (markerX - 100.dp).coerceAtLeast(4.dp)
                        Box(
                            modifier = Modifier.offset(
                                x = labelX,
                                y = markerY
                            )
                        ) {
                            Surface(
                                shape = MaterialTheme.shapes.small,
                                color = Color.Black.copy(alpha = 0.85f),
                                shadowElevation = 4.dp
                            ) {
                                Text(
                                    ann.label,
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }
                }

                // Pending point marker
                pendingPosition?.let { pos ->
                    val markerX = (boxWidth * (pos.x / 100f)) - 14.dp
                    val markerY = (boxHeight * (pos.y / 100f)) - 14.dp
                    Box(
                        modifier = Modifier
                            .offset(x = markerX, y = markerY)
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF3B82F6))
                            .border(2.dp, Color.White, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "+",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                // Hint text
                Text(
                    if (pendingPosition != null) "Digite a descrição abaixo para salvar o ponto"
                    else "Toque na foto para marcar um ponto de avaria",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 12.sp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.65f), MaterialTheme.shapes.small)
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }

            // Bottom panel - Common problems and input
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    // Input for new annotation
                    if (pendingPosition != null) {
                        OutlinedTextField(
                            value = editingText,
                            onValueChange = { editingText = it },
                            label = { Text("Descreva o problema") },
                            placeholder = { Text("Ex: Rachadura na parede") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            trailingIcon = {
                                IconButton(onClick = {
                                    if (editingText.isNotBlank()) {
                                        val pos = pendingPosition!!
                                        annotations = annotations + PhotoAnnotation(
                                            x = pos.x.toDouble(),
                                            y = pos.y.toDouble(),
                                            label = editingText
                                        )
                                        pendingPosition = null
                                        editingText = ""
                                    }
                                }) {
                                    Icon(Icons.Default.Check, contentDescription = "Adicionar",
                                        tint = MaterialTheme.colorScheme.primary)
                                }
                            }
                        )
                        Spacer(Modifier.height(8.dp))
                    }

                    // Common problems quick select
                    Text("Problemas comuns",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(4.dp))

                    val scope = rememberScrollState()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(scope),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        CommonProblems.problems.forEach { problem ->
                            AssistChip(
                                onClick = {
                                    if (pendingPosition != null) {
                                        val pos = pendingPosition!!
                                        annotations = annotations + PhotoAnnotation(
                                            x = pos.x.toDouble(),
                                            y = pos.y.toDouble(),
                                            label = problem
                                        )
                                        pendingPosition = null
                                        editingText = ""
                                    } else if (selectedAnnotationIdx >= 0 && selectedAnnotationIdx < annotations.size) {
                                        annotations = annotations.toMutableList().apply {
                                            this[selectedAnnotationIdx] = this[selectedAnnotationIdx].copy(
                                                label = problem
                                            )
                                        }
                                        selectedAnnotationIdx = -1
                                    }
                                },
                                label = { Text(problem, fontSize = 10.sp) },
                                modifier = Modifier.height(28.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))

                    // Annotations list
                    if (annotations.isNotEmpty()) {
                        Divider()
                        Spacer(Modifier.height(4.dp))
                        Text("${annotations.size} ponto(s) marcado(s)",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)

                        val listScroll = rememberScrollState()
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 120.dp)
                                .verticalScroll(listScroll)
                        ) {
                            annotations.forEachIndexed { idx, ann ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { selectedAnnotationIdx = idx }
                                        .padding(vertical = 2.dp, horizontal = 4.dp)
                                        .background(
                                            if (idx == selectedAnnotationIdx)
                                                MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                                            else Color.Transparent,
                                            MaterialTheme.shapes.small
                                        )
                                        .padding(4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        modifier = Modifier.size(20.dp),
                                        shape = CircleShape,
                                        color = Color(0xFFEF4444)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Text("${idx + 1}", color = Color.White,
                                                fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Spacer(Modifier.width(8.dp))
                                    Text(ann.label,
                                        style = MaterialTheme.typography.bodySmall,
                                        modifier = Modifier.weight(1f))
                                    IconButton(
                                        onClick = {
                                            annotations = annotations.toMutableList().apply { removeAt(idx) }
                                            if (selectedAnnotationIdx == idx) selectedAnnotationIdx = -1
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = "Remover",
                                            modifier = Modifier.size(14.dp),
                                            tint = MaterialTheme.colorScheme.error)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
