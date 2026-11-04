package com.imobweb.app.ui.vistoria

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.lifecycle.createSavedStateHandle
import com.imobweb.app.ImobWebApp
import com.imobweb.app.data.repository.SyncWorker
import com.imobweb.app.ui.settings.loadVistoriaDefaults
import com.imobweb.app.util.PhotoStore
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.util.AiInspectionResult
import com.imobweb.app.util.LaudoHtmlBuilder
import com.imobweb.app.util.ReportPdfExporter
import com.imobweb.app.model.*
import com.imobweb.app.ui.camera.CameraScreen
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

// ===================== STEP 4: Inventory (per room) =====================
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
internal fun StepInventory(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    onUpdateRoom: (roomId: String, (RoomData) -> RoomData) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit,
    repository: VistoriaRepository,
    tipoImovel: String,
    finalidade: String,
    context: Context,
    onTakePhoto: () -> Unit,
    onPickFromGallery: () -> Unit,
    isUploading: Boolean
) {
    val scope = rememberCoroutineScope()
    var showAllFurniture by remember { mutableStateOf(false) }

    // Dialog state for AI confirmation
    var pendingAiResult by remember { mutableStateOf<AiInspectionResult?>(null) }
    var pendingAiRoomId by remember { mutableStateOf<String?>(null) }
    var selectedMoveis by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedAvarias by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedProblemas by remember { mutableStateOf<Set<String>>(emptySet()) }

    Column {
        Text("Inventário dos Cômodos", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Selecione o cômodo para registrar fotos, móveis e avarias",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(14.dp))

        if (rooms.isEmpty()) {
            Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                Text("Adicione cômodos primeiro na etapa anterior", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            return
        }

        // ================= ROOM SELECTOR AREA (ALL ROOMS VISIBLE & CLICKABLE) =================
        val completedCount = rooms.count { room ->
            room.analyzed || room.photos.isNotEmpty() || room.furniture.isNotEmpty() || room.damages.isNotEmpty() || room.problems.isNotEmpty()
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Cômodos da Vistoria (${rooms.size})",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (completedCount == rooms.size && rooms.isNotEmpty())
                            Color(0xFF064E3B)
                        else MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "$completedCount/${rooms.size} preenchidos",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (completedCount == rooms.size && rooms.isNotEmpty())
                                Color(0xFF34D399)
                            else MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(Modifier.height(10.dp))

                // FlowRow displaying ALL rooms clearly without truncation!
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    rooms.forEachIndexed { idx, room ->
                        val isSelected = idx == currentRoomIdx
                        val isComplete = room.analyzed || room.photos.isNotEmpty() || room.furniture.isNotEmpty() || room.damages.isNotEmpty() || room.problems.isNotEmpty()

                        Surface(
                            onClick = { onCurrentRoomIdxChange(idx) },
                            shape = RoundedCornerShape(8.dp),
                            color = when {
                                isComplete && isSelected -> Color(0xFF059669)
                                isComplete -> Color(0xFF064E3B)
                                isSelected -> MaterialTheme.colorScheme.primary
                                else -> MaterialTheme.colorScheme.surface
                            },
                            border = BorderStroke(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = when {
                                    isComplete && isSelected -> Color(0xFF6EE7B7)
                                    isComplete -> Color(0xFF10B981)
                                    isSelected -> MaterialTheme.colorScheme.primary
                                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                                }
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                if (isComplete) {
                                    Icon(
                                        Icons.Default.Check,
                                        contentDescription = "Concluído",
                                        modifier = Modifier.size(13.dp),
                                        tint = if (isSelected) Color.White else Color(0xFF34D399)
                                    )
                                }
                                Text(
                                    text = room.name.ifBlank { "Cômodo ${idx + 1}" },
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = when {
                                        isSelected -> Color.White
                                        isComplete -> Color(0xFF34D399)
                                        else -> MaterialTheme.colorScheme.onSurface
                                    }
                                )
                                val totalCount = room.photos.size + room.furniture.size + room.damages.size + room.problems.size
                                if (totalCount > 0) {
                                    Text(
                                        text = "($totalCount)",
                                        fontSize = 10.sp,
                                        color = if (isSelected) Color.White.copy(alpha = 0.85f) else if (isComplete) Color(0xFF34D399).copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        val currentRoom = rooms.getOrNull(currentRoomIdx)
        if (currentRoom != null) {

            // ================= SECTION: ROOM PHOTOS & AI VISION BUTTON =================
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.PhotoCamera,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                "Fotos de ${currentRoom.name} (${currentRoom.photos.size})",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Prominent AI Analysis button right next to the photos
                        Button(
                            onClick = {
                                if (currentRoom.photos.isEmpty()) {
                                    Toast.makeText(context, "Adicione ou tire fotos primeiro para a IA analisar!", Toast.LENGTH_SHORT).show()
                                    return@Button
                                }
                                scope.launch {
                                    // Atualiza pelo id do cômodo (o estado pode mudar enquanto a IA responde)
                                    val roomId = currentRoom.id
                                    onUpdateRoom(roomId) { it.copy(analyzing = true) }

                                    val result = repository.analyzeRoomStructured(
                                        roomName = currentRoom.name,
                                        photos = currentRoom.photos,
                                        propertyType = tipoImovel,
                                        finality = finalidade,
                                        knownFurniture = currentRoom.furniture,
                                        knownDamages = currentRoom.damages
                                    )

                                    onUpdateRoom(roomId) { it.copy(analyzing = false) }

                                    result.fold(
                                        onSuccess = { inspection ->
                                            if (inspection.furniture.isEmpty() && inspection.damages.isEmpty() &&
                                                inspection.problems.isEmpty() && inspection.observations.isEmpty()
                                            ) {
                                                Toast.makeText(context, "A IA não identificou itens nestas fotos", Toast.LENGTH_LONG).show()
                                                return@fold
                                            }
                                            pendingAiRoomId = roomId
                                            pendingAiResult = inspection
                                            selectedMoveis = inspection.furniture.toSet()
                                            selectedAvarias = inspection.damages.toSet()
                                            selectedProblemas = inspection.problems.toSet()
                                        },
                                        onFailure = { err ->
                                            Toast.makeText(context, "Erro na análise: ${err.message}", Toast.LENGTH_LONG).show()
                                        }
                                    )
                                }
                            },
                            enabled = !currentRoom.analyzing && !isUploading,
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentRoom.photos.isNotEmpty()) Color(0xFF6366F1) else MaterialTheme.colorScheme.surfaceVariant,
                                contentColor = Color.White
                            )
                        ) {
                            if (currentRoom.analyzing) {
                                CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp, color = Color.White)
                                Spacer(Modifier.width(6.dp))
                                Text("Analisando...", fontSize = 11.sp)
                            } else {
                                Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Analisar com IA", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Buttons to Take Photo or Pick From Gallery
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onTakePhoto,
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Tirar Foto", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = onPickFromGallery,
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 8.dp),
                            enabled = !isUploading
                        ) {
                            if (isUploading) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.PhotoLibrary, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Adicionar Fotos", fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Thumbnails list
                    if (currentRoom.photos.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(64.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "Nenhuma foto neste cômodo ainda.\nTire fotos para a IA identificar móveis e avarias.",
                                textAlign = TextAlign.Center,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        LazyRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            itemsIndexed(currentRoom.photos) { pIdx, photo ->
                                Box(
                                    modifier = Modifier
                                        .size(72.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
                                ) {
                                    PhotoThumb(
                                        photo = photo,
                                        modifier = Modifier.fillMaxSize(),
                                        sizePx = 360
                                    )

                                    // Remove photo button
                                    Box(
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .padding(3.dp)
                                            .size(20.dp)
                                            .clip(CircleShape)
                                            .background(Color.Black.copy(alpha = 0.7f))
                                            .clickable {
                                                val newPhotos = currentRoom.photos.toMutableList()
                                                newPhotos.removeAt(pIdx)
                                                val updated = rooms.toMutableList()
                                                updated[currentRoomIdx] = currentRoom.copy(photos = newPhotos)
                                                onRoomsChange(updated)
                                            },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Default.Close,
                                            contentDescription = "Remover foto",
                                            tint = Color.White,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }

                                    // Photo index pill
                                    Surface(
                                        modifier = Modifier
                                            .align(Alignment.BottomStart)
                                            .padding(3.dp),
                                        shape = RoundedCornerShape(4.dp),
                                        color = Color.Black.copy(alpha = 0.65f)
                                    ) {
                                        Text(
                                            "#${pIdx + 1}",
                                            color = Color.White,
                                            fontSize = 9.sp,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(14.dp))

            // ================= INVENTORY TABS (MÓVEIS / AVARIAS / PROBLEMAS) =================
            var tab by remember { mutableIntStateOf(0) }
            val tabs = listOf("Móveis (${currentRoom.furniture.size})", "Avarias (${currentRoom.damages.size})", "Problemas (${currentRoom.problems.size})")

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                tabs.forEachIndexed { i, label ->
                    FilterChip(
                        selected = tab == i,
                        onClick = { tab = i },
                        label = { Text(label, fontSize = 11.sp, fontWeight = if (tab == i) FontWeight.Bold else FontWeight.Normal) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(Modifier.height(10.dp))

            var newItem by remember { mutableStateOf("") }

            when (tab) {
                0 -> {
                    // Relevance-filtered furniture for this room
                    val relevantList = remember(currentRoom.name) {
                        RoomFurnitureCatalog.getRelevantFurniture(currentRoom.name)
                    }
                    val displayedList = if (showAllFurniture) (relevantList + FurnitureItems.items).distinct() else relevantList

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Móveis relevantes para ${currentRoom.name}",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        TextButton(
                            onClick = { showAllFurniture = !showAllFurniture },
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp)
                        ) {
                            Text(
                                text = if (showAllFurniture) "Menos" else "+ Todos os 25",
                                fontSize = 11.sp
                            )
                        }
                    }
                    Spacer(Modifier.height(6.dp))

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        displayedList.forEach { furniture ->
                            val isSelected = furniture in currentRoom.furniture
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.furniture.toMutableList()
                                    if (isSelected) list.remove(furniture) else list.add(furniture)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        furniture = list) { onRoomsChange(it) }
                                },
                                label = { Text(furniture, fontSize = 10.sp, maxLines = 1) },
                                leadingIcon = {
                                    if (isSelected) Icon(Icons.Default.Check, null,
                                        modifier = Modifier.size(14.dp),
                                        tint = MaterialTheme.colorScheme.secondary)
                                },
                                border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.secondary) else null,
                                modifier = Modifier.height(30.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Outro móvel ou item...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = MaterialTheme.typography.bodySmall
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(onClick = {
                            if (newItem.isNotBlank()) {
                                val list = currentRoom.furniture + newItem.trim()
                                updateRoomInventory(rooms, currentRoomIdx,
                                    furniture = list) { onRoomsChange(it) }
                                newItem = ""
                            }
                        }) { Icon(Icons.Default.Add, contentDescription = "Adicionar") }
                    }
                }

                1 -> {
                    Text("Avarias visíveis neste cômodo",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))

                    val quickDamages = listOf(
                        "Desgaste no piso", "Arranhão na parede", "Porta arranhada",
                        "Pintura descascando", "Trinca superficial", "Mancha no teto"
                    )
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        quickDamages.forEach { dmg ->
                            val isSelected = dmg in currentRoom.damages
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.damages.toMutableList()
                                    if (isSelected) list.remove(dmg) else list.add(dmg)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        damages = list) { onRoomsChange(it) }
                                },
                                label = { Text(dmg, fontSize = 10.sp) },
                                leadingIcon = {
                                    if (isSelected) Icon(Icons.Default.Check, null,
                                        modifier = Modifier.size(14.dp),
                                        tint = Color(0xFFF59E0B))
                                },
                                border = if (isSelected) BorderStroke(1.5.dp, Color(0xFFF59E0B)) else null,
                                modifier = Modifier.height(30.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    currentRoom.damages.forEach { dmg ->
                        Row(
                            modifier = Modifier.padding(vertical = 3.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Warning, null, modifier = Modifier.size(16.dp),
                                tint = Color(0xFFF59E0B))
                            Spacer(Modifier.width(6.dp))
                            Text(dmg, style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f))
                            IconButton(
                                onClick = {
                                    val list = currentRoom.damages.toMutableList()
                                    list.remove(dmg)
                                    updateRoomInventory(rooms, currentRoomIdx, damages = list) { onRoomsChange(it) }
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.Close, null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Descrever outra avaria...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f), singleLine = true,
                            textStyle = MaterialTheme.typography.bodySmall
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(onClick = {
                            if (newItem.isNotBlank()) {
                                val list = currentRoom.damages + newItem.trim()
                                updateRoomInventory(rooms, currentRoomIdx,
                                    damages = list) { onRoomsChange(it) }
                                newItem = ""
                            }
                        }) { Icon(Icons.Default.Add, null) }
                    }
                }

                2 -> {
                    Text("Problemas e defeitos funcionais",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))

                    ProblemsCatalog.categories.forEach { category ->
                        Text(category.name,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(4.dp))

                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            category.problems.forEach { problem ->
                                val isSelected = problem in currentRoom.problems
                                AssistChip(
                                    onClick = {
                                        val list = currentRoom.problems.toMutableList()
                                        if (isSelected) list.remove(problem) else list.add(problem)
                                        updateRoomInventory(rooms, currentRoomIdx,
                                            problems = list) { onRoomsChange(it) }
                                    },
                                    label = { Text(problem, fontSize = 9.sp) },
                                    leadingIcon = {
                                        if (isSelected) Icon(Icons.Default.Check, null,
                                            modifier = Modifier.size(14.dp),
                                            tint = MaterialTheme.colorScheme.error)
                                    },
                                    border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.error) else null,
                                    modifier = Modifier.height(28.dp)
                                )
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                }
            }

            // Summary of items in current room
            Spacer(Modifier.height(10.dp))
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.photos.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("Fotos", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.furniture.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                        Text("Móveis", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.damages.size}", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                        Text("Avarias", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.problems.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                        Text("Problemas", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }

    // ================= INTERACTIVE AI CONFIRMATION DIALOG =================
    val aiResult = pendingAiResult
    if (aiResult != null && currentRoomIdx in rooms.indices) {
        val activeRoom = rooms[currentRoomIdx]
        AlertDialog(
            onDismissRequest = { pendingAiResult = null },
            icon = {
                Icon(
                    Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(28.dp)
                )
            },
            title = {
                Text(
                    text = "Itens Identificados pela IA",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        "A IA analisou as fotos de \"${activeRoom.name}\". Selecione quais itens deseja adicionar ao cômodo:",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(12.dp))

                    // 1. Móveis
                    if (aiResult.furniture.isNotEmpty()) {
                        Text(
                            "🛋️ Móveis e Mobília (${aiResult.furniture.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.furniture.forEach { item ->
                            val isChecked = item in selectedMoveis
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedMoveis = if (isChecked) selectedMoveis - item else selectedMoveis + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedMoveis = if (chk) selectedMoveis + item else selectedMoveis - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    // 2. Avarias
                    if (aiResult.damages.isNotEmpty()) {
                        Text(
                            "⚠️ Avarias e Danos Visíveis (${aiResult.damages.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF59E0B)
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.damages.forEach { item ->
                            val isChecked = item in selectedAvarias
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedAvarias = if (isChecked) selectedAvarias - item else selectedAvarias + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedAvarias = if (chk) selectedAvarias + item else selectedAvarias - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    // 3. Problemas
                    if (aiResult.problems.isNotEmpty()) {
                        Text(
                            "🛠️ Problemas / Defeitos (${aiResult.problems.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.problems.forEach { item ->
                            val isChecked = item in selectedProblemas
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedProblemas = if (isChecked) selectedProblemas - item else selectedProblemas + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedProblemas = if (chk) selectedProblemas + item else selectedProblemas - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }

                    if (aiResult.furniture.isEmpty() && aiResult.damages.isEmpty() && aiResult.problems.isEmpty()) {
                        Text(
                            "Nenhum item em particular detectado nas fotos. O cômodo foi marcado como analisado.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val targetId = pendingAiRoomId ?: rooms.getOrNull(currentRoomIdx)?.id
                        if (targetId != null) {
                            onUpdateRoom(targetId) { current ->
                                current.copy(
                                    furniture = (current.furniture + selectedMoveis).distinct(),
                                    damages = (current.damages + selectedAvarias).distinct(),
                                    problems = (current.problems + selectedProblemas).distinct(),
                                    items = (current.items + aiResult.observations).distinct(),
                                    analyzed = true
                                )
                            }
                        }
                        pendingAiResult = null
                        pendingAiRoomId = null
                        val count = selectedMoveis.size + selectedAvarias.size + selectedProblemas.size
                        Toast.makeText(context, "$count itens adicionados ao cômodo!", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Adicionar Selecionados", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { pendingAiResult = null }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

private fun updateRoomInventory(
    rooms: List<RoomData>, idx: Int,
    furniture: List<String>? = null,
    damages: List<String>? = null,
    problems: List<String>? = null,
    onResult: (List<RoomData>) -> Unit
) {
    val mutable = rooms.toMutableList()
    mutable[idx] = mutable[idx].copy(
        furniture = furniture ?: mutable[idx].furniture,
        damages = damages ?: mutable[idx].damages,
        problems = problems ?: mutable[idx].problems
    )
    onResult(mutable)
}

// FlowRow is available from compose.foundation.layout (stable since Compose 1.4)
