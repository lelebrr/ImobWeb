package com.imobweb.app.ui.vistoria

import android.graphics.Bitmap
import android.graphics.Paint
import android.util.Base64
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.imobweb.app.model.*
import java.io.ByteArrayOutputStream
import java.util.Locale

private val Green = Color(0xFF10B981)
private val Amber = Color(0xFFF59E0B)
private val Red = Color(0xFFEF4444)
private val Slate = Color(0xFF94A3B8)

private fun stateColor(state: String?): Color = when (state) {
    "ok" -> Green
    "regular" -> Amber
    "ruim" -> Red
    else -> Slate
}

@Composable
private fun SectionTitle(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, subtitle: String? = null) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(8.dp))
        Column {
            Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            if (subtitle != null) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// ============================================================ tipo de vistoria

@Composable
fun TipoVistoriaSelector(
    tipo: String,
    onChange: (String) -> Unit,
    isLinkedExit: Boolean = false
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            SectionTitle(Icons.Default.SwapHoriz, "Tipo de vistoria", "Aparece na capa do laudo")
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                TipoVistoria.ALL.forEach { t ->
                    FilterChip(
                        selected = tipo == t,
                        onClick = { onChange(t) },
                        enabled = !isLinkedExit || t == TipoVistoria.SAIDA,
                        label = { Text(TipoVistoria.label(t)) },
                        leadingIcon = if (tipo == t) {
                            { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                        } else null,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            if (isLinkedExit) {
                Spacer(Modifier.height(6.dp))
                Text(
                    "Vistoria de saída vinculada a uma entrada: depois de concluir, use \"Comparar com a entrada\" nos detalhes.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// ============================================================ medidores e chaves

private fun formatNumber(n: Double): String =
    if (n % 1.0 == 0.0) String.format(Locale("pt", "BR"), "%,.0f", n)
    else String.format(Locale("pt", "BR"), "%,.3f", n).trimEnd('0').trimEnd(',')

@Composable
fun MetersKeysCard(
    medidores: Medidores,
    medidoresEntrada: Medidores?,
    chaves: List<ChaveItem>,
    onMedidoresChange: (Medidores) -> Unit,
    onChavesChange: (List<ChaveItem>) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            SectionTitle(Icons.Default.Speed, "Medidores", "Leituras no dia da vistoria")
            Spacer(Modifier.height(10.dp))
            Medidores.DEFS.forEach { (key, label, unit) ->
                val m = medidores.get(key)
                val entrada = medidoresEntrada?.get(key)
                Text(label, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = m.numero,
                        onValueChange = { onMedidoresChange(medidores.with(key, m.copy(numero = it.take(30)))) },
                        label = { Text("Nº do medidor") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = m.leitura,
                        onValueChange = { v ->
                            onMedidoresChange(medidores.with(key, m.copy(leitura = v.filter { it.isDigit() || it == ',' || it == '.' }.take(15))))
                        },
                        label = { Text("Leitura ($unit)") },
                        singleLine = true,
                        isError = m.leitura.isNotBlank() && Medidores.parseReading(m.leitura) == null,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                }
                if (entrada != null && entrada.leitura.isNotBlank()) {
                    val consumo = Medidores.consumption(entrada.leitura, m.leitura)
                    val text = when {
                        m.leitura.isBlank() -> "Entrada: ${entrada.leitura} $unit"
                        consumo != null -> "Entrada: ${entrada.leitura} $unit · Consumo: ${formatNumber(consumo)} $unit"
                        else -> "Entrada: ${entrada.leitura} $unit · leitura de saída menor que a de entrada — confira"
                    }
                    Text(
                        text,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (m.leitura.isNotBlank() && consumo == null) Amber else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
                Spacer(Modifier.height(10.dp))
            }

            HorizontalDivider(Modifier.padding(vertical = 6.dp))

            SectionTitle(Icons.Default.Key, "Chaves, controles e acessos", "Total: ${chaves.sumOf { it.quantidade }} item(ns)")
            Spacer(Modifier.height(8.dp))

            chaves.forEach { c ->
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                    OutlinedTextField(
                        value = c.descricao,
                        onValueChange = { v -> onChavesChange(chaves.map { if (it.id == c.id) it.copy(descricao = v.take(80)) else it }) },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        textStyle = MaterialTheme.typography.bodyMedium
                    )
                    IconButton(
                        onClick = { onChavesChange(chaves.map { if (it.id == c.id) it.copy(quantidade = (it.quantidade - 1).coerceAtLeast(1)) else it }) },
                        enabled = c.quantidade > 1
                    ) { Icon(Icons.Default.Remove, contentDescription = "Diminuir") }
                    Text("${c.quantidade}", fontWeight = FontWeight.Bold, modifier = Modifier.widthIn(min = 20.dp))
                    IconButton(onClick = { onChavesChange(chaves.map { if (it.id == c.id) it.copy(quantidade = (it.quantidade + 1).coerceAtMost(99)) else it }) }) {
                        Icon(Icons.Default.Add, contentDescription = "Aumentar")
                    }
                    IconButton(onClick = { onChavesChange(chaves.filterNot { it.id == c.id }) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Remover", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }

            val used = chaves.map { it.descricao.lowercase() }.toSet()
            val presets = ChaveItem.PRESETS.filter { it.lowercase() !in used }
            if (presets.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    presets.forEach { p ->
                        AssistChip(
                            onClick = { onChavesChange(chaves + ChaveItem(descricao = p)) },
                            label = { Text(p, fontSize = 11.sp) },
                            leadingIcon = { Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp)) }
                        )
                    }
                }
            }
            TextButton(onClick = { onChavesChange(chaves + ChaveItem(descricao = "")) }) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("Outro item")
            }
        }
    }
}

// ============================================================ checklist do cômodo

@Composable
fun RoomConditionCard(
    room: RoomData,
    onChange: (RoomData) -> Unit
) {
    var expanded by remember(room.id) { mutableStateOf(true) }
    val filled = room.checklist.count { it.value != "na" }
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded }
            ) {
                Box(Modifier.weight(1f)) {
                    SectionTitle(
                        Icons.Default.FactCheck,
                        "Conservação — ${room.name.ifBlank { "Cômodo" }}",
                        "$filled de ${Checklist.ITEMS.size} elementos avaliados"
                    )
                }
                Icon(if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore, contentDescription = null)
            }
            if (!expanded) return@Column

            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = {
                        // Preenche como "Bom" só o que ainda não foi avaliado
                        onChange(room.copy(checklist = Checklist.ITEMS.associateWith { room.checklist[it] ?: "ok" }))
                    },
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                ) { Text("Restante: Bom", fontSize = 12.sp) }
                if (room.checklist.isNotEmpty()) {
                    TextButton(onClick = { onChange(room.copy(checklist = emptyMap())) }) { Text("Limpar", fontSize = 12.sp) }
                }
            }
            Spacer(Modifier.height(6.dp))

            Checklist.ITEMS.forEach { item ->
                val current = room.checklist[item]
                Column(Modifier.padding(vertical = 4.dp)) {
                    Text(item, style = MaterialTheme.typography.bodyMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 2.dp)) {
                        Checklist.STATES.forEach { (id, label) ->
                            val selected = current == id
                            val color = stateColor(id)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) color.copy(alpha = 0.22f) else Color.Transparent)
                                    .border(1.dp, if (selected) color else MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
                                    .clickable {
                                        val next = room.checklist.toMutableMap()
                                        if (selected) next.remove(item) else next[item] = id
                                        onChange(room.copy(checklist = next))
                                    }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    label,
                                    fontSize = 12.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selected) color else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = room.observations,
                onValueChange = { onChange(room.copy(observations = it.take(2000))) },
                label = { Text("Observações do cômodo") },
                placeholder = { Text("Ex.: pintura com marcas de móveis na parede da janela") },
                trailingIcon = { DictationIcon { spoken -> onChange(room.copy(observations = appendDictation(room.observations, spoken).take(2000))) } },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2,
                maxLines = 6
            )
        }
    }
}

// ============================================================ assinaturas

@Composable
fun SignaturesCard(
    signatures: Signatures,
    locadora: String,
    locatario: String,
    vistoriadora: String,
    onChange: (Signatures) -> Unit
) {
    var signing by remember { mutableStateOf<String?>(null) }
    val parties = listOf(
        Triple("locadora", "Locadora", locadora),
        Triple("locatario", "Locatário(a)", locatario),
        Triple("vistoriadora", "Vistoriadora", vistoriadora)
    )
    fun valueOf(key: String) = when (key) {
        "locadora" -> signatures.locadora
        "locatario" -> signatures.locatario
        else -> signatures.vistoriadora
    }
    fun withValue(key: String, v: String?) = when (key) {
        "locadora" -> signatures.copy(locadora = v)
        "locatario" -> signatures.copy(locatario = v)
        else -> signatures.copy(vistoriadora = v)
    }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            SectionTitle(Icons.Default.Draw, "Assinaturas", "${signatures.count()} de 3 — incluídas no PDF")
            Spacer(Modifier.height(10.dp))
            parties.forEach { (key, role, name) ->
                val sig = valueOf(key)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(10.dp))
                        .clickable { signing = key }
                        .padding(10.dp)
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(role, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(name.ifBlank { "—" }, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                    }
                    val bmp = remember(sig) { sig?.let { decodeDataUrl(it) } }
                    if (bmp != null) {
                        Box(
                            Modifier
                                .size(width = 110.dp, height = 44.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White)
                        ) {
                            androidx.compose.foundation.Image(
                                bitmap = bmp.asImageBitmap(),
                                contentDescription = "Assinatura de $role",
                                modifier = Modifier.fillMaxSize().padding(2.dp)
                            )
                        }
                        IconButton(onClick = { onChange(withValue(key, null)) }) {
                            Icon(Icons.Default.Close, contentDescription = "Apagar assinatura")
                        }
                    } else {
                        AssistChip(
                            onClick = { signing = key },
                            label = { Text("Assinar") },
                            leadingIcon = { Icon(Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(16.dp)) }
                        )
                    }
                }
            }
        }
    }

    signing?.let { key ->
        val party = parties.first { it.first == key }
        SignaturePadDialog(
            title = "Assinatura — ${party.second}",
            name = party.third,
            onDismiss = { signing = null },
            onSave = { dataUrl ->
                onChange(withValue(key, dataUrl))
                signing = null
            }
        )
    }
}

private fun decodeDataUrl(dataUrl: String): Bitmap? = runCatching {
    val bytes = Base64.decode(dataUrl.substringAfter(","), Base64.DEFAULT)
    android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
}.getOrNull()

/** Tela cheia para assinar com o dedo. Gera PNG transparente (data URL). */
@Composable
fun SignaturePadDialog(
    title: String,
    name: String,
    onDismiss: () -> Unit,
    onSave: (String) -> Unit
) {
    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var current by remember { mutableStateOf<List<Offset>>(emptyList()) }
    var size by remember { mutableStateOf(IntSize.Zero) }
    val ink = Color(0xFF0F172A)

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.surface) {
            Column(Modifier.fillMaxSize().systemBarsPadding().padding(16.dp)) {
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                if (name.isNotBlank()) {
                    Text(name, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Text("Assine dentro do quadro. Gire o celular para ter mais espaço.",
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(12.dp))
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White)
                        .border(BorderStroke(1.dp, Slate), RoundedCornerShape(12.dp))
                        .onSizeChanged { size = it }
                        .pointerInput(Unit) {
                            detectTapGestures { p -> strokes.add(listOf(p, p + Offset(0.5f, 0.5f))) }
                        }
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragStart = { p -> current = listOf(p) },
                                onDrag = { change, _ -> current = current + change.position },
                                onDragEnd = { if (current.size > 1) strokes.add(current); current = emptyList() },
                                onDragCancel = { current = emptyList() }
                            )
                        }
                ) {
                    Canvas(Modifier.fillMaxSize()) {
                        // linha de base
                        drawLine(Slate, Offset(24f, this.size.height * 0.75f), Offset(this.size.width - 24f, this.size.height * 0.75f), strokeWidth = 2f)
                        (strokes + listOf(current)).forEach { pts ->
                            if (pts.size > 1) {
                                val path = Path().apply {
                                    moveTo(pts[0].x, pts[0].y)
                                    pts.drop(1).forEach { lineTo(it.x, it.y) }
                                }
                                drawPath(path, ink, style = Stroke(width = 5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                            }
                        }
                    }
                    if (strokes.isEmpty() && current.isEmpty()) {
                        Text("Assine aqui", color = Slate, modifier = Modifier.align(Alignment.Center))
                    }
                }
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) { Text("Cancelar") }
                    OutlinedButton(onClick = { strokes.clear(); current = emptyList() }, modifier = Modifier.weight(1f), enabled = strokes.isNotEmpty()) {
                        Text("Limpar")
                    }
                    Button(
                        onClick = { renderSignature(strokes.toList(), size)?.let(onSave) },
                        enabled = strokes.isNotEmpty(),
                        modifier = Modifier.weight(1f)
                    ) { Text("Salvar") }
                }
            }
        }
    }
}

/** Recorta a área assinada, reduz para no máximo 600 px de largura e gera PNG em data URL. */
private fun renderSignature(strokes: List<List<Offset>>, area: IntSize): String? {
    val points = strokes.flatten()
    if (points.isEmpty() || area.width <= 0 || area.height <= 0) return null
    val pad = 12f
    val minX = (points.minOf { it.x } - pad).coerceAtLeast(0f)
    val minY = (points.minOf { it.y } - pad).coerceAtLeast(0f)
    val maxX = (points.maxOf { it.x } + pad).coerceAtMost(area.width.toFloat())
    val maxY = (points.maxOf { it.y } + pad).coerceAtMost(area.height.toFloat())
    val w = (maxX - minX).coerceAtLeast(1f)
    val h = (maxY - minY).coerceAtLeast(1f)
    val scale = minOf(1f, 600f / w)
    val bmp = Bitmap.createBitmap((w * scale).toInt().coerceAtLeast(1), (h * scale).toInt().coerceAtLeast(1), Bitmap.Config.ARGB_8888)
    val canvas = android.graphics.Canvas(bmp)
    val paint = Paint().apply {
        color = android.graphics.Color.rgb(15, 23, 42)
        style = Paint.Style.STROKE
        strokeWidth = (5f * scale).coerceAtLeast(2.5f)
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        isAntiAlias = true
    }
    strokes.filter { it.size > 1 }.forEach { pts ->
        val path = android.graphics.Path()
        path.moveTo((pts[0].x - minX) * scale, (pts[0].y - minY) * scale)
        pts.drop(1).forEach { path.lineTo((it.x - minX) * scale, (it.y - minY) * scale) }
        canvas.drawPath(path, paint)
    }
    val out = ByteArrayOutputStream()
    bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
    bmp.recycle()
    return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
}
