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
    dataVistoria: String = "", onDataVistoriaChange: (String) -> Unit = {},
    dataLaudo: String = "", onDataLaudoChange: (String) -> Unit = {},
    emailContestacao: String = "", onEmailContestacaoChange: (String) -> Unit = {},
    onJumpToRoom: ((Int) -> Unit)? = null,
    onFillMissingChecklists: ((String) -> Unit)? = null,
    selectedTemplateName: String = "",
    onOpenTemplatePicker: (() -> Unit)? = null,
    onPreviewPdf: (() -> Unit)? = null
) {
    val context = LocalContext.current

    fun pickDate(currentValue: String, onPicked: (String) -> Unit) {
        val cal = Calendar.getInstance()
        runCatching {
            SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).parse(currentValue)
        }.getOrNull()?.let { cal.time = it }
        android.app.DatePickerDialog(
            context,
            { _, y, m, d -> onPicked(String.format(Locale.US, "%02d/%02d/%04d", d, m + 1, y)) },
            cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    // Pendências que deixam o laudo frágil (conferência antes de gerar o PDF)
    val semChecklist = rooms.filter { it.checklist.isEmpty() }
    val warnings = buildList {
        val semFoto = rooms.filter { it.photos.isEmpty() }.map { it.name }
        if (semFoto.isNotEmpty()) add("Cômodos sem foto: ${semFoto.joinToString(", ")}")
        val semFotoArquivo = rooms.sumOf { r -> r.photos.count { !com.imobweb.app.util.PhotoStore.exists(it) } }
        if (semFotoArquivo > 0) add("$semFotoArquivo foto(s) não encontradas no aparelho")
        if (locadoraCpf.isBlank()) add("CPF/CNPJ da locadora não informado")
        if (locatarioCpf.isBlank()) add("CPF/CNPJ do locatário não informado")
        if (vistoriadora.isBlank()) add("Nome da vistoriadora não informado")
        val vazios = rooms.filter {
            it.items.isEmpty() && roomFurnitureCount(it) == 0 && it.damages.isEmpty() && it.problems.isEmpty()
        }
        if (vazios.isNotEmpty()) add("Cômodos sem nenhuma descrição: ${vazios.joinToString(", ") { it.name }}")
        val pendentes = rooms.filter { it.proposals.isNotEmpty() }
        if (pendentes.isNotEmpty()) add("Sugestões da IA não revisadas (não entram no laudo): ${pendentes.joinToString(", ") { it.name }}")
        if (semChecklist.isNotEmpty()) add("Cômodos sem checklist de conservação: ${semChecklist.joinToString(", ") { it.name }}")
    }

    Column {
        Text("Revisão e Observações", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Revise os dados, escolha o modelo do PDF e finalize",
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
                    if (semChecklist.isNotEmpty() && onFillMissingChecklists != null) {
                        Spacer(Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { onFillMissingChecklists("ok") },
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text("✓ Completar checklists: Bom", fontSize = 11.sp)
                            }
                            FilledTonalButton(
                                onClick = { onFillMissingChecklists("otimo") },
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text("✨ Ótimo", fontSize = 11.sp)
                            }
                        }
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
                InfoRow("Locador(es)", PartyListHelper.displayNames(locadora))
                InfoRow("Locatário(s)", PartyListHelper.displayNames(locatario))
                if (vistoriadora.isNotBlank()) InfoRow("Autor(a) / Vistoriadora", vistoriadora)
                if (solicitante.isNotBlank()) InfoRow("Solicitante", solicitante)
            }
        }

        Spacer(Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Cômodos (${rooms.size})", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                rooms.forEachIndexed { idx, room ->
                    val mobCount = roomFurnitureCount(room)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .then(
                                if (onJumpToRoom != null) Modifier.clickable { onJumpToRoom(idx) } else Modifier
                            )
                            .padding(vertical = 4.dp, horizontal = 4.dp),
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
                                if (mobCount > 0) {
                                    Text("· $mobCount móveis",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                if (room.problems.isNotEmpty() || room.damages.isNotEmpty()) {
                                    Text("· ${room.problems.size + room.damages.size} avarias/probs.",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                        if (onJumpToRoom != null) {
                            Icon(
                                Icons.Default.ChevronRight,
                                contentDescription = "Editar cômodo",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        if (onOpenTemplatePicker != null || onPreviewPdf != null) {
            Spacer(Modifier.height(10.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Palette, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Modelo do Laudo PDF", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(
                                selectedTemplateName.ifBlank { "#1 Padrão ImobWeb Executivo" },
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (onOpenTemplatePicker != null) {
                            OutlinedButton(
                                onClick = onOpenTemplatePicker,
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.Style, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Trocar Modelo (9)", fontSize = 12.sp)
                            }
                        }
                        if (onPreviewPdf != null) {
                            FilledTonalButton(
                                onClick = onPreviewPdf,
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.PictureAsPdf, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Pré-visualizar PDF", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // Observations
        Text("Considerações Finais", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))

        FilledTonalButton(
            onClick = {
                val standardText = listOf(
                    "No laudo relatado acima, o imóvel encontra-se em bom estado de conservação.",
                    "O imóvel apresenta PINTURA EM BOM ESTADO nas paredes, e deverá ser entregue da mesma forma no final da locação;",
                    "Foram testados torneiras, vasos sanitários, chuveiros, duchas, estando toda parte hidráulica em perfeito funcionamento;",
                    "Foram testadas todas as lâmpadas e interruptores e tomadas estando em perfeito funcionamento."
                ).joinToString("\n")
                onConsideracoesChange(
                    if (consideracoes.isBlank()) standardText
                    else "$standardText\n\n$consideracoes"
                )
            },
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Icon(Icons.Default.FactCheck, null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Inserir Termo Padrão (Pintura, Hidráulica e Elétrica)", fontSize = 12.sp)
        }
        Spacer(Modifier.height(6.dp))

        // Quick observation templates (rolável horizontalmente)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf(
                "Imóvel em bom estado de conservação",
                "Pintura recente em paredes e tetos",
                "Instalações hidráulicas e elétricas OK",
                "Imóvel entregue limpo e desocupado",
                "Mobiliário e eletrodomésticos conferidos",
                "Chaves e controles entregues no ato",
                "Vistoria realizada na presença das partes",
                "Desgastes naturais de uso registrados"
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
            trailingIcon = {
                DictationIcon { dictated ->
                    onConsideracoesChange(
                        if (consideracoes.isBlank()) dictated else "$consideracoes\n$dictated"
                    )
                }
            },
            modifier = Modifier.fillMaxWidth().height(150.dp),
            maxLines = 8
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = emailContestacao,
            onValueChange = onEmailContestacaoChange,
            label = { Text("E-mail para Contestação (prazo de 10 dias)") },
            placeholder = { Text("ex: vistoria@imobiliaria.com.br") },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(18.dp)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Card(
                onClick = { pickDate(dataVistoria) { onDataVistoriaChange(it) } },
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                )
            ) {
                Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CameraAlt, contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Fotografado em", style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(dataVistoria.ifBlank { "—" },
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    Icon(Icons.Default.Edit, contentDescription = "Alterar data das fotos",
                        tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(15.dp))
                }
            }

            Card(
                onClick = { pickDate(dataLaudo.ifBlank { dataVistoria }) { onDataLaudoChange(it) } },
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
                )
            ) {
                Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.DateRange, contentDescription = null,
                        tint = MaterialTheme.colorScheme.tertiary, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Data do laudo", style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(dataLaudo.ifBlank { dataVistoria }.ifBlank { "—" },
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    Icon(Icons.Default.Edit, contentDescription = "Alterar data do laudo",
                        tint = MaterialTheme.colorScheme.tertiary, modifier = Modifier.size(15.dp))
                }
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
