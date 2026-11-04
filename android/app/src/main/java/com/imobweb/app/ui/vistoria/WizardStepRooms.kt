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

// ===================== STEP 3: Rooms Questionnaire & Management =====================
private enum class RoomQuestionType { NUMBER, BOOLEAN, CHOICE, CUSTOM_ROOMS }

private data class RoomQuestion(
    val key: String,
    val label: String,
    val type: RoomQuestionType,
    val icon: String,
    val group: String,
    val min: Int = 0,
    val max: Int = 20,
    val defaultNumber: Int = 0,
    val defaultBoolean: Boolean = false,
    val options: List<String> = emptyList(),
    val defaultChoice: String = ""
)

private fun getQuestionsForPropertyType(tipo: String): List<RoomQuestion> {
    val base = listOf(
        RoomQuestion(
            key = "entradas",
            label = "Quantas entradas/acessos?",
            type = RoomQuestionType.NUMBER,
            icon = "🚪",
            group = "Geral",
            min = 1,
            max = 5,
            defaultNumber = 1
        )
    )

    val finalQuestion = RoomQuestion(
        key = "comodosExtras",
        label = "Existe mais algum cômodo ou área não mencionado?",
        type = RoomQuestionType.CUSTOM_ROOMS,
        icon = "➕",
        group = "Adicionais"
    )

    val list = when (tipo.uppercase()) {
        "APARTAMENTO", "STUDIO/FLAT", "FLAT" -> listOf(
            base[0],
            RoomQuestion("quartos", "Quantos quartos?", RoomQuestionType.NUMBER, "🛏️", "Dormitórios", min = 0, max = 10, defaultNumber = 2),
            RoomQuestion("suites", "Desses, quantos são suítes?", RoomQuestionType.NUMBER, "✨", "Dormitórios", min = 0, max = 10, defaultNumber = 1),
            RoomQuestion("salas", "Quantas salas (estar/jantar)?", RoomQuestionType.NUMBER, "🛋️", "Social", min = 1, max = 5, defaultNumber = 1),
            RoomQuestion("varanda", "Tem varanda/sacada?", RoomQuestionType.BOOLEAN, "🌿", "Social", defaultBoolean = true),
            RoomQuestion("lavabo", "Tem lavabo?", RoomQuestionType.BOOLEAN, "🚽", "Social", defaultBoolean = false),
            RoomQuestion("cozinha", "Cozinha separada ou americana?", RoomQuestionType.CHOICE, "🍳", "Serviço", options = listOf("SEPARADA", "AMERICANA", "NÃO POSSUI"), defaultChoice = "SEPARADA"),
            RoomQuestion("areaServico", "Tem área de serviço / lavanderia?", RoomQuestionType.BOOLEAN, "🧺", "Serviço", defaultBoolean = true),
            RoomQuestion("garagem", "Quantas vagas de garagem?", RoomQuestionType.NUMBER, "🚗", "Geral", min = 0, max = 10, defaultNumber = 1),
            RoomQuestion("escritorio", "Tem home office/escritório?", RoomQuestionType.BOOLEAN, "💼", "Extras", defaultBoolean = false),
            RoomQuestion("despensa", "Tem despensa?", RoomQuestionType.BOOLEAN, "📦", "Extras", defaultBoolean = false)
        )
        "COBERTURA" -> listOf(
            base[0],
            RoomQuestion("quartos", "Quantos quartos?", RoomQuestionType.NUMBER, "🛏️", "Dormitórios", min = 0, max = 10, defaultNumber = 3),
            RoomQuestion("suites", "Desses, quantos são suítes?", RoomQuestionType.NUMBER, "✨", "Dormitórios", min = 0, max = 10, defaultNumber = 2),
            RoomQuestion("salas", "Quantas salas (estar/jantar)?", RoomQuestionType.NUMBER, "🛋️", "Social", min = 1, max = 5, defaultNumber = 1),
            RoomQuestion("varanda", "Tem varanda/sacada?", RoomQuestionType.BOOLEAN, "🌿", "Social", defaultBoolean = true),
            RoomQuestion("lavabo", "Tem lavabo?", RoomQuestionType.BOOLEAN, "🚽", "Social", defaultBoolean = true),
            RoomQuestion("cozinha", "Cozinha separada ou americana?", RoomQuestionType.CHOICE, "🍳", "Serviço", options = listOf("SEPARADA", "AMERICANA", "NÃO POSSUI"), defaultChoice = "SEPARADA"),
            RoomQuestion("areaServico", "Tem área de serviço?", RoomQuestionType.BOOLEAN, "🧺", "Serviço", defaultBoolean = true),
            RoomQuestion("terraco", "Tem terraço privativo?", RoomQuestionType.BOOLEAN, "🏙️", "Externo", defaultBoolean = true),
            RoomQuestion("churrasqueira", "Tem churrasqueira privativa?", RoomQuestionType.BOOLEAN, "🔥", "Externo", defaultBoolean = true),
            RoomQuestion("piscina", "Tem piscina / hidromassagem?", RoomQuestionType.BOOLEAN, "🏊", "Externo", defaultBoolean = false),
            RoomQuestion("garagem", "Quantas vagas de garagem?", RoomQuestionType.NUMBER, "🚗", "Geral", min = 0, max = 10, defaultNumber = 2),
            RoomQuestion("escritorio", "Tem home office/escritório?", RoomQuestionType.BOOLEAN, "💼", "Extras", defaultBoolean = false),
            RoomQuestion("despensa", "Tem despensa?", RoomQuestionType.BOOLEAN, "📦", "Extras", defaultBoolean = false)
        )
        "CASA", "SOBRADO" -> listOf(
            base[0],
            RoomQuestion("andares", "Quantos andares?", RoomQuestionType.NUMBER, "🏢", "Geral", min = 1, max = 3, defaultNumber = 1),
            RoomQuestion("quartos", "Quantos quartos?", RoomQuestionType.NUMBER, "🛏️", "Dormitórios", min = 0, max = 10, defaultNumber = 3),
            RoomQuestion("suites", "Desses, quantos são suítes?", RoomQuestionType.NUMBER, "✨", "Dormitórios", min = 0, max = 10, defaultNumber = 1),
            RoomQuestion("salas", "Quantas salas (estar/jantar)?", RoomQuestionType.NUMBER, "🛋️", "Social", min = 1, max = 5, defaultNumber = 1),
            RoomQuestion("lavabo", "Tem lavabo?", RoomQuestionType.BOOLEAN, "🚽", "Social", defaultBoolean = false),
            RoomQuestion("cozinha", "Cozinha separada ou americana?", RoomQuestionType.CHOICE, "🍳", "Serviço", options = listOf("SEPARADA", "AMERICANA", "NÃO POSSUI"), defaultChoice = "SEPARADA"),
            RoomQuestion("areaServico", "Tem área de serviço / lavanderia?", RoomQuestionType.BOOLEAN, "🧺", "Serviço", defaultBoolean = true),
            RoomQuestion("varanda", "Tem varanda/sacada?", RoomQuestionType.BOOLEAN, "🌿", "Externo", defaultBoolean = false),
            RoomQuestion("garagem", "Quantas vagas de garagem?", RoomQuestionType.NUMBER, "🚗", "Externo", min = 0, max = 20, defaultNumber = 2),
            RoomQuestion("quintal", "Tem quintal/jardim?", RoomQuestionType.BOOLEAN, "🌳", "Externo", defaultBoolean = true),
            RoomQuestion("churrasqueira", "Tem churrasqueira / área gourmet?", RoomQuestionType.BOOLEAN, "🔥", "Externo", defaultBoolean = false),
            RoomQuestion("piscina", "Tem piscina?", RoomQuestionType.BOOLEAN, "🏊", "Externo", defaultBoolean = false),
            RoomQuestion("escritorio", "Tem home office?", RoomQuestionType.BOOLEAN, "💼", "Extras", defaultBoolean = false),
            RoomQuestion("despensa", "Tem despensa?", RoomQuestionType.BOOLEAN, "📦", "Extras", defaultBoolean = false)
        )
        "SALA", "COMERCIAL" -> listOf(
            base[0],
            RoomQuestion("salas", "Quantas salas/espaços?", RoomQuestionType.NUMBER, "🏢", "Principal", min = 1, max = 10, defaultNumber = 1),
            RoomQuestion("salaReuniao", "Tem sala de reunião?", RoomQuestionType.BOOLEAN, "🤝", "Principal", defaultBoolean = false),
            RoomQuestion("banheiro", "Tem banheiro?", RoomQuestionType.BOOLEAN, "🚿", "Serviço", defaultBoolean = true),
            RoomQuestion("cozinhete", "Tem copa/cozinhete?", RoomQuestionType.BOOLEAN, "☕", "Serviço", defaultBoolean = false),
            RoomQuestion("deposito", "Tem depósito/arquivo?", RoomQuestionType.BOOLEAN, "📦", "Serviço", defaultBoolean = false),
            RoomQuestion("vitrine", "Tem vitrine/fachada?", RoomQuestionType.BOOLEAN, "🏪", "Externo", defaultBoolean = false),
            RoomQuestion("estacionamento", "Tem vagas de garagem/estacionamento?", RoomQuestionType.BOOLEAN, "🅿️", "Externo", defaultBoolean = false)
        )
        else -> listOf(
            base[0],
            RoomQuestion("quartos", "Quantos quartos?", RoomQuestionType.NUMBER, "🛏️", "Dormitórios", min = 0, max = 10, defaultNumber = 2),
            RoomQuestion("suites", "Desses, quantos são suítes?", RoomQuestionType.NUMBER, "✨", "Dormitórios", min = 0, max = 10, defaultNumber = 1),
            RoomQuestion("salas", "Quantas salas?", RoomQuestionType.NUMBER, "🛋️", "Social", min = 1, max = 5, defaultNumber = 1),
            RoomQuestion("banheiro", "Tem banheiro?", RoomQuestionType.BOOLEAN, "🚿", "Serviço", defaultBoolean = true),
            RoomQuestion("cozinha", "Cozinha separada ou americana?", RoomQuestionType.CHOICE, "🍳", "Serviço", options = listOf("SEPARADA", "AMERICANA", "NÃO POSSUI"), defaultChoice = "SEPARADA"),
            RoomQuestion("areaServico", "Tem área de serviço?", RoomQuestionType.BOOLEAN, "🧺", "Serviço", defaultBoolean = true),
            RoomQuestion("garagem", "Quantas vagas de garagem?", RoomQuestionType.NUMBER, "🚗", "Geral", min = 0, max = 10, defaultNumber = 1)
        )
    }

    return list + finalQuestion
}

private fun generateRoomsFromAnswers(
    tipo: String,
    numAnswers: Map<String, Int>,
    boolAnswers: Map<String, Boolean>,
    choiceAnswers: Map<String, String> = emptyMap(),
    customExtras: List<String> = emptyList()
): List<RoomData> {
    val r = mutableListOf<RoomData>()
    val mk = { name: String ->
        RoomData(id = java.util.UUID.randomUUID().toString(), name = name)
    }

    val entradas = numAnswers["entradas"] ?: 1
    val salas = numAnswers["salas"] ?: 1

    if (tipo.uppercase() == "SALA" || tipo.uppercase() == "COMERCIAL") {
        for (i in 1..entradas) r.add(mk(if (entradas > 1) "ENTRADA $i" else "ENTRADA"))
        for (i in 1..salas) r.add(mk(if (salas > 1) "SALA $i" else "SALA PRINCIPAL"))
        if (boolAnswers["salaReuniao"] == true) r.add(mk("SALA DE REUNIÃO"))
        if (boolAnswers["banheiro"] == true) r.add(mk("BANHEIRO"))
        if (boolAnswers["cozinhete"] == true) r.add(mk("COPA / COZINHETE"))
        if (boolAnswers["deposito"] == true) r.add(mk("DEPÓSITO"))
        if (boolAnswers["vitrine"] == true) r.add(mk("VITRINE / FACHADA"))
        if (boolAnswers["estacionamento"] == true) r.add(mk("ESTACIONAMENTO"))
    } else {
        // Residencial
        for (i in 1..entradas) r.add(mk(if (entradas > 1) "ENTRADA $i" else "ENTRADA"))

        when {
            salas >= 3 -> {
                r.add(mk("SALA DE ESTAR"))
                r.add(mk("SALA DE JANTAR"))
                r.add(mk("SALA DE TV"))
            }
            salas == 2 -> {
                r.add(mk("SALA DE ESTAR"))
                r.add(mk("SALA DE JANTAR"))
            }
            salas >= 1 -> {
                r.add(mk("SALA"))
            }
        }

        val cozinhaOpt = choiceAnswers["cozinha"] ?: "SEPARADA"
        when (cozinhaOpt.uppercase()) {
            "AMERICANA" -> r.add(mk("COZINHA AMERICANA"))
            "SEPARADA" -> r.add(mk("COZINHA"))
            "NÃO POSSUI" -> {}
            else -> r.add(mk("COZINHA"))
        }

        if (boolAnswers["areaServico"] != false) r.add(mk("ÁREA DE SERVIÇO"))
        if (boolAnswers["lavabo"] == true) r.add(mk("LAVABO"))

        val quartos = numAnswers["quartos"] ?: 0
        val suites = (numAnswers["suites"] ?: 0).coerceAtMost(quartos)
        val nonSuite = quartos - suites

        for (i in 1..nonSuite) {
            r.add(mk(if (nonSuite > 1) "QUARTO $i" else "QUARTO"))
        }
        for (i in 1..suites) {
            r.add(mk(if (suites > 1) "SUÍTE $i" else "SUÍTE"))
            r.add(mk(if (suites > 1) "BANHEIRO SUÍTE $i" else "BANHEIRO SUÍTE"))
        }

        if (boolAnswers["banheiro"] == true || nonSuite > 0) {
            r.add(mk("BANHEIRO SOCIAL"))
        }

        if (boolAnswers["escritorio"] == true) r.add(mk("ESCRITÓRIO"))
        if (boolAnswers["varanda"] == true) r.add(mk("VARANDA"))
        if (boolAnswers["quintal"] == true) r.add(mk("QUINTAL / JARDIM"))

        val garagem = numAnswers["garagem"] ?: 0
        if (garagem > 0) {
            if (garagem == 1) r.add(mk("GARAGEM"))
            else r.add(mk("GARAGEM ($garagem VAGAS)"))
        }

        if (boolAnswers["churrasqueira"] == true) r.add(mk("ÁREA GOURMET / CHURRASQUEIRA"))
        if (boolAnswers["terraco"] == true) r.add(mk("TERRAÇO"))
        if (boolAnswers["piscina"] == true) r.add(mk("PISCINA"))
        if (boolAnswers["despensa"] == true) r.add(mk("DESPENSA"))
    }

    // Cômodos extras customizados da pergunta final
    for (extra in customExtras) {
        val trimmed = extra.trim().uppercase()
        if (trimmed.isNotBlank()) {
            r.add(mk(trimmed))
        }
    }

    if (r.isEmpty()) {
        r.add(mk("CÔMODO 1"))
    }
    return r
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun StepRooms(
    rooms: List<RoomData>,
    onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int,
    onCurrentRoomIdxChange: (Int) -> Unit,
    tipoImovel: String,
    context: Context
) {
    val questions = remember(tipoImovel) { getQuestionsForPropertyType(tipoImovel) }
    var qStep by remember { mutableIntStateOf(0) }
    var isConfiguring by remember { mutableStateOf(rooms.isEmpty()) }
    var extraRoomName by remember { mutableStateOf("") }

    val customExtras = remember { mutableStateListOf<String>() }
    var currentExtraInput by remember { mutableStateOf("") }
    var wantsExtraRooms by remember { mutableStateOf<Boolean?>(null) }

    val numAnswers = remember(tipoImovel) {
        mutableStateMapOf<String, Int>().apply {
            questions.filter { it.type == RoomQuestionType.NUMBER }.forEach {
                put(it.key, it.defaultNumber)
            }
        }
    }
    val boolAnswers = remember(tipoImovel) {
        mutableStateMapOf<String, Boolean>().apply {
            questions.filter { it.type == RoomQuestionType.BOOLEAN }.forEach {
                put(it.key, it.defaultBoolean)
            }
        }
    }
    val choiceAnswers = remember(tipoImovel) {
        mutableStateMapOf<String, String>().apply {
            questions.filter { it.type == RoomQuestionType.CHOICE }.forEach {
                put(it.key, it.defaultChoice)
            }
        }
    }

    Column {
        if (isConfiguring) {
            // Instruction Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.TipsAndUpdates,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(
                            "Liste os ambientes que serão vistoriados",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "1. Responda às perguntas para gerar os cômodos sob medida.\n" +
                        "2. Use nomes distintos para cômodos parecidos: QUARTO 1, QUARTO 2.\n" +
                        "3. Quanto mais fiel a lista ao imóvel real, mais fácil comparar a saída com a entrada.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Property configuration header
            val propertyIcon = when (tipoImovel.uppercase()) {
                "CASA", "SOBRADO" -> "🏠"
                "SALA", "COMERCIAL" -> "🏬"
                "COBERTURA" -> "🏙️"
                "STUDIO/FLAT", "FLAT" -> "🏡"
                else -> "🏢"
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(propertyIcon, fontSize = 26.sp)
                Spacer(Modifier.width(8.dp))
                Column {
                    Text(
                        "Configure o ${tipoImovel.ifBlank { "IMÓVEL" }}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "${questions.size} perguntas para gerar os cômodos",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Segmented Progress Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                questions.indices.forEach { idx ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .clip(CircleShape)
                            .background(
                                if (idx <= qStep) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Active Question Card
            val currentQ = questions.getOrNull(qStep) ?: questions.first()
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(currentQ.icon, fontSize = 28.sp)
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                "${currentQ.group.uppercase()} · ${qStep + 1}/${questions.size}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                currentQ.label,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(Modifier.height(24.dp))

                    when (currentQ.type) {
                        RoomQuestionType.NUMBER -> {
                            val currentVal = numAnswers[currentQ.key] ?: currentQ.defaultNumber
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                FilledTonalIconButton(
                                    onClick = {
                                        val newVal = (currentVal - 1).coerceAtLeast(currentQ.min)
                                        numAnswers[currentQ.key] = newVal
                                        if (currentQ.key == "quartos") {
                                            val curSuites = numAnswers["suites"] ?: 0
                                            if (curSuites > newVal) numAnswers["suites"] = newVal
                                        }
                                    },
                                    enabled = currentVal > currentQ.min,
                                    modifier = Modifier.size(56.dp),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Text("−", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                                }

                                Text(
                                    text = "$currentVal",
                                    style = MaterialTheme.typography.displaySmall,
                                    fontWeight = FontWeight.Black,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.width(100.dp)
                                )

                                FilledTonalIconButton(
                                    onClick = {
                                        val newVal = (currentVal + 1).coerceAtMost(currentQ.max)
                                        numAnswers[currentQ.key] = newVal
                                        if (currentQ.key == "suites") {
                                            val curQuartos = numAnswers["quartos"] ?: 0
                                            if (newVal > curQuartos) numAnswers["quartos"] = newVal
                                        }
                                    },
                                    enabled = currentVal < currentQ.max,
                                    modifier = Modifier.size(56.dp),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Text("+", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        RoomQuestionType.BOOLEAN -> {
                            val boolVal = boolAnswers[currentQ.key] ?: currentQ.defaultBoolean
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(56.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .clickable { boolAnswers[currentQ.key] = true },
                                    color = if (boolVal) Color(0xFF10B981).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                    border = BorderStroke(
                                        if (boolVal) 2.dp else 1.dp,
                                        if (boolVal) Color(0xFF10B981) else MaterialTheme.colorScheme.outlineVariant
                                    ),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            "Sim ✓",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            color = if (boolVal) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }

                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(56.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .clickable { boolAnswers[currentQ.key] = false },
                                    color = if (!boolVal) Color(0xFFEF4444).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                    border = BorderStroke(
                                        if (!boolVal) 2.dp else 1.dp,
                                        if (!boolVal) Color(0xFFEF4444) else MaterialTheme.colorScheme.outlineVariant
                                    ),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            "Não ✗",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            color = if (!boolVal) Color(0xFFEF4444) else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }
                        }

                        RoomQuestionType.CHOICE -> {
                            val currentChoice = choiceAnswers[currentQ.key] ?: currentQ.defaultChoice
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                currentQ.options.forEach { opt ->
                                    val isSelected = currentChoice.equals(opt, ignoreCase = true)
                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(14.dp))
                                            .clickable { choiceAnswers[currentQ.key] = opt },
                                        color = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.18f)
                                                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                        border = BorderStroke(
                                            if (isSelected) 2.dp else 1.dp,
                                            if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                                        ),
                                        shape = RoundedCornerShape(14.dp)
                                    ) {
                                        Box(
                                            contentAlignment = Alignment.Center,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 14.dp)
                                        ) {
                                            Text(
                                                opt,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        RoomQuestionType.CUSTOM_ROOMS -> {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    val isSim = wantsExtraRooms == true || customExtras.isNotEmpty()
                                    val isNao = wantsExtraRooms == false && customExtras.isEmpty()

                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(14.dp))
                                            .clickable { wantsExtraRooms = true },
                                        color = if (isSim) Color(0xFF10B981).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                        border = BorderStroke(
                                            if (isSim) 2.dp else 1.dp,
                                            if (isSim) Color(0xFF10B981) else MaterialTheme.colorScheme.outlineVariant
                                        ),
                                        shape = RoundedCornerShape(14.dp)
                                    ) {
                                        Box(
                                            contentAlignment = Alignment.Center,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 14.dp)
                                        ) {
                                            Text(
                                                "Sim ✓",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 15.sp,
                                                color = if (isSim) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurface
                                            )
                                        }
                                    }

                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(14.dp))
                                            .clickable {
                                                wantsExtraRooms = false
                                                customExtras.clear()
                                                currentExtraInput = ""
                                            },
                                        color = if (isNao) Color(0xFFEF4444).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                        border = BorderStroke(
                                            if (isNao) 2.dp else 1.dp,
                                            if (isNao) Color(0xFFEF4444) else MaterialTheme.colorScheme.outlineVariant
                                        ),
                                        shape = RoundedCornerShape(14.dp)
                                    ) {
                                        Box(
                                            contentAlignment = Alignment.Center,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 14.dp)
                                        ) {
                                            Text(
                                                "Não ✗",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 15.sp,
                                                color = if (isNao) Color(0xFFEF4444) else MaterialTheme.colorScheme.onSurface
                                            )
                                        }
                                    }
                                }

                                if (wantsExtraRooms == true || customExtras.isNotEmpty()) {
                                    Spacer(Modifier.height(16.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedTextField(
                                            value = currentExtraInput,
                                            onValueChange = { currentExtraInput = it },
                                            placeholder = { Text("Ex: ADEGA, SÓTÃO, OFICINA...") },
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                        Button(
                                            onClick = {
                                                val trimmed = currentExtraInput.trim().uppercase()
                                                if (trimmed.isNotBlank() && !customExtras.contains(trimmed)) {
                                                    customExtras.add(trimmed)
                                                    currentExtraInput = ""
                                                    wantsExtraRooms = true
                                                }
                                            },
                                            enabled = currentExtraInput.isNotBlank()
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(Modifier.width(4.dp))
                                            Text("Add")
                                        }
                                    }

                                    if (customExtras.isNotEmpty()) {
                                        Spacer(Modifier.height(10.dp))
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .horizontalScroll(rememberScrollState()),
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            customExtras.forEach { extra ->
                                                InputChip(
                                                    selected = true,
                                                    onClick = { customExtras.remove(extra) },
                                                    label = { Text(extra, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                                                    trailingIcon = {
                                                        Icon(Icons.Default.Close, contentDescription = "Remover", modifier = Modifier.size(14.dp))
                                                    }
                                                )
                                            }
                                        }
                                    }

                                    Spacer(Modifier.height(10.dp))
                                    Text(
                                        "Sugestões rápidas para adicionar:",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .horizontalScroll(rememberScrollState()),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        listOf("ADEGA", "SÓTÃO", "OFICINA", "DEPÓSITO PRIVATIVO", "CANIL", "HALL PRIVATIVO", "LAVANDERIA EXTERNA").forEach { sug ->
                                            SuggestionChip(
                                                onClick = {
                                                    if (!customExtras.contains(sug)) {
                                                        customExtras.add(sug)
                                                        wantsExtraRooms = true
                                                    }
                                                },
                                                label = { Text("+ $sug", fontSize = 10.sp) }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Navigation between questions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = { if (qStep > 0) qStep-- },
                    enabled = qStep > 0
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Anterior")
                }

                if (qStep < questions.size - 1) {
                    Button(
                        onClick = { qStep++ }
                    ) {
                        Text("Próximo")
                        Spacer(Modifier.width(4.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                    }
                } else {
                    Button(
                        onClick = {
                            val generated = generateRoomsFromAnswers(tipoImovel, numAnswers, boolAnswers, choiceAnswers, customExtras)
                            onRoomsChange(generated)
                            isConfiguring = false
                            Toast.makeText(context, "${generated.size} cômodos gerados!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Gerar Cômodos", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            TextButton(
                onClick = {
                    if (rooms.isEmpty()) {
                        onRoomsChange(listOf(
                            RoomData(name = "ENTRADA"),
                            RoomData(name = "SALA"),
                            RoomData(name = "COZINHA"),
                            RoomData(name = "QUARTO 1"),
                            RoomData(name = "BANHEIRO SOCIAL")
                        ))
                    }
                    isConfiguring = false
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Ou criar cômodos manualmente sem responder", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

        } else {
            // Generated View (Rooms List & Management)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(
                            "${rooms.size} Cômodos Gerados",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        "Revise, edite ou adicione cômodos extras",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                FilledTonalButton(
                    onClick = {
                        isConfiguring = true
                        qStep = 0
                    },
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Refazer", fontSize = 11.sp)
                }
            }

            Spacer(Modifier.height(12.dp))

            // Summary Stats Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AssistChip(
                    onClick = {},
                    label = { Text("Total: ${rooms.size}", fontWeight = FontWeight.Bold) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                        labelColor = MaterialTheme.colorScheme.primary
                    )
                )
                val qQuartos = numAnswers["quartos"] ?: 0
                if (qQuartos > 0) {
                    AssistChip(
                        onClick = {},
                        label = { Text("Quartos: $qQuartos") }
                    )
                }
                val qSuites = numAnswers["suites"] ?: 0
                if (qSuites > 0) {
                    AssistChip(
                        onClick = {},
                        label = { Text("Suítes: $qSuites") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = Color(0xFFF59E0B).copy(alpha = 0.12f),
                            labelColor = Color(0xFFF59E0B)
                        )
                    )
                }
                val qVagas = numAnswers["garagem"] ?: 0
                if (qVagas > 0) {
                    AssistChip(
                        onClick = {},
                        label = { Text("Vagas: $qVagas") }
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Room items
            rooms.forEachIndexed { idx, room ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    border = if (idx == currentRoomIdx) BorderStroke(1.dp, MaterialTheme.colorScheme.primary) else null
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(32.dp),
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    "${idx + 1}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                        Spacer(Modifier.width(10.dp))
                        OutlinedTextField(
                            value = room.name,
                            onValueChange = { newName ->
                                onRoomsChange(rooms.toMutableList().apply {
                                    this[idx] = room.copy(name = newName)
                                })
                            },
                            placeholder = { Text("Ex: SALA DE ESTAR, QUARTO") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                        )
                        Spacer(Modifier.width(6.dp))
                        IconButton(
                            onClick = {
                                val mutable = rooms.toMutableList()
                                mutable.removeAt(idx)
                                onRoomsChange(mutable)
                                if (currentRoomIdx >= mutable.size && mutable.isNotEmpty()) {
                                    onCurrentRoomIdxChange(mutable.size - 1)
                                }
                            }
                        ) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "Remover",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Quick add extra room
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = extraRoomName,
                    onValueChange = { extraRoomName = it },
                    placeholder = { Text("Nome do cômodo extra...") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                Button(
                    onClick = {
                        val trimmed = extraRoomName.trim().uppercase()
                        if (trimmed.isNotBlank()) {
                            onRoomsChange(rooms + RoomData(name = trimmed))
                            extraRoomName = ""
                        }
                    },
                    enabled = extraRoomName.isNotBlank()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Add")
                }
            }

            Spacer(Modifier.height(8.dp))

            // Quick Add Shortcut Chips
            Text("Atalhos rápidos:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(4.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf("QUARTO", "BANHEIRO", "GARAGEM", "VARANDA", "DEPÓSITO", "ÁREA GOURMET").forEach { shortcut ->
                    SuggestionChip(
                        onClick = {
                            val count = rooms.count { it.name.startsWith(shortcut, ignoreCase = true) }
                            val newName = if (count > 0) "$shortcut ${count + 1}" else shortcut
                            onRoomsChange(rooms + RoomData(name = newName))
                        },
                        label = { Text("+ $shortcut", fontSize = 11.sp) }
                    )
                }
            }
        }
    }
}
