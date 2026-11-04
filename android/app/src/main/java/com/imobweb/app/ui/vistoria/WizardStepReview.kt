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

// ===================== STEP 5: Review =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun StepReview(
    condominio: String, endereco: String, numero: String,
    conjApto: String, cep: String, bairro: String,
    cidade: String, estado: String, tipoImovel: String,
    finalidade: String, metragem: String, mobiliado: String,
    locadora: String, locatario: String,
    vistoriadora: String, solicitante: String,
    rooms: List<RoomData>,
    consideracoes: String, onConsideracoesChange: (String) -> Unit,
    locadoraCpf: String = "", locatarioCpf: String = "",
    dataVistoria: String = "", onDataVistoriaChange: (String) -> Unit = {}
) {
    val context = LocalContext.current

    fun pickDate() {
        val cal = Calendar.getInstance()
        runCatching {
            SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).parse(dataVistoria)
        }.getOrNull()?.let { cal.time = it }
        android.app.DatePickerDialog(
            context,
            { _, y, m, d -> onDataVistoriaChange(String.format(Locale.US, "%02d/%02d/%04d", d, m + 1, y)) },
            cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    // Pendências que deixam o laudo frágil (conferência antes de gerar o PDF)
    val warnings = buildList {
        val semFoto = rooms.filter { it.photos.isEmpty() }.map { it.name }
        if (semFoto.isNotEmpty()) add("Cômodos sem foto: ${semFoto.joinToString(", ")}")
        val semFotoArquivo = rooms.sumOf { r -> r.photos.count { !com.imobweb.app.util.PhotoStore.exists(it) } }
        if (semFotoArquivo > 0) add("$semFotoArquivo foto(s) não encontradas no aparelho")
        if (locadoraCpf.isBlank()) add("CPF/CNPJ da locadora não informado")
        if (locatarioCpf.isBlank()) add("CPF/CNPJ do locatário não informado")
        if (vistoriadora.isBlank()) add("Nome da vistoriadora não informado")
        val vazios = rooms.filter { it.items.isEmpty() && it.furniture.isEmpty() && it.damages.isEmpty() && it.problems.isEmpty() }
        if (vazios.isNotEmpty()) add("Cômodos sem nenhuma descrição: ${vazios.joinToString(", ") { it.name }}")
        val pendentes = rooms.filter { it.proposals.isNotEmpty() }
        if (pendentes.isNotEmpty()) add("Sugestões da IA não revisadas (não entram no laudo): ${pendentes.joinToString(", ") { it.name }}")
        val semChecklist = rooms.filter { it.checklist.isEmpty() }
        if (semChecklist.isNotEmpty()) add("Cômodos sem checklist de conservação: ${semChecklist.joinToString(", ") { it.name }}")
    }

    Column {
        Text("Revisão e Observações", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Revise os dados, adicione observações e finalize",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        if (warnings.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF59E0B).copy(alpha = 0.12f))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Confira antes de finalizar", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold, color = Color(0xFFF59E0B))
                    }
                    Spacer(Modifier.height(6.dp))
                    warnings.forEach { w ->
                        Text("• $w", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
        }

        // Summary cards
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Imóvel", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                InfoRow("Condomínio", condominio)
                InfoRow("Endereço", "$endereco, $numero")
                if (conjApto.isNotBlank()) InfoRow("Complemento", conjApto)
                InfoRow("Bairro", bairro)
                InfoRow("Cidade/UF", "$cidade/$estado")
                InfoRow("Tipo", "$tipoImovel · $finalidade · $mobiliado")
                if (metragem.isNotBlank()) InfoRow("Metragem", metragem)
            }
        }

        Spacer(Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Partes", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                InfoRow("Locadora", locadora)
                InfoRow("Locatário", locatario)
                if (vistoriadora.isNotBlank()) InfoRow("Vistoriadora", vistoriadora)
                if (solicitante.isNotBlank()) InfoRow("Solicitante", solicitante)
            }
        }

        Spacer(Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Cômodos (${rooms.size})", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                rooms.forEachIndexed { idx, room ->
                    Row(
                        modifier = Modifier.padding(vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(24.dp),
                            shape = MaterialTheme.shapes.small,
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("${idx + 1}", style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary)
                            }
                        }
                        Spacer(Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(room.name.ifBlank { "Sem nome" },
                                style = MaterialTheme.typography.bodyMedium)
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("${room.photos.size} fotos",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                                if (room.furniture.isNotEmpty()) {
                                    Text("· ${room.furniture.size} móveis",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                if (room.problems.isNotEmpty()) {
                                    Text("· ${room.problems.size} problemas",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // Observations
        Text("Observações", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))

        // Quick observation templates
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf(
                "Imóvel em bom estado",
                "Pintura recente",
                "Hidráulica OK",
                "Elétrica OK"
            ).forEach { template ->
                AssistChip(
                    onClick = {
                        onConsideracoesChange(
                            if (consideracoes.isBlank()) template
                            else "$consideracoes\n• $template"
                        )
                    },
                    label = { Text(template, fontSize = 10.sp) },
                    modifier = Modifier.height(28.dp)
                )
            }
        }

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = consideracoes,
            onValueChange = onConsideracoesChange,
            label = { Text("Observações finais") },
            placeholder = { Text("Descreva observações relevantes sobre a vistoria...") },
            modifier = Modifier.fillMaxWidth().height(150.dp),
            maxLines = 8
        )

        Spacer(Modifier.height(8.dp))

        Card(
            onClick = { pickDate() },
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
            )
        ) {
            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.DateRange, contentDescription = null,
                    tint = MaterialTheme.colorScheme.tertiary, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Data da vistoria: ${dataVistoria.ifBlank { "—" }}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold)
                    Text("Ao finalizar, o laudo será gerado e salvo no dispositivo.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Icon(Icons.Default.Edit, contentDescription = "Alterar data",
                    tint = MaterialTheme.colorScheme.tertiary, modifier = Modifier.size(18.dp))
            }
        }

        Spacer(Modifier.height(8.dp))

        // WhatsApp Share
        OutlinedButton(
            onClick = {
                try {
                    val text = "Laudo de Vistoria - $condominio\n$endereco, $numero - $bairro\n$cidade/$estado\n${rooms.size} cômodos, ${rooms.sumOf { r -> r.photos.size }} fotos"
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW).apply {
                        data = android.net.Uri.parse("https://wa.me/?text=${java.net.URLEncoder.encode(text, "UTF-8")}")
                    }
                    context.startActivity(intent)
                } catch (_: Exception) {
                    Toast.makeText(context, "WhatsApp não instalado", Toast.LENGTH_SHORT).show()
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Compartilhar resumo via WhatsApp")
        }
    }
}

@Composable
internal fun InfoRow(label: String, value: String) {
    if (value.isNotBlank()) {
        Row(modifier = Modifier.padding(vertical = 2.dp)) {
            Text("$label: ", style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodySmall)
        }
    }
}
