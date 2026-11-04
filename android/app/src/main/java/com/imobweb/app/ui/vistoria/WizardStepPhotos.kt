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

// ===================== STEP 5: Photos =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun StepPhotos(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit,
    repository: VistoriaRepository,
    tipoImovel: String, finalidade: String,
    context: Context,
    onTakePhoto: () -> Unit = {},
    onPickFromGallery: () -> Unit = {},
    onAnnotatePhoto: (roomIdx: Int, photoIdx: Int) -> Unit = { _, _ -> },
    onUpdateRoom: (roomId: String, (RoomData) -> RoomData) -> Unit = { _, _ -> },
    isUploading: Boolean = false
) {
    val scope = rememberCoroutineScope()

    Column {
        Text("Fotos e Anotações", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Adicione fotos de cada cômodo e marque problemas",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        // Room tabs
        if (rooms.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rooms.forEachIndexed { idx, room ->
                    FilterChip(
                        selected = idx == currentRoomIdx,
                        onClick = { onCurrentRoomIdxChange(idx) },
                        label = {
                            Text(
                                text = room.name.ifBlank { "Cômodo ${idx + 1}" },
                                fontSize = 11.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        },
                        leadingIcon = {
                            if (room.analyzed) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = MaterialTheme.colorScheme.secondary)
                            }
                        },
                        trailingIcon = {
                            val photoCount = room.photos.size
                            if (photoCount > 0) {
                                Text("$photoCount", fontSize = 9.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            val currentRoom = rooms.getOrNull(currentRoomIdx)
            if (currentRoom != null) {
                // Photo tips
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Dicas de fotos para ${currentRoom.name.ifBlank { "este cômodo" }}",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            RoomPhotoTips.getTips(currentRoom.name).forEach { tip ->
                                Surface(
                                    shape = MaterialTheme.shapes.small,
                                    color = MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Text(tip, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Action buttons row
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = onTakePhoto,
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(8.dp),
                        enabled = !isUploading
                    ) {
                        Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Tirar Foto", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = onPickFromGallery,
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(8.dp),
                        enabled = !isUploading
                    ) {
                        if (isUploading) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.PhotoLibrary, contentDescription = null, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Galeria", fontSize = 12.sp)
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                // AI Analysis button
                if (currentRoom.photos.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            scope.launch {
                                val idx = currentRoomIdx
                                val roomId = currentRoom.id
                                onUpdateRoom(roomId) { it.copy(analyzing = true) }
                                val result = repository.analyzeRoom(
                                    roomName = currentRoom.name.ifBlank { "Cômodo ${idx + 1}" },
                                    photos = currentRoom.photos,
                                    propertyType = tipoImovel,
                                    finality = finalidade
                                )
                                result.fold(
                                    onSuccess = { items ->
                                        onUpdateRoom(roomId) {
                                            it.copy(items = items, analyzing = false, analyzed = true)
                                        }
                                        Toast.makeText(context, "Análise concluída: ${items.size} constatações", Toast.LENGTH_SHORT).show()
                                    },
                                    onFailure = { e ->
                                        onUpdateRoom(roomId) { it.copy(analyzing = false) }
                                        Toast.makeText(context, "Erro na análise: ${e.message}", Toast.LENGTH_LONG).show()
                                    }
                                )
                            }
                        },
                        enabled = !currentRoom.analyzing,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (currentRoom.analyzing) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                        } else {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                        }
                        Text(if (currentRoom.analyzing) "Analisando..." else "Analisar com IA")
                    }
                    Spacer(Modifier.height(12.dp))
                }

                // Photos grid
                if (currentRoom.photos.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null,
                                modifier = Modifier.size(40.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                            Text("Nenhuma foto ainda",
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                } else {
                    val photoList = currentRoom.photos
                    Column {
                        var globalIdx = 0
                        photoList.chunked(3).forEach { row ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                row.forEachIndexed { rowIdx, photo ->
                                    val photoIdx = globalIdx++
                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .clickable {
                                                onAnnotatePhoto(currentRoomIdx, photoIdx)
                                            },
                                        border = if (photo.annotations.isNotEmpty())
                                            BorderStroke(2.dp, MaterialTheme.colorScheme.error)
                                        else null
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize()) {
                                            PhotoThumb(
                                                photo = photo,
                                                modifier = Modifier.fillMaxSize(),
                                                sizePx = 360
                                            )
                                            if (photo.annotations.isNotEmpty()) {
                                                Surface(
                                                    modifier = Modifier
                                                        .align(Alignment.TopStart)
                                                        .padding(4.dp),
                                                    shape = MaterialTheme.shapes.small,
                                                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f)
                                                ) {
                                                    Text(
                                                        "${photo.annotations.size} pts",
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                                                        style = MaterialTheme.typography.labelSmall,
                                                        color = MaterialTheme.colorScheme.onError
                                                    )
                                                }
                                            }
                                            Row(
                                                modifier = Modifier
                                                    .align(Alignment.BottomStart)
                                                    .padding(4.dp),
                                                horizontalArrangement = Arrangement.spacedBy(2.dp)
                                            ) {
                                                repeat(minOf(photo.annotations.size, 3)) { i ->
                                                    Box(
                                                        modifier = Modifier
                                                            .size(6.dp)
                                                            .clip(CircleShape)
                                                            .background(Color(0xFFEF4444))
                                                    )
                                                }
                                            }
                                            IconButton(
                                                onClick = {
                                                    val mutable = rooms.toMutableList()
                                                    val r = mutable[currentRoomIdx]
                                                    val newPhotos = r.photos.toMutableList()
                                                    newPhotos.removeAt(photoIdx)
                                                    mutable[currentRoomIdx] = r.copy(photos = newPhotos)
                                                    onRoomsChange(mutable)
                                                },
                                                modifier = Modifier.align(Alignment.TopEnd)
                                            ) {
                                                Icon(Icons.Default.Close, contentDescription = "Remover",
                                                    tint = Color.White.copy(alpha = 0.8f),
                                                    modifier = Modifier.size(18.dp))
                                            }
                                        }
                                    }
                                }
                                repeat(3 - row.size) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Items detected
                if (currentRoom.items.isNotEmpty()) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Itens detectados (${currentRoom.items.size})",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.secondary)
                            Spacer(Modifier.height(4.dp))
                            currentRoom.items.take(8).forEach { item ->
                                Text("• $item",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            if (currentRoom.items.size > 8) {
                                Text("+${currentRoom.items.size - 8} mais...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
                            }
                        }
                    }
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                Text("Adicione cômodos primeiro",
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
