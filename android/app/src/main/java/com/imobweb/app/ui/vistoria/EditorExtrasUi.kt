package com.imobweb.app.ui.vistoria

import android.content.ActivityNotFoundException
import android.content.Intent
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.imobweb.app.model.*
import com.imobweb.app.util.Formatters
import com.imobweb.app.util.Inspection
import com.imobweb.app.util.PhotoStore
import java.text.NumberFormat
import java.util.Locale

private val Indigo = Color(0xFF818CF8)

// ============================================================ miniaturas leves

/**
 * Miniatura de foto: pede ao Coil uma versão reduzida (em vez de decodificar a foto
 * inteira de 1600 px para mostrar 80 dp), o que deixa listas e grades bem mais leves.
 */
@Composable
fun PhotoThumb(photo: PhotoData, modifier: Modifier = Modifier, sizePx: Int = 320, contentScale: ContentScale = ContentScale.Crop) {
    val context = LocalContext.current
    val model = remember(photo.id, photo.filePath, photo.dataUrl.length) {
        ImageRequest.Builder(context)
            .data(PhotoStore.model(photo))
            .size(sizePx)
            .crossfade(false)
            .build()
    }
    AsyncImage(model = model, contentDescription = photo.name.ifBlank { null }, modifier = modifier, contentScale = contentScale)
}

// ============================================================ ditado por voz

/** Devolve uma função que abre o reconhecimento de voz do Android (pt-BR) e entrega o texto. */
@Composable
fun rememberDictation(onText: (String) -> Unit): () -> Unit {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val text = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (!text.isNullOrBlank()) onText(text.trim())
    }
    return {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale o texto")
        }
        try {
            launcher.launch(intent)
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(context, "Ditado por voz indisponível neste aparelho", Toast.LENGTH_LONG).show()
        }
    }
}

@Composable
fun DictationIcon(onText: (String) -> Unit) {
    val dictate = rememberDictation(onText)
    IconButton(onClick = dictate) { Icon(Icons.Default.Mic, contentDescription = "Ditar por voz") }
}

/** Junta o texto ditado ao existente (com espaço/ponto quando precisa). */
fun appendDictation(current: String, spoken: String): String {
    if (current.isBlank()) return spoken.replaceFirstChar { it.uppercase() }
    val sep = if (current.trimEnd().endsWith('.') || current.endsWith('\n')) " " else ". "
    return current.trimEnd() + sep + spoken.replaceFirstChar { it.uppercase() }
}

// ============================================================ complemento e contatos

private val CONDOMINIO_TYPES = listOf("APARTAMENTO", "COBERTURA", "LOFT", "STUDIO", "SALA", "FLAT", "STUDIO/FLAT")

@Composable
fun AndarCard(tipoImovel: String, andar: String, onAndarChange: (String) -> Unit) {
    if (tipoImovel.uppercase() !in CONDOMINIO_TYPES) return
    Card(Modifier.fillMaxWidth()) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Layers, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.width(10.dp))
            OutlinedTextField(
                value = andar,
                onValueChange = { onAndarChange(it.take(20)) },
                label = { Text("Andar") },
                placeholder = { Text("Ex.: 7º") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun ContactsCard(
    locadoraTelefone: String, onLocadoraTelefone: (String) -> Unit,
    locatarioTelefone: String, onLocatarioTelefone: (String) -> Unit,
    emailContestacao: String, onEmailContestacao: (String) -> Unit
) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.ContactPhone, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Contatos e contestação", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            }
            OutlinedTextField(
                value = locadoraTelefone,
                onValueChange = { onLocadoraTelefone(Formatters.formatPhone(it)) },
                label = { Text("Telefone da locadora") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true, modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = locatarioTelefone,
                onValueChange = { onLocatarioTelefone(Formatters.formatPhone(it)) },
                label = { Text("Telefone do locatário(a)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true, modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = emailContestacao,
                onValueChange = { onEmailContestacao(it.trim().take(120)) },
                label = { Text("E-mail para contestação do laudo") },
                isError = emailContestacao.isNotBlank() && !android.util.Patterns.EMAIL_ADDRESS.matcher(emailContestacao).matches(),
                supportingText = { Text("Impresso no laudo, com o prazo para contestar") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true, modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

// ============================================================ considerações com IA

@Composable
fun AiConsiderationsCard(
    busy: Boolean,
    canUndo: Boolean,
    highlights: List<String>,
    onGenerate: () -> Unit,
    onUndo: () -> Unit,
    onDictated: (String) -> Unit
) {
    val dictate = rememberDictation(onDictated)
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Indigo.copy(alpha = 0.10f))) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Indigo)
                Spacer(Modifier.width(8.dp))
                Text("Observações finais", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            }
            Text("A IA redige as considerações a partir dos cômodos, avarias e checklist. Você pode editar depois.",
                style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onGenerate, enabled = !busy, modifier = Modifier.weight(1f)) {
                    if (busy) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp, color = Color.White)
                    else Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (busy) "Redigindo…" else "Redigir com IA")
                }
                OutlinedButton(onClick = dictate) {
                    Icon(Icons.Default.Mic, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Ditar")
                }
            }
            if (canUndo) {
                TextButton(onClick = onUndo) {
                    Icon(Icons.Default.Undo, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Desfazer texto da IA")
                }
            }
            if (highlights.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                Text("Pontos de atenção", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                highlights.forEach { Text("• $it", fontSize = 12.sp) }
            }
        }
    }
}

// ============================================================ estimativa de reparos

private fun brl(n: Double) = NumberFormat.getCurrencyInstance(Locale("pt", "BR")).format(n)

@Composable
fun RepairsCard(
    reparos: List<Reparo>,
    rooms: List<RoomData>,
    busy: Boolean,
    onEstimate: () -> Unit,
    onChange: (List<Reparo>) -> Unit
) {
    val hasDamages = rooms.any { it.damages.isNotEmpty() || it.problems.isNotEmpty() }
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Construction, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text("Estimativa de reparos", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    Text(
                        if (reparos.isEmpty()) "Referencial, opcional — entra no laudo"
                        else "Total: ${brl(reparos.sumOf { it.min })} – ${brl(reparos.sumOf { it.max })}",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            reparos.forEach { r ->
                Card(
                    Modifier.fillMaxWidth().padding(vertical = 3.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = r.descricao,
                                onValueChange = { v -> onChange(reparos.map { if (it.id == r.id) it.copy(descricao = v.take(160), origem = "manual") else it }) },
                                label = { Text(r.comodo.ifBlank { "Reparo" }) },
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(onClick = { onChange(reparos.filterNot { it.id == r.id }) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Remover", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            MoneyField("Mín. (R$)", r.min, Modifier.weight(1f)) { v -> onChange(reparos.map { if (it.id == r.id) it.copy(min = v) else it }) }
                            MoneyField("Máx. (R$)", r.max, Modifier.weight(1f)) { v -> onChange(reparos.map { if (it.id == r.id) it.copy(max = v) else it }) }
                        }
                        if (r.nota.isNotBlank()) Text(r.nota, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (r.max < r.min) Text("O máximo está menor que o mínimo", fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
                    }
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onEstimate, enabled = hasDamages && !busy, modifier = Modifier.weight(1f)) {
                    if (busy) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp, color = Color.White)
                    else Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (busy) "Estimando…" else if (reparos.isEmpty()) "Estimar com IA" else "Refazer com IA")
                }
                OutlinedButton(onClick = { onChange(reparos + Reparo(origem = "manual")) }) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Manual")
                }
            }
            if (!hasDamages) {
                Text("Registre avarias nos cômodos para a IA estimar.", style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 4.dp))
            }
        }
    }
}

@Composable
private fun MoneyField(label: String, value: Double, modifier: Modifier, onValue: (Double) -> Unit) {
    var text by remember(value) { mutableStateOf(if (value == 0.0) "" else value.toLong().toString()) }
    OutlinedTextField(
        value = text,
        onValueChange = { v ->
            text = v.filter { it.isDigit() }.take(7)
            onValue(text.toDoubleOrNull() ?: 0.0)
        },
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = modifier
    )
}

// ============================================================ sugestões da IA (detecção por foto)

@Composable
fun ProposalsCard(
    room: RoomData,
    busy: Boolean,
    onDetect: () -> Unit,
    onReview: () -> Unit
) {
    val pending = room.proposals.size
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Indigo.copy(alpha = 0.10f))) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.DocumentScanner, contentDescription = null, tint = Indigo)
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text("Detectar objetos e defeitos", fontWeight = FontWeight.Bold)
                    Text(
                        if (pending > 0) "$pending sugestão(ões) aguardando sua revisão"
                        else "A IA procura móveis e avarias em cada foto. Nada entra no laudo sem o seu aceite.",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onDetect, enabled = !busy && room.photos.isNotEmpty(), modifier = Modifier.weight(1f)) {
                    if (busy) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                    else Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (busy) "Analisando fotos…" else "Detectar nas fotos")
                }
                if (pending > 0) {
                    Button(onClick = onReview, modifier = Modifier.weight(1f)) { Text("Revisar ($pending)") }
                }
            }
        }
    }
}

/**
 * Revisão das sugestões: cada uma pode ser marcada, editada e (se for avaria com posição)
 * marcada na foto. "Aplicar" grava só as marcadas e tira todas da fila.
 */
@Composable
fun ProposalsReviewDialog(
    room: RoomData,
    onDismiss: () -> Unit,
    onApply: (RoomData) -> Unit
) {
    val selected = remember(room.id) { mutableStateMapOf<String, Boolean>().apply { room.proposals.forEach { put(it.id, Inspection.isPreselected(it)) } } }
    val texts = remember(room.id) { mutableStateMapOf<String, String>().apply { room.proposals.forEach { put(it.id, it.text) } } }
    val marks = remember(room.id) { mutableStateMapOf<String, Boolean>().apply { room.proposals.forEach { put(it.id, it.mark != null) } } }
    val photosById = room.photos.associateBy { it.id }

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.surface) {
            Column(Modifier.fillMaxSize().systemBarsPadding()) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("Sugestões da IA — ${room.name}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text("Marque o que entra no laudo. Alta confiança já vem marcada; \"Possível…\" vem desmarcado.",
                            style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick = onDismiss) { Icon(Icons.Default.Close, contentDescription = "Fechar") }
                }
                Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { room.proposals.forEach { selected[it.id] = true } }) { Text("Marcar todas") }
                    TextButton(onClick = { room.proposals.forEach { selected[it.id] = false } }) { Text("Desmarcar") }
                }
                LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(room.proposals, key = { it.id }) { p ->
                        val photo = p.photoId?.let { photosById[it] }
                        Card(Modifier.fillMaxWidth()) {
                            Row(Modifier.padding(10.dp), verticalAlignment = Alignment.Top) {
                                Checkbox(checked = selected[p.id] == true, onCheckedChange = { selected[p.id] = it })
                                Column(Modifier.weight(1f)) {
                                    Text(
                                        (if (p.kind == "furniture") "Item do inventário" else "Avaria") +
                                            " · confiança ${Math.round(p.confidence * 100)}%",
                                        fontSize = 11.sp,
                                        color = if (p.kind == "furniture") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                                    )
                                    OutlinedTextField(
                                        value = texts[p.id].orEmpty(),
                                        onValueChange = { texts[p.id] = it.take(200) },
                                        modifier = Modifier.fillMaxWidth(),
                                        textStyle = MaterialTheme.typography.bodyMedium
                                    )
                                    if (p.mark != null && photo != null) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Switch(checked = marks[p.id] == true, onCheckedChange = { marks[p.id] = it })
                                            Spacer(Modifier.width(6.dp))
                                            Text("Marcar na foto", fontSize = 12.sp)
                                        }
                                    }
                                }
                                if (photo != null) {
                                    Spacer(Modifier.width(8.dp))
                                    Box(Modifier.size(72.dp).clip(RoundedCornerShape(8.dp))) {
                                        PhotoThumb(photo, Modifier.fillMaxSize(), sizePx = 240)
                                        p.mark?.let { m ->
                                            BoxWithConstraints(Modifier.fillMaxSize()) {
                                                Box(
                                                    Modifier
                                                        .offset(x = maxWidth * (m.x / 100).toFloat() - 6.dp, y = maxHeight * (m.y / 100).toFloat() - 6.dp)
                                                        .size(12.dp)
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(Color(0xFFEF4444))
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = {
                        // descarta todas
                        onApply(Inspection.accept(room, emptyList(), emptySet(), room.proposals.map { it.id }.toSet()))
                    }, modifier = Modifier.weight(1f)) { Text("Descartar todas") }
                    val count = room.proposals.count { selected[it.id] == true }
                    Button(onClick = {
                        val accepted = room.proposals.filter { selected[it.id] == true }.map { it.copy(text = texts[it.id].orEmpty()) }
                        val withMark = room.proposals.filter { marks[it.id] == true }.map { it.id }.toSet()
                        onApply(Inspection.accept(room, accepted, withMark, room.proposals.map { it.id }.toSet()))
                    }, modifier = Modifier.weight(1f)) { Text("Aplicar $count") }
                }
            }
        }
    }
}

// ============================================================ conflito

@Composable
fun ConflictCard(busy: Boolean, onKeepLocal: () -> Unit, onUseServer: () -> Unit) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color(0xFFF59E0B).copy(alpha = 0.15f))) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.SyncProblem, contentDescription = null, tint = Color(0xFFF59E0B))
                Spacer(Modifier.width(8.dp))
                Text("Conflito de versões", fontWeight = FontWeight.Bold)
            }
            Text(
                "Esta vistoria foi alterada neste aparelho e também em outro lugar (outro celular ou o sistema web) " +
                    "desde a última sincronização. Escolha qual versão manter — a outra será descartada.",
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(Modifier.height(8.dp))
            if (busy) {
                LinearProgressIndicator(Modifier.fillMaxWidth())
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onKeepLocal, modifier = Modifier.weight(1f)) { Text("Manter a deste aparelho", fontSize = 12.sp) }
                    OutlinedButton(onClick = onUseServer, modifier = Modifier.weight(1f)) { Text("Usar a do servidor", fontSize = 12.sp) }
                }
            }
        }
    }
}
