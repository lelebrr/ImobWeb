package com.imobweb.app.ui.vistoria

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.TipoVistoria
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.LaudoHtmlBuilder
import com.imobweb.app.util.PdfTemplateCatalog
import com.imobweb.app.util.PdfTemplateConfig
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
    val context = LocalContext.current
    var filterStatus by remember { mutableStateOf("all") }
    var searchQuery by remember { mutableStateOf("") }
    var reportVistoria by remember { mutableStateOf<Vistoria?>(null) }
    var vistoriaToDelete by remember { mutableStateOf<Vistoria?>(null) }
    var activeReportTemplate by remember { mutableStateOf<PdfTemplateConfig?>(null) }
    var customTemplateDraft by remember { mutableStateOf(PdfTemplateCatalog.loadCustomTemplate(context)) }
    var showTemplatePickerDialog by remember { mutableStateOf(false) }
    var showCustomBuilderDialog by remember { mutableStateOf(false) }

    LaunchedEffect(reportVistoria?.id) {
        val r = reportVistoria
        activeReportTemplate = if (r != null) PdfTemplateCatalog.loadForVistoria(context, r.id) else null
    }

    val filteredVistorias = remember(vistorias, filterStatus, searchQuery) {
        vistorias.filter { v ->
            val matchesStatus = when (filterStatus) {
                "all" -> true
                "entrada" -> v.tipoVistoria == TipoVistoria.ENTRADA
                "saida" -> v.tipoVistoria == TipoVistoria.SAIDA
                else -> v.status == filterStatus
            }
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

            // Filter chips (rolável horizontalmente)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "all" to "Todas",
                    "entrada" to "Entrada",
                    "saida" to "Saída",
                    "pending_sync" to "Pendente",
                    "synced" to "Sincronizado",
                    "conflict" to "Conflito"
                ).forEach { (key, label) ->
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
                        val toDel = target
                        vistoriaToDelete = null
                        scope.launch {
                            try {
                                repository.deleteVistoria(toDel)
                                Toast.makeText(context, "Vistoria excluída com sucesso", Toast.LENGTH_SHORT).show()
                            } catch (e: Exception) {
                                Toast.makeText(context, "Erro ao excluir: ${e.message}", Toast.LENGTH_LONG).show()
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
        androidx.activity.compose.BackHandler { reportVistoria = null }
        val chosenTemplate = activeReportTemplate ?: PdfTemplateCatalog.loadForVistoria(context, report.id)
        // Montar o laudo lê e codifica todas as fotos: fora da thread da UI
        val html by produceState<String?>(initialValue = null, report.id, report.updatedAt, chosenTemplate) {
            value = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Default) {
                val opts = com.imobweb.app.ui.settings.loadLaudoOptions(context, report.id)
                    .copy(template = chosenTemplate)
                runCatching { LaudoHtmlBuilder.build(report, opts) }.getOrElse { e ->
                    "<html><body><p>Erro ao montar o laudo: ${e.message}</p></body></html>"
                }
            }
        }
        val content = html
        if (content == null) {
            Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            PdfPreviewScreen(
                htmlContent = content,
                title = "Laudo - ${report.condominio.ifBlank { "Vistoria" }}",
                fileName = remember(report.id) { ReportPdfExporter.fileNameFor(report) },
                templateLabel = "#${chosenTemplate.number} ${chosenTemplate.name}",
                onChangeTemplate = { showTemplatePickerDialog = true },
                onClose = { reportVistoria = null }
            )
        }

        if (showTemplatePickerDialog) {
            PdfTemplatePickerDialog(
                selectedTemplate = chosenTemplate,
                customTemplate = customTemplateDraft,
                onSelectPreset = { newTmpl ->
                    activeReportTemplate = newTmpl
                    PdfTemplateCatalog.saveForVistoria(context, report.id, newTmpl)
                },
                onOpenCustomBuilder = { showCustomBuilderDialog = true },
                onDismiss = { showTemplatePickerDialog = false }
            )
        }

        if (showCustomBuilderDialog) {
            CustomTemplateBuilderDialog(
                initialConfig = if (chosenTemplate.id == "t9_custom") chosenTemplate else customTemplateDraft,
                onDismiss = { showCustomBuilderDialog = false },
                onSave = { savedCfg ->
                    PdfTemplateCatalog.saveCustomTemplate(context, savedCfg)
                    customTemplateDraft = savedCfg
                    activeReportTemplate = savedCfg
                    PdfTemplateCatalog.saveForVistoria(context, report.id, savedCfg)
                    showCustomBuilderDialog = false
                    Toast.makeText(context, "Template personalizado #9 aplicado!", Toast.LENGTH_SHORT).show()
                }
            )
        }
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
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onView),
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
                        text = vistoria.condominio.ifBlank { vistoria.endereco.ifBlank { "Sem nome" } },
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (vistoria.hasConflict) {
                        Text("⚠ Conflito de versões — abra para escolher", style = MaterialTheme.typography.labelSmall,
                            color = androidx.compose.ui.graphics.Color(0xFFF59E0B), fontWeight = FontWeight.Bold)
                    } else if (vistoria.ownerOrg == "?") {
                        Text("Outra conta · só neste aparelho", style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text(
                        text = "Vistoria de ${com.imobweb.app.model.TipoVistoria.label(vistoria.tipoVistoria).lowercase()} · ${vistoria.dataLaudo}",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (vistoria.tipoVistoria == com.imobweb.app.model.TipoVistoria.SAIDA) MaterialTheme.colorScheme.tertiary
                            else MaterialTheme.colorScheme.primary
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
                    val furnCount = vistoria.rooms.sumOf { roomFurnitureCount(it) }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = buildString {
                                append("${vistoria.rooms.size} cômodos · ${vistoria.rooms.sumOf { it.photos.size }} fotos")
                                if (furnCount > 0) append(" · $furnCount móveis")
                            },
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.width(8.dp))
                        StatusBadge(vistoria.status)
                    }
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
                Icon(Icons.Default.DeleteForever, contentDescription = "Excluir",
                    tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (label, color) = when (status) {
        "synced" -> "Sincronizado" to MaterialTheme.colorScheme.secondary
        "pending_sync", "pending_force" -> "Pendente" to MaterialTheme.colorScheme.error
        "conflict" -> "Conflito" to androidx.compose.ui.graphics.Color(0xFFF59E0B)
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
