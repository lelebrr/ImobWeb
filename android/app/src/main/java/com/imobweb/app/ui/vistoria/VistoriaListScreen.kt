package com.imobweb.app.ui.vistoria

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.LaudoHtmlBuilder
import com.imobweb.app.util.ReportPdfExporter
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VistoriaListScreen(
    repository: VistoriaRepository,
    onBack: () -> Unit,
    onEditVistoria: (Long) -> Unit,
    onViewVistoria: (Long) -> Unit
) {
    val vistorias by repository.getAllVistorias().collectAsState(initial = emptyList())
    val scope = rememberCoroutineScope()
    var filterStatus by remember { mutableStateOf("all") }
    var searchQuery by remember { mutableStateOf("") }
    var reportVistoria by remember { mutableStateOf<Vistoria?>(null) }
    var vistoriaToDelete by remember { mutableStateOf<Vistoria?>(null) }

    val filteredVistorias = remember(vistorias, filterStatus, searchQuery) {
        vistorias.filter { v ->
            val matchesStatus = filterStatus == "all" || v.status == filterStatus
            val matchesSearch = searchQuery.isBlank() ||
                    v.condominio.contains(searchQuery, ignoreCase = true) ||
                    v.endereco.contains(searchQuery, ignoreCase = true) ||
                    v.locatario.contains(searchQuery, ignoreCase = true)
            matchesStatus && matchesSearch
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Minhas Vistorias", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
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
        ) {
            // Search bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Buscar por condomínio, endereço...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Limpar")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                singleLine = true,
                shape = MaterialTheme.shapes.large
            )

            // Filter chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("all" to "Todas", "draft" to "Rascunho", "pending_sync" to "Pendente", "synced" to "Sincronizado").forEach { (key, label) ->
                    FilterChip(
                        selected = filterStatus == key,
                        onClick = { filterStatus = key },
                        label = { Text(label, fontSize = 11.sp) }
                    )
                }
            }

            if (filteredVistorias.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.SearchOff,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "Nenhuma vistoria encontrada",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filteredVistorias, key = { it.id }) { vistoria ->
                        VistoriaListItem(
                            vistoria = vistoria,
                            onView = { onViewVistoria(vistoria.id) },
                            onEdit = { onEditVistoria(vistoria.id) },
                            onReport = { reportVistoria = vistoria },
                            onDelete = { vistoriaToDelete = vistoria }
                        )
                    }
                }
            }
        }
    }

    // Diálogo de confirmação de exclusão
    if (vistoriaToDelete != null) {
        val target = vistoriaToDelete!!
        AlertDialog(
            onDismissRequest = { vistoriaToDelete = null },
            icon = { Icon(Icons.Default.DeleteForever, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Excluir Vistoria") },
            text = {
                Text("Deseja realmente excluir a vistoria de \"${target.condominio.ifBlank { target.endereco.ifBlank { "Vistoria" } }}\"? Esta ação não pode ser desfeita.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val toDel = vistoriaToDelete
                        vistoriaToDelete = null
                        if (toDel != null) {
                            scope.launch {
                                repository.deleteVistoria(toDel)
                            }
                        }
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Excluir", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { vistoriaToDelete = null }) {
                    Text("Cancelar")
                }
            }
        )
    }

    val report = reportVistoria
    if (report != null) {
        PdfPreviewScreen(
            htmlContent = remember(report.id) { LaudoHtmlBuilder.build(report) },
            title = "Laudo - ${report.condominio.ifBlank { "Vistoria" }}",
            fileName = remember(report.id) { ReportPdfExporter.fileNameFor(report) },
            onClose = { reportVistoria = null }
        )
    }
}

@Composable
private fun VistoriaListItem(
    vistoria: Vistoria,
    onView: () -> Unit,
    onEdit: () -> Unit,
    onReport: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onView),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Home,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = vistoria.condominio.ifBlank { "Sem nome" },
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = buildString {
                        append(vistoria.endereco.ifBlank { "Sem endereço" })
                        if (vistoria.numero.isNotBlank()) append(", ${vistoria.numero}")
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${vistoria.rooms.size} cômodos · ${vistoria.rooms.sumOf { it.photos.size }} fotos",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.width(8.dp))
                    StatusBadge(vistoria.status)
                }
            }
            IconButton(onClick = onReport) {
                Icon(Icons.Default.PictureAsPdf, contentDescription = "Gerar laudo em PDF",
                    tint = MaterialTheme.colorScheme.secondary)
            }
            IconButton(onClick = onEdit) {
                Icon(Icons.Default.Edit, contentDescription = "Editar",
                    tint = MaterialTheme.colorScheme.primary)
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Excluir",
                    tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f))
            }
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (label, color) = when (status) {
        "synced" -> "Sincronizado" to MaterialTheme.colorScheme.secondary
        "pending_sync" -> "Pendente" to MaterialTheme.colorScheme.error
        else -> "Rascunho" to MaterialTheme.colorScheme.tertiary
    }

    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.15f)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}
