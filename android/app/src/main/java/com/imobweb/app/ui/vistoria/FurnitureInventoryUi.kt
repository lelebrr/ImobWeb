package com.imobweb.app.ui.vistoria

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.imobweb.app.model.FurnitureDetail
import com.imobweb.app.model.FurnitureItems
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.RoomFurnitureCatalog
import java.util.UUID

private val ITEM_DAMAGE_TAGS = listOf(
    "Arranhado", "Manchado", "Amassado", "Descascando",
    "Faltando peça", "Quebrado / Trincado", "Não liga / Defeito", "Sujo / Empoeirado"
)

internal fun roomFurnitureCount(room: RoomData): Int {
    val extras = room.furniture.count { fn -> room.furnitureDetails.none { it.name.equals(fn, ignoreCase = true) } }
    return room.furnitureDetails.size + extras
}

private fun conditionColor(code: String): Color = when (code) {
    "novo" -> Color(0xFF0284C7)
    "otimo" -> Color(0xFF059669)
    "ok" -> Color(0xFF10B981)
    "regular" -> Color(0xFFD97706)
    "ruim" -> Color(0xFFDC2626)
    else -> Color(0xFF64748B)
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
internal fun FurnitureInventorySection(
    room: RoomData,
    onAddOrUpdateDetail: (FurnitureDetail) -> Unit,
    onRemoveDetail: (String) -> Unit,
    onDuplicateDetail: (String) -> Unit,
    onToggleLegacyFurniture: (String) -> Unit,
    onTakePhotoForFurniture: (String) -> Unit,
    onPickFromGalleryForFurniture: (String) -> Unit,
    onOpenPhotoAnnotator: ((Int) -> Unit)? = null
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Relevantes") }
    var newItemName by remember { mutableStateOf("") }
    var expandedIds by remember(room.id) { mutableStateOf<Set<String>>(emptySet()) }
    var showCatalog by remember(room.id) { mutableStateOf(true) }

    val relevantList = remember(room.name) { RoomFurnitureCatalog.getRelevantFurniture(room.name) }
    val allCatalogItems = remember(relevantList) {
        (relevantList + FurnitureItems.groups.flatMap { it.items }).distinct()
    }
    val categoryTabs = remember {
        listOf("Relevantes", "Todos") + FurnitureItems.groups.map { it.category }
    }

    val filteredCatalog = remember(searchQuery, selectedCategory, relevantList, allCatalogItems) {
        when {
            searchQuery.isNotBlank() ->
                allCatalogItems.filter { it.contains(searchQuery.trim(), ignoreCase = true) }
            selectedCategory == "Relevantes" -> relevantList
            selectedCategory == "Todos" -> allCatalogItems
            else -> FurnitureItems.groups.find { it.category == selectedCategory }?.items ?: emptyList()
        }
    }

    // Une FurnitureDetail persistidos com eventuais itens legados/IA que ainda estejam só em room.furniture
    val extraLegacyDetails = remember(room.furniture, room.furnitureDetails) {
        room.furniture
            .filter { fn -> room.furnitureDetails.none { it.name.equals(fn, ignoreCase = true) } }
            .map { fn ->
                FurnitureDetail(
                    id = "legacy:$fn",
                    name = fn,
                    category = FurnitureItems.detectCategory(fn)
                )
            }
    }
    val combinedDetails = remember(room.furnitureDetails, extraLegacyDetails) {
        room.furnitureDetails + extraLegacyDetails
    }
    val selectedNamesLower = remember(room.furniture, room.furnitureDetails) {
        (room.furniture + room.furnitureDetails.map { it.name }).map { it.lowercase() }.toSet()
    }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        // Adição manual rápida 1 a 1 (ideal para modo livre / imóveis mobiliados)
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = newItemName,
                onValueChange = { newItemName = it },
                placeholder = { Text("Adicionar móvel, eletro ou utensílio 1 a 1...", fontSize = 12.sp) },
                trailingIcon = { DictationIcon { newItemName = appendDictation(newItemName, it) } },
                modifier = Modifier.weight(1f),
                singleLine = true,
                textStyle = MaterialTheme.typography.bodySmall
            )
            Spacer(Modifier.width(8.dp))
            FilledTonalIconButton(
                onClick = {
                    val clean = newItemName.trim()
                    if (clean.isNotEmpty()) {
                        val created = FurnitureDetail(
                            id = UUID.randomUUID().toString(),
                            name = clean,
                            category = FurnitureItems.detectCategory(clean)
                        )
                        onAddOrUpdateDetail(created)
                        expandedIds = expandedIds + created.id
                        newItemName = ""
                    }
                },
                enabled = newItemName.isNotBlank()
            ) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar item")
            }
        }

        // Catálogo expansível com busca + filtro por categoria (+120 itens)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
            shape = RoundedCornerShape(10.dp)
        ) {
            Column(Modifier.padding(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth().clickable { showCatalog = !showCatalog },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Catálogo Rápido (${allCatalogItems.size} itens)",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Icon(
                        if (showCatalog) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }

                if (showCatalog) {
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Buscar no catálogo (ex: fogão, taças, sofá...)", fontSize = 12.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, null, modifier = Modifier.size(18.dp)) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp))
                                }
                            }
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        textStyle = MaterialTheme.typography.bodySmall
                    )

                    Spacer(Modifier.height(8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(categoryTabs) { cat ->
                            FilterChip(
                                selected = selectedCategory == cat && searchQuery.isBlank(),
                                onClick = {
                                    searchQuery = ""
                                    selectedCategory = cat
                                },
                                label = { Text(cat, fontSize = 11.sp, maxLines = 1) },
                                modifier = Modifier.height(30.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    if (filteredCatalog.isEmpty()) {
                        Text(
                            "Nenhum item encontrado. Use o campo acima para adicionar \"$searchQuery\" manualmente.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(5.dp),
                            verticalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            filteredCatalog.forEach { itemName ->
                                val isSelected = itemName.lowercase() in selectedNamesLower
                                AssistChip(
                                    onClick = {
                                        if (isSelected) {
                                            val persisted = room.furnitureDetails.find { it.name.equals(itemName, ignoreCase = true) }
                                            if (persisted != null) {
                                                onRemoveDetail(persisted.id)
                                            } else {
                                                onToggleLegacyFurniture(itemName)
                                            }
                                        } else {
                                            val created = FurnitureDetail(
                                                id = UUID.randomUUID().toString(),
                                                name = itemName,
                                                category = FurnitureItems.detectCategory(itemName)
                                            )
                                            onAddOrUpdateDetail(created)
                                            expandedIds = expandedIds + created.id
                                        }
                                    },
                                    label = { Text(itemName, fontSize = 11.sp, maxLines = 1) },
                                    leadingIcon = if (isSelected) {
                                        {
                                            Icon(
                                                Icons.Default.Check, null,
                                                modifier = Modifier.size(14.dp),
                                                tint = MaterialTheme.colorScheme.secondary
                                            )
                                        }
                                    } else null,
                                    border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.secondary) else null,
                                    modifier = Modifier.height(30.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Cabeçalho da lista detalhada de itens do cômodo
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Itens Detalhados no Cômodo (${combinedDetails.size})",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )
            if (combinedDetails.isNotEmpty()) {
                val allExpanded = combinedDetails.all { it.id in expandedIds }
                TextButton(
                    onClick = {
                        expandedIds = if (allExpanded) emptySet() else combinedDetails.map { it.id }.toSet()
                    },
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp)
                ) {
                    Text(if (allExpanded) "Recolher todos" else "Expandir todos", fontSize = 11.sp)
                }
            }
        }

        if (combinedDetails.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f))
            ) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Nenhum móvel ou item adicionado neste cômodo ainda.", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                    Text(
                        "Toque nos itens do catálogo ou adicione manualmente acima para detalhar estado, marca/modelo, funcionamento e tirar dezenas de fotos específicas de cada item.",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            combinedDetails.forEach { detail ->
                val isLegacy = detail.id.startsWith("legacy:")
                val isExpanded = detail.id in expandedIds
                val itemPhotos = remember(room.photos, detail.name) {
                    room.photos.mapIndexedNotNull { globalIdx, p ->
                        if (p.furnitureTag.equals(detail.name, ignoreCase = true)) globalIdx to p else null
                    }
                }

                FurnitureDetailCard(
                    detail = detail,
                    expanded = isExpanded,
                    photos = itemPhotos,
                    onToggleExpand = {
                        expandedIds = if (isExpanded) expandedIds - detail.id else expandedIds + detail.id
                    },
                    onSave = { updated ->
                        val cleanUpdated = if (isLegacy) {
                            val newId = UUID.randomUUID().toString()
                            expandedIds = (expandedIds - detail.id) + newId
                            updated.copy(id = newId)
                        } else updated
                        onAddOrUpdateDetail(cleanUpdated)
                    },
                    onDuplicate = {
                        if (isLegacy) {
                            val first = detail.copy(id = UUID.randomUUID().toString())
                            onAddOrUpdateDetail(first)
                            onDuplicateDetail(first.id)
                        } else {
                            onDuplicateDetail(detail.id)
                        }
                    },
                    onRemove = {
                        if (isLegacy) onToggleLegacyFurniture(detail.name)
                        else onRemoveDetail(detail.id)
                    },
                    onTakePhoto = { onTakePhotoForFurniture(detail.name) },
                    onPickFromGallery = { onPickFromGalleryForFurniture(detail.name) },
                    onOpenPhoto = { globalIdx -> onOpenPhotoAnnotator?.invoke(globalIdx) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun FurnitureDetailCard(
    detail: FurnitureDetail,
    expanded: Boolean,
    photos: List<Pair<Int, com.imobweb.app.model.PhotoData>>,
    onToggleExpand: () -> Unit,
    onSave: (FurnitureDetail) -> Unit,
    onDuplicate: () -> Unit,
    onRemove: () -> Unit,
    onTakePhoto: () -> Unit,
    onPickFromGallery: () -> Unit,
    onOpenPhoto: (Int) -> Unit
) {
    val condColor = conditionColor(detail.condition)
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(
            width = if (expanded) 1.5.dp else 1.dp,
            color = if (expanded) MaterialTheme.colorScheme.primary.copy(alpha = 0.7f) else MaterialTheme.colorScheme.outlineVariant
        )
    ) {
        Column(Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().clickable { onToggleExpand() },
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = if (detail.quantity > 1) "${detail.quantity}x ${detail.name}" else detail.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                    }
                    Spacer(Modifier.height(3.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant
                            ) {
                                Text(detail.category, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                        item {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = condColor.copy(alpha = 0.16f)
                            ) {
                                Text(
                                    FurnitureDetail.conditionLabel(detail.condition),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = condColor,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        if (photos.isNotEmpty()) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = Color(0xFF065F46).copy(alpha = 0.25f)
                                ) {
                                    Text(
                                        "📷 ${photos.size} foto(s)",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF34D399),
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                        if (detail.damages.isNotEmpty()) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = MaterialTheme.colorScheme.errorContainer
                                ) {
                                    Text(
                                        "⚠️ ${detail.damages.size} avaria(s)",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onErrorContainer,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
                IconButton(onClick = onTakePhoto) {
                    Icon(Icons.Default.PhotoCamera, contentDescription = "Fotografar ${detail.name}", tint = MaterialTheme.colorScheme.primary)
                }
                IconButton(onClick = onToggleExpand) {
                    Icon(if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore, contentDescription = null)
                }
            }

            if (expanded) {
                HorizontalDivider(Modifier.padding(vertical = 8.dp))

                // Nome + Quantidade
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = detail.name,
                        onValueChange = { onSave(detail.copy(name = it)) },
                        label = { Text("Nome do item", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        textStyle = MaterialTheme.typography.bodySmall
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { if (detail.quantity > 1) onSave(detail.copy(quantity = detail.quantity - 1)) },
                                modifier = Modifier.size(34.dp)
                            ) { Text("-", fontWeight = FontWeight.Bold, fontSize = 16.sp) }
                            Text("${detail.quantity}x", fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.padding(horizontal = 4.dp))
                            IconButton(
                                onClick = { onSave(detail.copy(quantity = detail.quantity + 1)) },
                                modifier = Modifier.size(34.dp)
                            ) { Text("+", fontWeight = FontWeight.Bold, fontSize = 16.sp) }
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))
                Text("Categoria", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.padding(top = 4.dp)) {
                    items(FurnitureDetail.CATEGORIES) { cat ->
                        FilterChip(
                            selected = detail.category == cat,
                            onClick = { onSave(detail.copy(category = cat)) },
                            label = { Text(cat, fontSize = 11.sp) },
                            modifier = Modifier.height(28.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = detail.brandModel,
                    onValueChange = { onSave(detail.copy(brandModel = it)) },
                    label = { Text("Marca / Modelo / Cor / Material", fontSize = 11.sp) },
                    placeholder = { Text("Ex: Samsung 50\", Brastemp Inox, MDF branco", fontSize = 11.sp) },
                    trailingIcon = { DictationIcon { onSave(detail.copy(brandModel = appendDictation(detail.brandModel, it))) } },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodySmall
                )

                Spacer(Modifier.height(8.dp))
                Text("Estado de Conservação", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.padding(top = 4.dp)) {
                    items(FurnitureDetail.CONDITIONS) { (code, label) ->
                        val c = conditionColor(code)
                        FilterChip(
                            selected = detail.condition == code,
                            onClick = { onSave(detail.copy(condition = code)) },
                            label = {
                                Text(
                                    label,
                                    fontSize = 11.sp,
                                    fontWeight = if (detail.condition == code) FontWeight.Bold else FontWeight.Normal,
                                    color = if (detail.condition == code) c else MaterialTheme.colorScheme.onSurface
                                )
                            },
                            modifier = Modifier.height(28.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                Text("Funcionamento", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.padding(top = 4.dp)) {
                    items(FurnitureDetail.WORKING_OPTIONS) { (code, label) ->
                        FilterChip(
                            selected = detail.working == code,
                            onClick = { onSave(detail.copy(working = code)) },
                            label = { Text(label, fontSize = 11.sp) },
                            modifier = Modifier.height(28.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                Text("Avarias / Detalhes do Item", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    ITEM_DAMAGE_TAGS.forEach { dTag ->
                        val active = dTag in detail.damages
                        FilterChip(
                            selected = active,
                            onClick = {
                                val next = if (active) detail.damages - dTag else detail.damages + dTag
                                onSave(detail.copy(damages = next))
                            },
                            label = { Text(dTag, fontSize = 10.sp) },
                            modifier = Modifier.height(28.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = detail.notes,
                    onValueChange = { onSave(detail.copy(notes = it)) },
                    label = { Text("Observações do item", fontSize = 11.sp) },
                    placeholder = { Text("Ex: Com controle remoto, gaveta emperrada, sem arranhões...", fontSize = 11.sp) },
                    trailingIcon = { DictationIcon { onSave(detail.copy(notes = appendDictation(detail.notes, it))) } },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    maxLines = 4,
                    textStyle = MaterialTheme.typography.bodySmall
                )

                // Seção dedicada de fotos vinculadas diretamente a este móvel/item
                Spacer(Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "Fotos de ${detail.name} (${photos.size})",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(
                                onClick = onTakePhoto,
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.PhotoCamera, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(5.dp))
                                Text("Tirar Fotos", fontSize = 12.sp, maxLines = 1)
                            }
                            OutlinedButton(
                                onClick = onPickFromGallery,
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.PhotoLibrary, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(5.dp))
                                Text("Galeria", fontSize = 12.sp, maxLines = 1)
                            }
                        }
                        if (photos.isNotEmpty()) {
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                items(photos) { (globalIdx, p) ->
                                    Box(
                                        modifier = Modifier
                                            .width(76.dp)
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .clickable { onOpenPhoto(globalIdx) }
                                    ) {
                                        PhotoThumb(p, modifier = Modifier.fillMaxSize())
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDuplicate) {
                        Icon(Icons.Default.ContentCopy, null, modifier = Modifier.size(15.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Duplicar", fontSize = 12.sp)
                    }
                    TextButton(
                        onClick = onRemove,
                        colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Icon(Icons.Default.Delete, null, modifier = Modifier.size(15.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Remover item", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
