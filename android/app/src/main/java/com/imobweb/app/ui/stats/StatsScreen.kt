package com.imobweb.app.ui.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.SyncStatus
import com.imobweb.app.model.TipoVistoria
import com.imobweb.app.model.Vistoria
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Indicadores das vistorias do aparelho (mesmos do sistema web). */
data class VistoriaStats(
    val total: Int,
    val byTipo: Map<String, Int>,
    val byImovel: List<Pair<String, Int>>,
    val byMonth: List<Pair<String, Int>>,
    val rooms: Int,
    val photos: Int,
    val annotations: Int,
    val avgCompleteness: Int,
    val topDamages: List<Pair<String, Int>>,
    val topFurniture: List<Pair<String, Int>>,
    val pending: Int,
    val conflicts: Int,
    val withSignatures: Int
) {
    companion object {
        /** 0–100: dados, partes, cômodos, fotos, análise, checklist e assinaturas. */
        fun completeness(v: Vistoria): Int {
            val photos = v.rooms.sumOf { it.photos.size }
            val checks = listOf(
                v.endereco.isNotBlank() && v.cidade.isNotBlank(), v.tipoImovel.isNotBlank(), v.metragem.isNotBlank(),
                v.locadora.isNotBlank() && v.locatario.isNotBlank(), v.vistoriadora.isNotBlank(), v.rooms.isNotEmpty(),
                photos > 0, v.rooms.isNotEmpty() && v.rooms.all { it.photos.isNotEmpty() },
                v.rooms.isNotEmpty() && v.rooms.all { it.items.isNotEmpty() || it.analyzed },
                v.rooms.any { it.checklist.isNotEmpty() },
                v.signatures.count() > 0
            )
            return Math.round(checks.count { it } * 100f / checks.size)
        }

        fun from(all: List<Vistoria>): VistoriaStats {
            fun top(pick: (Vistoria) -> List<String>): List<Pair<String, Int>> =
                all.flatMap(pick).map { it.trim() }.filter { it.isNotEmpty() }
                    .groupingBy { it }.eachCount().entries.sortedByDescending { it.value }.take(8).map { it.key to it.value }
            val month = SimpleDateFormat("MMM/yy", Locale("pt", "BR"))
            val monthKey = SimpleDateFormat("yyyy-MM", Locale.US)
            val byMonth = all.groupBy { monthKey.format(Date(it.createdAt)) }.toSortedMap().entries.toList().takeLast(6)
                .map { (_, list) -> month.format(Date(list.first().createdAt)) to list.size }
            return VistoriaStats(
                total = all.size,
                byTipo = all.groupingBy { it.tipoVistoria }.eachCount(),
                byImovel = all.groupingBy { it.tipoImovel.ifBlank { "N/A" } }.eachCount().entries.sortedByDescending { it.value }.map { it.key to it.value },
                byMonth = byMonth,
                rooms = all.sumOf { it.rooms.size },
                photos = all.sumOf { v -> v.rooms.sumOf { it.photos.size } },
                annotations = all.sumOf { v -> v.rooms.sumOf { r -> r.photos.sumOf { it.annotations.size } } },
                avgCompleteness = if (all.isEmpty()) 0 else all.sumOf { completeness(it) } / all.size,
                topDamages = top { v -> v.rooms.flatMap { it.damages + it.problems } },
                topFurniture = top { v -> v.rooms.flatMap { it.furniture } },
                pending = all.count { it.status == SyncStatus.PENDING || it.status == SyncStatus.PENDING_FORCE },
                conflicts = all.count { it.status == SyncStatus.CONFLICT },
                withSignatures = all.count { it.signatures.count() > 0 }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(repository: VistoriaRepository, onBack: () -> Unit) {
    val all by repository.getAllVistorias().collectAsState(initial = emptyList())
    val stats = remember(all) { VistoriaStats.from(all) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Estatísticas", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Voltar") } }
            )
        }
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Kpi("${stats.total}", "vistorias")
                Kpi("${stats.byTipo[TipoVistoria.SAIDA] ?: 0}", "de saída")
                Kpi("${stats.rooms}", "cômodos")
                Kpi("${stats.photos}", "fotos")
                Kpi("${stats.annotations}", "marcações")
                Kpi("${stats.avgCompleteness}%", "completude média")
            }
            if (stats.pending > 0 || stats.conflicts > 0) {
                Text("${stats.pending} pendente(s) de envio · ${stats.conflicts} em conflito",
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text("${stats.withSignatures} de ${stats.total} com assinatura digital",
                style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

            BarCard("Vistorias por mês", stats.byMonth, Color(0xFF6366F1))
            BarCard("Por tipo de vistoria", TipoVistoria.ALL.map { TipoVistoria.label(it) to (stats.byTipo[it] ?: 0) }.filter { it.second > 0 }, Color(0xFF8B5CF6))
            BarCard("Por tipo de imóvel", stats.byImovel, Color(0xFF06B6D4))
            BarCard("Avarias mais frequentes", stats.topDamages, Color(0xFFEF4444))
            BarCard("Móveis e equipamentos mais registrados", stats.topFurniture, Color(0xFF10B981))
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun Kpi(value: String, label: String) {
    Card {
        Column(Modifier.padding(horizontal = 14.dp, vertical = 10.dp).widthIn(min = 84.dp)) {
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Black)
            Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun BarCard(title: String, rows: List<Pair<String, Int>>, color: Color) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            if (rows.isEmpty()) {
                Text("Sem dados ainda", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                return@Column
            }
            val max = rows.maxOf { it.second }.coerceAtLeast(1)
            rows.forEach { (label, n) ->
                Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(label, Modifier.width(130.dp), fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Box(Modifier.weight(1f).height(14.dp).clip(RoundedCornerShape(4.dp)).background(MaterialTheme.colorScheme.surfaceVariant)) {
                        Box(Modifier.fillMaxHeight().fillMaxWidth(n.toFloat() / max).clip(RoundedCornerShape(4.dp)).background(color))
                    }
                    Text("$n", Modifier.width(32.dp), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                }
            }
        }
    }
}
