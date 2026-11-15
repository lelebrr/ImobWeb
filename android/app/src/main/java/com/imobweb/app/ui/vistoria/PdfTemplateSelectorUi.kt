package com.imobweb.app.ui.vistoria

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.imobweb.app.util.PdfTemplateCatalog
import com.imobweb.app.util.PdfTemplateConfig

private val COLOR_SWATCHES = listOf(
    "#2563eb" to "Azul",
    "#059669" to "Esmeralda",
    "#b45309" to "Bronze",
    "#be123c" to "Bordô",
    "#4f46e5" to "Índigo",
    "#0d9488" to "Teal",
    "#d97706" to "Âmbar",
    "#111827" to "Grafite"
)

private fun parseColorSafe(hex: String, fallback: Color = Color(0xFF2563EB)): Color =
    runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(fallback)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
internal fun PdfTemplatePickerSection(
    selectedTemplate: PdfTemplateConfig,
    customTemplate: PdfTemplateConfig,
    onSelectPreset: (PdfTemplateConfig) -> Unit,
    onOpenCustomBuilder: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            "Escolha o Modelo / Template do PDF",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Selecione 1 entre 8 layouts distintos ou use a opção 9 para criar o seu próprio modelo sob medida:",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        PdfTemplateCatalog.presets.forEach { preset ->
            val isSelected = selectedTemplate.id == preset.id
            val accent = parseColorSafe(preset.accentHex)
            Card(
                onClick = { onSelectPreset(preset) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) accent.copy(alpha = 0.10f) else MaterialTheme.colorScheme.surface
                ),
                border = BorderStroke(
                    width = if (isSelected) 2.dp else 1.dp,
                    color = if (isSelected) accent else MaterialTheme.colorScheme.outlineVariant
                )
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(accent),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "${preset.number}",
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 14.sp
                        )
                    }
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            preset.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            preset.subtitle,
                            fontSize = 11.sp,
                            lineHeight = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.height(5.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            val badges = buildList {
                                add(
                                    when (preset.coverStyle) {
                                        "none" -> "Sem Capa"
                                        "judicial" -> "Capa Cartorial"
                                        "luxury" -> "Capa Mobiliado"
                                        "minimal" -> "Minimal P&B"
                                        else -> "Capa Moderna"
                                    }
                                )
                                add("${preset.photosPerRow} fotos/linha")
                                if (preset.fontFamily == "serif") add("Serif Jurídica")
                                if (preset.fontFamily == "mono") add("Fonte Técnica")
                                if (preset.showMasterChecklistOverview) add("Quadro Geral")
                                if (preset.showWitnesses) add("2 Testemunhas")
                                if (preset.compactFlow) add("Compacto")
                            }
                            items(badges.size) { bIdx ->
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = accent.copy(alpha = 0.14f)
                                ) {
                                    Text(
                                        badges[bIdx],
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = accent,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                    if (isSelected) {
                        Spacer(Modifier.width(6.dp))
                        Icon(Icons.Default.CheckCircle, contentDescription = "Selecionado", tint = accent)
                    }
                }
            }
        }

        // Opção 9: Criar / Editar Template Personalizado
        val isCustomSelected = selectedTemplate.id == "t9_custom"
        val customAccent = parseColorSafe(customTemplate.accentHex, MaterialTheme.colorScheme.primary)
        Card(
            onClick = onOpenCustomBuilder,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isCustomSelected) customAccent.copy(alpha = 0.12f)
                else MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
            ),
            border = BorderStroke(
                width = if (isCustomSelected) 2.dp else 1.5.dp,
                color = if (isCustomSelected) customAccent else MaterialTheme.colorScheme.primary
            )
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text("9", color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        if (isCustomSelected) "9. ${customTemplate.name} (Personalizado)"
                        else "9. Criar / Personalizar Meu Template",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        "Escolha manualmente tudo o que entra no PDF: cores, fonte, tipo de capa, fotos por linha e todas as seções.",
                        fontSize = 11.sp,
                        lineHeight = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(Modifier.width(6.dp))
                Icon(
                    if (isCustomSelected) Icons.Default.Tune else Icons.Default.AddCircleOutline,
                    contentDescription = "Configurar template 9",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
internal fun PdfTemplatePickerDialog(
    selectedTemplate: PdfTemplateConfig,
    customTemplate: PdfTemplateConfig,
    onSelectPreset: (PdfTemplateConfig) -> Unit,
    onOpenCustomBuilder: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f),
            shape = RoundedCornerShape(16.dp),
            tonalElevation = 6.dp
        ) {
            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Template do PDF", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Fechar")
                    }
                }
                HorizontalDivider()
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(14.dp)
                ) {
                    PdfTemplatePickerSection(
                        selectedTemplate = selectedTemplate,
                        customTemplate = customTemplate,
                        onSelectPreset = {
                            onSelectPreset(it)
                            onDismiss()
                        },
                        onOpenCustomBuilder = {
                            onDismiss()
                            onOpenCustomBuilder()
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun CustomTemplateBuilderDialog(
    initialConfig: PdfTemplateConfig,
    onDismiss: () -> Unit,
    onSave: (PdfTemplateConfig) -> Unit
) {
    var cfg by remember(initialConfig) {
        mutableStateOf(
            initialConfig.copy(
                id = "t9_custom",
                number = 9,
                name = initialConfig.name.ifBlank { "Template Personalizado" }
            )
        )
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.92f),
            shape = RoundedCornerShape(16.dp),
            tonalElevation = 6.dp
        ) {
            Column {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Criar Template Personalizado (#9)", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Personalize visual e todas as seções incluídas no PDF", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick = onDismiss) { Icon(Icons.Default.Close, contentDescription = "Fechar") }
                }
                HorizontalDivider()

                // Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Presets rápidos de configuração
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = {
                                cfg = cfg.copy(
                                    showCover = true, showLegalPreamble = true, showCriteriaBox = true,
                                    showPropertyTable = true, showPartiesTable = true, showMetersKeys = true,
                                    showMasterChecklistOverview = true, showRoomChecklist = true,
                                    showFurnitureTable = true, showSimpleInventory = true, showRoomDamages = true,
                                    showRoomObservations = true, showPhotos = true, showPhotoFurnitureTag = true,
                                    showPhotoTimestamp = true, showPhotoAnnotations = true,
                                    showConsolidatedDamages = true, showRepairsEstimate = true,
                                    showConsiderations = true, showSignatures = true, showWitnesses = true
                                )
                            },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                        ) { Text("Incluir Tudo", fontSize = 12.sp) }

                        OutlinedButton(
                            onClick = {
                                cfg = cfg.copy(
                                    showCover = false, coverStyle = "none", compactFlow = true,
                                    showLegalPreamble = false, showCriteriaBox = false,
                                    showMasterChecklistOverview = false, showWitnesses = false,
                                    showPropertyTable = true, showPartiesTable = true,
                                    showFurnitureTable = true, showRoomDamages = true, showPhotos = true,
                                    showSignatures = true
                                )
                            },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                        ) { Text("Essencial Rápido", fontSize = 12.sp) }
                    }

                    OutlinedTextField(
                        value = cfg.name,
                        onValueChange = { cfg = cfg.copy(name = it) },
                        label = { Text("Nome do seu template") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = cfg.customHeaderTitle,
                        onValueChange = { cfg = cfg.copy(customHeaderTitle = it) },
                        label = { Text("Título personalizado do laudo (opcional)") },
                        placeholder = { Text("Padrão: Laudo de Vistoria") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = cfg.customFooterText,
                        onValueChange = { cfg = cfg.copy(customFooterText = it) },
                        label = { Text("Texto personalizado do rodapé (opcional)") },
                        placeholder = { Text("Ex: CRECI 12345-J • Vistoria Técnica") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Cor de destaque
                    Text("Cor Principal do PDF", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(COLOR_SWATCHES.size) { i ->
                            val (hex, label) = COLOR_SWATCHES[i]
                            val c = parseColorSafe(hex)
                            val active = cfg.accentHex.equals(hex, ignoreCase = true)
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.clickable { cfg = cfg.copy(accentHex = hex) }
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(c)
                                        .border(if (active) 3.dp else 1.dp, if (active) Color.White else Color.Gray, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (active) Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(16.dp))
                                }
                                Text(label, fontSize = 10.sp)
                            }
                        }
                    }

                    // Fonte
                    Text("Tipografia / Fonte", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        val fonts = listOf("sans" to "Moderna (Sans)", "serif" to "Jurídica (Serif)", "mono" to "Técnica (Mono)")
                        items(fonts.size) { i ->
                            val (k, label) = fonts[i]
                            FilterChip(
                                selected = cfg.fontFamily == k,
                                onClick = { cfg = cfg.copy(fontFamily = k) },
                                label = { Text(label, fontSize = 12.sp) }
                            )
                        }
                    }

                    // Estilo da Capa
                    Text("Estilo de Capa", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        val covers = listOf(
                            "modern" to "Executiva",
                            "luxury" to "Luxo Mobiliado",
                            "judicial" to "Cartorial",
                            "minimal" to "Minimal P&B",
                            "none" to "Sem Capa"
                        )
                        items(covers.size) { i ->
                            val (k, label) = covers[i]
                            FilterChip(
                                selected = if (k == "none") (!cfg.showCover || cfg.coverStyle == "none") else (cfg.showCover && cfg.coverStyle == k),
                                onClick = {
                                    cfg = if (k == "none") cfg.copy(showCover = false, coverStyle = "none")
                                    else cfg.copy(showCover = true, coverStyle = k)
                                },
                                label = { Text(label, fontSize = 12.sp) }
                            )
                        }
                    }

                    // Fotos por linha
                    Text("Fotos por Linha & Detalhes", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        val cols = listOf(2 to "2 fotos/linha", 3 to "3 fotos/linha", 4 to "4 fotos/linha")
                        items(cols.size) { i ->
                            val (n, label) = cols[i]
                            FilterChip(
                                selected = cfg.photosPerRow == n,
                                onClick = { cfg = cfg.copy(photosPerRow = n) },
                                label = { Text(label, fontSize = 12.sp) }
                            )
                        }
                    }

                    HorizontalDivider()
                    Text("O que adicionar no PDF", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)

                    TemplateSwitchRow("Capa inicial de destaque", cfg.showCover) { cfg = cfg.copy(showCover = it, coverStyle = if (it && cfg.coverStyle == "none") "modern" else cfg.coverStyle) }
                    TemplateSwitchRow("Modo compacto (sem quebras de página extras)", cfg.compactFlow) { cfg = cfg.copy(compactFlow = it) }
                    TemplateSwitchRow("Termo jurídico e Lei do Inquilinato", cfg.showLegalPreamble) { cfg = cfg.copy(showLegalPreamble = it) }
                    TemplateSwitchRow("Quadro de critérios de avaliação (Novo a Ruim)", cfg.showCriteriaBox) { cfg = cfg.copy(showCriteriaBox = it) }
                    TemplateSwitchRow("Tabela de Dados do Imóvel", cfg.showPropertyTable) { cfg = cfg.copy(showPropertyTable = it) }
                    TemplateSwitchRow("Tabela de Partes Envolvidas", cfg.showPartiesTable) { cfg = cfg.copy(showPartiesTable = it) }
                    TemplateSwitchRow("Medidores (Água/Luz/Gás) e Chaves", cfg.showMetersKeys) { cfg = cfg.copy(showMetersKeys = it) }
                    TemplateSwitchRow("Quadro Geral comparando todos os cômodos", cfg.showMasterChecklistOverview) { cfg = cfg.copy(showMasterChecklistOverview = it) }
                    TemplateSwitchRow("Tabela Detalhada de Móveis, Eletros e Itens", cfg.showFurnitureTable) { cfg = cfg.copy(showFurnitureTable = it) }
                    TemplateSwitchRow("Lista complementar de itens por cômodo", cfg.showSimpleInventory) { cfg = cfg.copy(showSimpleInventory = it) }
                    TemplateSwitchRow("Checklist de conservação em cada cômodo", cfg.showRoomChecklist) { cfg = cfg.copy(showRoomChecklist = it) }
                    TemplateSwitchRow("Avarias e problemas em cada cômodo", cfg.showRoomDamages) { cfg = cfg.copy(showRoomDamages = it) }
                    TemplateSwitchRow("Observações individuais dos cômodos", cfg.showRoomObservations) { cfg = cfg.copy(showRoomObservations = it) }
                    TemplateSwitchRow("Grade de Fotografias", cfg.showPhotos) { cfg = cfg.copy(showPhotos = it) }
                    if (cfg.showPhotos) {
                        TemplateSwitchRow("  ↳ Mostrar etiqueta do móvel na legenda", cfg.showPhotoFurnitureTag) { cfg = cfg.copy(showPhotoFurnitureTag = it) }
                        TemplateSwitchRow("  ↳ Mostrar data e hora da foto", cfg.showPhotoTimestamp) { cfg = cfg.copy(showPhotoTimestamp = it) }
                        TemplateSwitchRow("  ↳ Mostrar pinos/marcações de avarias nas fotos", cfg.showPhotoAnnotations) { cfg = cfg.copy(showPhotoAnnotations = it) }
                    }
                    TemplateSwitchRow("Quadro consolidado de Não Conformidades", cfg.showConsolidatedDamages) { cfg = cfg.copy(showConsolidatedDamages = it) }
                    TemplateSwitchRow("Estimativa de custo de reparos", cfg.showRepairsEstimate) { cfg = cfg.copy(showRepairsEstimate = it) }
                    TemplateSwitchRow("Considerações finais e contestação", cfg.showConsiderations) { cfg = cfg.copy(showConsiderations = it) }
                    TemplateSwitchRow("Página/Bloco de Assinaturas", cfg.showSignatures) { cfg = cfg.copy(showSignatures = it) }
                    if (cfg.showSignatures) {
                        TemplateSwitchRow("  ↳ Incluir 2 campos de Testemunhas", cfg.showWitnesses) { cfg = cfg.copy(showWitnesses = it) }
                    }
                }

                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancelar")
                    }
                    Button(
                        onClick = { onSave(PdfTemplateCatalog.sanitize(cfg.copy(id = "t9_custom", number = 9))) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Check, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Usar Template #9")
                    }
                }
            }
        }
    }
}

@Composable
private fun TemplateSwitchRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 12.sp, modifier = Modifier.weight(1f).padding(end = 8.dp))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
