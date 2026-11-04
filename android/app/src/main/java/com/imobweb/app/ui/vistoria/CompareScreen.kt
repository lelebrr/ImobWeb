package com.imobweb.app.ui.vistoria

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.AiCompare
import com.imobweb.app.model.AiDiff
import com.imobweb.app.model.AiRoomResult
import com.imobweb.app.model.Checklist
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.CompareBuilder
import com.imobweb.app.util.ReportPdfExporter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private val Red = Color(0xFFEF4444)
private val Amber = Color(0xFFF59E0B)
private val Green = Color(0xFF10B981)
private val Indigo = Color(0xFF818CF8)

private fun statusColor(s: CompareBuilder.Status): Color = when (s) {
    CompareBuilder.Status.PIOROU -> Red
    CompareBuilder.Status.ALTERADO -> Amber
    CompareBuilder.Status.SEM_ALTERACAO -> Green
    else -> Color(0xFF94A3B8)
}

/** Comparativo entrada × saída da vistoria de saída [saidaId]. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompareScreen(
    repository: VistoriaRepository,
    saidaId: Long,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var loading by remember { mutableStateOf(true) }
    var saida by remember { mutableStateOf<Vistoria?>(null) }
    var entrada by remember { mutableStateOf<Vistoria?>(null) }
    var report by remember { mutableStateOf<String?>(null) }
    var building by remember { mutableStateOf(false) }
    var ai by remember { mutableStateOf<AiCompare?>(null) }
    var aiRunning by remember { mutableStateOf(false) }
    var aiProgress by remember { mutableStateOf(0 to 0) }

    fun runAi() {
        val e = entrada ?: return
        val s = saida ?: return
        scope.launch {
            aiRunning = true
            repository.compareWithAi(e, s) { done, total -> aiProgress = done to total }
                .onSuccess {
                    ai = it
                    if (it.failedRooms.isNotEmpty()) {
                        Toast.makeText(context, "IA não comparou: ${it.failedRooms.joinToString(", ")}", Toast.LENGTH_LONG).show()
                    }
                }
                .onFailure { Toast.makeText(context, it.message ?: "Erro na análise por IA", Toast.LENGTH_LONG).show() }
            aiRunning = false
        }
    }

    LaunchedEffect(saidaId) {
        val s = repository.getVistoriaById(saidaId)
        saida = s
        entrada = s?.let { repository.getEntradaFor(it) }
        loading = false
    }

    val cmp = remember(entrada, saida) {
        val e = entrada; val s = saida
        if (e != null && s != null) CompareBuilder.compare(e, s) else null
    }

    BackHandler(enabled = report != null) { report = null }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Entrada × Saída", fontWeight = FontWeight.Bold)
                        Text(saida?.condominio?.ifBlank { saida?.endereco } ?: "", style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Voltar") } },
                actions = {
                    if (cmp != null) {
                        IconButton(
                            enabled = !building,
                            onClick = {
                                val e = entrada ?: return@IconButton
                                val s = saida ?: return@IconButton
                                scope.launch {
                                    building = true
                                    runCatching { withContext(Dispatchers.Default) { CompareBuilder.buildHtml(e, s, cmp, ai) } }
                                        .onSuccess { report = it }
                                        .onFailure { Toast.makeText(context, "Erro ao gerar relatório: ${it.message}", Toast.LENGTH_LONG).show() }
                                    building = false
                                }
                            }
                        ) {
                            if (building) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                            else Icon(Icons.Default.PictureAsPdf, contentDescription = "Relatório em PDF")
                        }
                    }
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                loading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                saida == null -> Text("Vistoria não encontrada", Modifier.align(Alignment.Center))
                entrada == null -> Column(
                    Modifier.align(Alignment.Center).padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.LinkOff, contentDescription = null, modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    Text("A vistoria de entrada vinculada não está neste aparelho.",
                        style = MaterialTheme.typography.bodyMedium)
                    Text("Sincronize para baixá-la ou crie a saída a partir da entrada.",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                cmp != null -> CompareContent(cmp, entrada!!, saida!!, ai, aiRunning, aiProgress, onRunAi = { runAi() })
            }
        }
    }

    report?.let { html ->
        PdfPreviewScreen(
            htmlContent = html,
            title = "Comparativo - ${saida?.condominio?.ifBlank { saida?.endereco } ?: ""}",
            fileName = "Comparativo_" + ReportPdfExporter.fileNameFor(saida!!).removePrefix("Laudo_"),
            onClose = { report = null }
        )
    }
}

@Composable
private fun CompareContent(
    cmp: CompareBuilder.Comparison,
    entrada: Vistoria,
    saida: Vistoria,
    ai: AiCompare?,
    aiRunning: Boolean,
    aiProgress: Pair<Int, Int>,
    onRunAi: () -> Unit
) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Entrada: ${entrada.dataLaudo.ifBlank { "—" }}   ·   Saída: ${saida.dataLaudo.ifBlank { "—" }}",
            style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Kpi(cmp.totals.newDamages, "novas avarias", Red)
            Kpi(cmp.totals.worsened, "itens pioraram", Amber)
            Kpi(cmp.totals.missingFurniture, "itens não encontrados", Red)
            Kpi(cmp.totals.roomsWithIssues, "cômodos c/ deterioração", Red)
            if (cmp.keys.isNotEmpty()) Kpi(cmp.missingKeys, "chaves não devolvidas", Amber)
        }

        AiCard(ai, aiRunning, aiProgress, onRunAi)

        if (cmp.meters.isNotEmpty()) {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp)) {
                    Text("Medidores", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    cmp.meters.forEach { m ->
                        val consumo = m.consumo?.let { "${"%.3f".format(it).trimEnd('0').trimEnd('.', ',')} ${m.unit}" }
                            ?: if (m.entrada.isNotBlank() && m.saida.isNotBlank()) "conferir leituras" else "—"
                        Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                            Text(m.label, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                            Text("${m.entrada.ifBlank { "—" }} → ${m.saida.ifBlank { "—" }}", Modifier.weight(1.4f), fontSize = 13.sp)
                            Text(consumo, fontSize = 13.sp, color = if (m.consumo == null && m.saida.isNotBlank()) Amber else MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }

        if (cmp.keys.isNotEmpty()) {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp)) {
                    Text("Chaves, controles e acessos", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    cmp.keys.forEach { k ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                            Text(k.descricao, Modifier.weight(1f), fontSize = 13.sp)
                            Text("${k.entrada} → ${k.saida}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                                color = if (k.saida < k.entrada) Red else MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }

        cmp.rooms.forEach { r -> RoomCompareCard(r, ai?.rooms?.get(r.name)) }

        Text("Comparativo automático por nome de cômodo, inventário, avarias e checklist. Confira as fotos antes de qualquer conclusão.",
            style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun Kpi(value: Int, label: String, color: Color) {
    Card {
        Column(Modifier.padding(horizontal = 14.dp, vertical = 10.dp).widthIn(min = 92.dp)) {
            Text("$value", fontSize = 22.sp, fontWeight = FontWeight.Black, color = if (value > 0) color else MaterialTheme.colorScheme.onSurface)
            Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun RoomCompareCard(r: CompareBuilder.RoomComparison, aiRoom: AiRoomResult? = null) {
    val color = statusColor(r.status)
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(r.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                Box(
                    Modifier.clip(RoundedCornerShape(99.dp)).background(color.copy(alpha = 0.18f))
                        .padding(horizontal = 10.dp, vertical = 3.dp)
                ) { Text(r.status.label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color) }
            }
            Text("Fotos: ${r.entrada?.photos?.size ?: 0} na entrada · ${r.saida?.photos?.size ?: 0} na saída",
                style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Bullets("Novas avarias na saída", r.newDamages, Red)
            Bullets("Itens da entrada não encontrados na saída", r.missingFurniture, Red)
            Bullets("Avarias resolvidas", r.resolvedDamages, Green)
            Bullets("Itens novos na saída", r.newFurniture, MaterialTheme.colorScheme.onSurfaceVariant)
            if (r.checklist.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Text("Conservação", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                r.checklist.forEach { c ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 1.dp)) {
                        Text(c.item, Modifier.weight(1f), fontSize = 12.sp)
                        Text("${Checklist.label(c.before)} → ${Checklist.label(c.after)}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold,
                            color = when { c.worsened -> Red; c.improved -> Green; else -> MaterialTheme.colorScheme.onSurface })
                    }
                }
            }
            if (!r.saida?.observations.isNullOrBlank()) {
                Spacer(Modifier.height(6.dp))
                Text("Obs. da saída: ${r.saida?.observations}", style = MaterialTheme.typography.bodySmall)
            }
            if (aiRoom != null && (aiRoom.summary.isNotBlank() || aiRoom.differences.isNotEmpty())) {
                Spacer(Modifier.height(8.dp))
                Surface(color = Indigo.copy(alpha = 0.12f), shape = RoundedCornerShape(8.dp)) {
                    Column(Modifier.fillMaxWidth().padding(10.dp)) {
                        Text("Análise por IA", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = Indigo)
                        if (aiRoom.summary.isNotBlank()) Text(aiRoom.summary, fontSize = 12.sp)
                        aiRoom.differences.forEach { d ->
                            Text(
                                "• ${AiDiff.label(d.type)} (${d.severity}, ${Math.round(d.confidence * 100)}%): ${d.description}",
                                fontSize = 12.sp,
                                color = when (d.type) { "dano_novo", "item_ausente", "piora" -> Red; "melhoria" -> Green; else -> MaterialTheme.colorScheme.onSurface }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Bullets(title: String, items: List<String>, color: Color) {
    if (items.isEmpty()) return
    Spacer(Modifier.height(6.dp))
    Text(title, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = color)
    items.forEach { Text("• $it", fontSize = 12.sp) }
}

@Composable
private fun AiCard(ai: AiCompare?, running: Boolean, progress: Pair<Int, Int>, onRun: () -> Unit) {
    Card(
        Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Indigo.copy(alpha = 0.10f))
    ) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Indigo)
                Spacer(Modifier.width(8.dp))
                Text("Análise por IA", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            }
            Spacer(Modifier.height(6.dp))
            when {
                running -> {
                    val (done, total) = progress
                    Text(if (total > 0 && done < total) "Comparando cômodo ${done + 1} de $total…" else "Gerando resumo…",
                        style = MaterialTheme.typography.bodySmall)
                    Spacer(Modifier.height(6.dp))
                    if (total > 0) LinearProgressIndicator(progress = { done.toFloat() / total }, modifier = Modifier.fillMaxWidth())
                    else LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                }
                ai == null -> {
                    Text("A IA compara as fotos e os dados de cada cômodo (até 3 fotos de cada lado) e aponta danos novos, itens ausentes e desgaste normal.",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = onRun, modifier = Modifier.fillMaxWidth()) { Text("Comparar com IA") }
                }
                else -> {
                    if (!ai.summary.isNullOrBlank()) Text(ai.summary, style = MaterialTheme.typography.bodyMedium)
                    if (ai.attention.isNotEmpty()) {
                        Spacer(Modifier.height(6.dp))
                        Text("Pontos para conferir", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        ai.attention.forEach { Text("• $it", fontSize = 12.sp) }
                    }
                    Spacer(Modifier.height(6.dp))
                    Text("Conteúdo gerado por IA; confira as fotos antes de qualquer conclusão. Incluído no relatório em PDF.",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    TextButton(onClick = onRun) { Text("Refazer análise") }
                }
            }
        }
    }
}
