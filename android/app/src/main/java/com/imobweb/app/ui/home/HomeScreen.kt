package com.imobweb.app.ui.home

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.imobweb.app.data.repository.SyncWorker
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.ConnectivityObserver
import com.imobweb.app.util.ConnectivityStatus
import com.imobweb.app.util.Formatters
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    repository: VistoriaRepository,
    onNewVistoria: () -> Unit,
    onViewVistorias: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val vistorias by repository.getAllVistorias().collectAsState(initial = emptyList())
    val pendingSyncCount by repository.getPendingSyncCount().collectAsState(initial = 0)
    var isSyncing by remember { mutableStateOf(false) }
    var showSyncAnimation by remember { mutableStateOf(false) }

    // Connectivity observer
    val connectivityObserver = remember { ConnectivityObserver(context) }
    val connectivityStatus by connectivityObserver.status.collectAsState()

    DisposableEffect(Unit) {
        onDispose { connectivityObserver.unregister() }
    }

    val isOnline = connectivityStatus == ConnectivityStatus.Available

    // Auto-sync when connectivity restored
    LaunchedEffect(isOnline) {
        if (isOnline && pendingSyncCount > 0) {
            isSyncing = true
            showSyncAnimation = true
            val synced = repository.syncPendingVistorias()
            isSyncing = false
        }
    }

    val totalRooms = vistorias.sumOf { it.rooms.size }
    val totalPhotos = vistorias.sumOf { v -> v.rooms.sumOf { it.photos.size } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("ImobWeb", fontWeight = FontWeight.Black)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Vistorias", style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(Modifier.width(8.dp))
                            Surface(
                                shape = MaterialTheme.shapes.small,
                                color = if (isOnline) Color(0xFF34D399).copy(alpha = 0.15f)
                                else Color(0xFFEF4444).copy(alpha = 0.15f)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .background(
                                                if (isOnline) Color(0xFF34D399) else Color(0xFFEF4444),
                                                shape = MaterialTheme.shapes.extraLarge
                                            )
                                    )
                                    Spacer(Modifier.width(4.dp))
                                    Text(
                                        if (isOnline) "Online" else "Offline",
                                        fontSize = 9.sp,
                                        color = if (isOnline) Color(0xFF34D399) else Color(0xFFEF4444),
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                },
                actions = {
                    AnimatedVisibility(visible = isSyncing) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(Modifier.width(4.dp))
                            Text("Sincronizando...", fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    if (pendingSyncCount > 0 && !isSyncing) {
                        Badge(
                            containerColor = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Text("$pendingSyncCount", fontSize = 9.sp)
                        }
                    }
                    IconButton(onClick = {
                        scope.launch {
                            isSyncing = true
                            SyncWorker.syncNow(context)
                            isSyncing = false
                        }
                    }) {
                        Icon(
                            Icons.Default.Sync,
                            contentDescription = "Sincronizar",
                            tint = if (isSyncing) MaterialTheme.colorScheme.primary
                            else LocalContentColor.current
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Offline banner
            AnimatedVisibility(visible = !isOnline && vistorias.isNotEmpty()) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFFF59E0B).copy(alpha = 0.1f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.WifiOff, contentDescription = null,
                            tint = Color(0xFFF59E0B), modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Sem conexão - as vistorias serão salvas localmente",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFF59E0B))
                    }
                }
            }

            // Stats row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard("Total", "${vistorias.size}", "vistorias",
                    Icons.Default.Assessment, MaterialTheme.colorScheme.primary,
                    Modifier.weight(1f))
                StatCard("Cômodos", "$totalRooms", "registrados",
                    Icons.Default.Meal, MaterialTheme.colorScheme.secondary,
                    Modifier.weight(1f))
                StatCard("Fotos", "$totalPhotos", "tiradas",
                    Icons.Default.CameraAlt, MaterialTheme.colorScheme.tertiary,
                    Modifier.weight(1f))
            }

            // Action cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActionCard(
                    title = "Nova Vistoria",
                    subtitle = "Criar do zero",
                    icon = Icons.Default.AddCircle,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f),
                    onClick = onNewVistoria
                )
                ActionCard(
                    title = "Minhas Vistorias",
                    subtitle = "${vistorias.size} registros",
                    icon = Icons.Default.ListAlt,
                    color = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.weight(1f),
                    onClick = onViewVistorias
                )
                ActionCard(
                    title = if (pendingSyncCount > 0) "Sincronizar" else "OK",
                    subtitle = if (pendingSyncCount > 0) "$pendingSyncCount pendentes" else "Tudo ok",
                    icon = if (pendingSyncCount > 0) Icons.Default.CloudOff else Icons.Default.CloudDone,
                    color = if (pendingSyncCount > 0) Color(0xFFF59E0B) else Color(0xFF34D399),
                    modifier = Modifier.weight(1f),
                    onClick = {
                        if (pendingSyncCount > 0) {
                            scope.launch {
                                isSyncing = true
                                SyncWorker.syncNow(context)
                                isSyncing = false
                            }
                        }
                    }
                )
            }

            Spacer(Modifier.height(12.dp))

            // Recent inspections
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Vistorias Recentes",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                if (vistorias.isNotEmpty()) {
                    TextButton(onClick = onViewVistorias) {
                        Text("Ver Todas", fontSize = 12.sp)
                    }
                }
            }

            if (vistorias.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.Description,
                            contentDescription = null,
                            modifier = Modifier.size(72.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                        )
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "Nenhuma vistoria ainda",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "Toque em \"Nova Vistoria\" para começar",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                        Spacer(Modifier.height(24.dp))
                        FilledTonalButton(onClick = onNewVistoria) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Criar Primeira Vistoria")
                        }
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(vistorias.take(10), key = { it.id }) { vistoria ->
                        VistoriaHomeCard(vistoria = vistoria, onClick = onViewVistorias)
                    }
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    label: String, value: String, sublabel: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color, modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        color = color.copy(alpha = 0.08f)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(4.dp))
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = color)
            Text(sublabel, style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
            Spacer(Modifier.height(8.dp))
            Text(title, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun VistoriaHomeCard(vistoria: Vistoria, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(44.dp),
                shape = MaterialTheme.shapes.medium,
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Home, contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = vistoria.condominio.ifBlank { "Sem nome" },
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = buildString {
                        append(vistoria.endereco.ifBlank { "Sem endereço" })
                        if (vistoria.numero.isNotBlank()) append(", ${vistoria.numero}")
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("${vistoria.rooms.size} cômodos · ${vistoria.rooms.sumOf { it.photos.size }} fotos",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.width(8.dp))
                    StatusBadge(vistoria.status)
                }
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (label, color) = when (status) {
        "synced" -> "Sincronizado" to Color(0xFF34D399)
        "pending_sync" -> "Pendente" to Color(0xFFEF4444)
        else -> "Rascunho" to Color(0xFFF59E0B)
    }

    Surface(shape = MaterialTheme.shapes.small, color = color.copy(alpha = 0.15f)) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = color,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
    }
}
