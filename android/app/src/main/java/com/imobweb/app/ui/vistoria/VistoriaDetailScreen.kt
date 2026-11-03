package com.imobweb.app.ui.vistoria

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.LaudoHtmlBuilder
import com.imobweb.app.util.ReportPdfExporter
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VistoriaDetailScreen(
    repository: VistoriaRepository,
    vistoriaId: Long,
    onBack: () -> Unit,
    onEdit: () -> Unit
) {
    var vistoria by remember { mutableStateOf<Vistoria?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var showPdfViewer by remember { mutableStateOf(false) }
    var pdfContent by remember { mutableStateOf("") }
    var pdfFileName by remember { mutableStateOf("Laudo_Vistoria.pdf") }
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var buildingPdf by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(vistoriaId) {
        vistoria = repository.getVistoriaById(vistoriaId)
        isLoading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalhes da Vistoria", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Editar")
                    }
                    IconButton(onClick = { showDeleteConfirm = true }) {
                        Icon(
                            Icons.Default.DeleteOutline,
                            contentDescription = "Excluir",
                            tint = MaterialTheme.colorScheme.error.copy(alpha = 0.8f)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            if (vistoria != null) {
                Surface(color = MaterialTheme.colorScheme.surface, shadowElevation = 8.dp) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = onEdit,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Editar")
                        }
                        Button(
                            onClick = {
                                val v = vistoria ?: return@Button
                                scope.launch {
                                    buildingPdf = true
                                    // Lê e codifica todas as fotos: fora da thread da UI
                                    runCatching {
                                        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Default) { LaudoHtmlBuilder.build(v) }
                                    }.onSuccess {
                                        pdfContent = it
                                        pdfFileName = ReportPdfExporter.fileNameFor(v)
                                        showPdfViewer = true
                                    }.onFailure { e ->
                                        Toast.makeText(context, "Erro ao gerar laudo: ${e.message}", Toast.LENGTH_LONG).show()
                                    }
                                    buildingPdf = false
                                }
                            },
                            enabled = !buildingPdf,
                            modifier = Modifier.weight(1f)
                        ) {
                            if (buildingPdf) CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            else Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Gerar Laudo")
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (vistoria == null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Vistoria não encontrada", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            val v = vistoria!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Status card
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            when (v.status) {
                                "synced" -> Icons.Default.CloudDone
                                "pending_sync" -> Icons.Default.CloudOff
                                else -> Icons.Default.Edit
                            },
                            contentDescription = null,
                            tint = when (v.status) {
                                "synced" -> MaterialTheme.colorScheme.secondary
                                "pending_sync" -> MaterialTheme.colorScheme.error
                                else -> MaterialTheme.colorScheme.tertiary
                            },
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                when (v.status) {
                                    "synced" -> "Sincronizado"
                                    "pending_sync" -> "Pendente de sincronização"
                                    else -> "Rascunho"
                                },
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "${v.rooms.size} cômodos · ${v.rooms.sumOf { it.photos.size }} fotos",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Property info
                DetailSection("Imóvel") {
                    DetailRow("Condomínio", v.condominio)
                    DetailRow("Endereço", "${v.endereco}, ${v.numero}")
                    if (v.conjApto.isNotBlank()) DetailRow("Complemento", v.conjApto)
                    DetailRow("Bairro", v.bairro)
                    DetailRow("Cidade", "${v.cidade}/${v.estado}")
                    DetailRow("CEP", v.cep)
                    DetailRow("Tipo", "${v.tipoImovel} · ${v.finalidade}")
                    if (v.metragem.isNotBlank()) DetailRow("Metragem", v.metragem)
                    DetailRow("Mobiliado", v.mobiliado)
                }

                Spacer(Modifier.height(12.dp))

                // Parties info
                DetailSection("Partes Envolvidas") {
                    DetailRow("Locadora", v.locadora)
                    if (v.locadoraCpf.isNotBlank()) DetailRow("CPF/CNPJ Locadora", v.locadoraCpf)
                    DetailRow("Locatário", v.locatario)
                    if (v.locatarioCpf.isNotBlank()) DetailRow("CPF/CNPJ Locatário", v.locatarioCpf)
                    if (v.vistoriadora.isNotBlank()) DetailRow("Vistoriadora", v.vistoriadora)
                    if (v.solicitante.isNotBlank()) DetailRow("Solicitante", v.solicitante)
                }

                Spacer(Modifier.height(12.dp))

                // Rooms summary
                DetailSection("Cômodos (${v.rooms.size})") {
                    v.rooms.forEachIndexed { idx, room ->
                        Row(
                            modifier = Modifier.padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                modifier = Modifier.size(28.dp),
                                shape = MaterialTheme.shapes.small,
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("${idx + 1}",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary)
                                }
                            }
                            Spacer(Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(room.name.ifBlank { "Sem nome" },
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold)
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text("${room.photos.size} fotos",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    if (room.furniture.isNotEmpty()) {
                                        Text("· ${room.furniture.size} móveis",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    if (room.damages.isNotEmpty() || room.problems.isNotEmpty()) {
                                        Text("· ${room.damages.size + room.problems.size} não conf.",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.error)
                                    }
                                }
                            }
                        }
                    }
                }

                // Observations
                if (v.consideracoes.isNotBlank()) {
                    Spacer(Modifier.height(12.dp))
                    DetailSection("Observações") {
                        Text(v.consideracoes, style = MaterialTheme.typography.bodySmall)
                    }
                }

                Spacer(Modifier.height(16.dp))
            }
        }
    }

    if (showDeleteConfirm && vistoria != null) {
        val target = vistoria!!
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            icon = { Icon(Icons.Default.DeleteForever, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Excluir Vistoria") },
            text = {
                Text("Deseja realmente excluir a vistoria de \"${target.condominio.ifBlank { target.endereco.ifBlank { "Vistoria" } }}\"? Esta ação não pode ser desfeita.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteConfirm = false
                        scope.launch {
                            try {
                                repository.deleteVistoria(target)
                                Toast.makeText(context, "Vistoria excluída com sucesso", Toast.LENGTH_SHORT).show()
                                onBack()
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
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    if (showPdfViewer) {
        androidx.activity.compose.BackHandler { showPdfViewer = false }
        PdfPreviewScreen(
            htmlContent = pdfContent,
            title = "Laudo - ${vistoria?.condominio.orEmpty().ifBlank { "Vistoria" }}",
            fileName = pdfFileName,
            onClose = { showPdfViewer = false }
        )
    }
}

@Composable
private fun DetailSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(8.dp))
            content()
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    if (value.isNotBlank()) {
        Row(modifier = Modifier.padding(vertical = 2.dp)) {
            Text("$label: ", style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodySmall)
        }
    }
}
