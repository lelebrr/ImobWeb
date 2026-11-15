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
import com.imobweb.app.util.PdfTemplateCatalog
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun VistoriaWizardScreen(
    repository: VistoriaRepository,
    vistoriaId: Long? = null,
    onBack: () -> Unit,
    onSaved: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val app = context.applicationContext as ImobWebApp

    // Estado do editor no ViewModel: sobrevive à rotação; id e passo também à morte do processo
    val vm: VistoriaEditorViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        key = "editor-${vistoriaId ?: 0L}",
        initializer = { VistoriaEditorViewModel(createSavedStateHandle(), repository, vistoriaId) }
    )
    LaunchedEffect(Unit) { vm.load(context) }

    var currentStep by vm::currentStep
    var savedId by vm::savedId
    var currentRoomIdx by vm::currentRoomIdx
    var isSaving by vm::isSaving
    val loaded = vm.loaded
    val hoje = vm.hoje

    var condominio by vm::condominio
    var endereco by vm::endereco
    var numero by vm::numero
    var conjApto by vm::conjApto
    var cep by vm::cep
    var bairro by vm::bairro
    var cidade by vm::cidade
    var estado by vm::estado
    var tipoImovel by vm::tipoImovel
    var finalidade by vm::finalidade
    var metragem by vm::metragem
    var mobiliado by vm::mobiliado
    var locadora by vm::locadora
    var locadoraCpf by vm::locadoraCpf
    var locatario by vm::locatario
    var locatarioCpf by vm::locatarioCpf
    var vistoriadora by vm::vistoriadora
    var solicitante by vm::solicitante
    var consideracoes by vm::consideracoes
    var dataFotografia by vm::dataFotografia
    var dataLaudo by vm::dataLaudo
    var rooms by vm::rooms
    var tipoVistoria by vm::tipoVistoria
    var medidores by vm::medidores
    val medidoresEntrada = vm.medidoresEntrada
    var chaves by vm::chaves
    var signatures by vm::signatures
    val linkedId = vm.linkedId

    val updateRoom: (String, (RoomData) -> RoomData) -> Unit = { id, transform -> vm.updateRoom(id, transform) }
    fun addPhotoToRoom(roomId: String?, photo: PhotoData) = vm.addPhotoToRoom(roomId, photo)

    // Guard room index when rooms change
    LaunchedEffect(rooms.size) {
        if (currentRoomIdx >= rooms.size && rooms.isNotEmpty()) {
            currentRoomIdx = rooms.size - 1
        }
    }
    var showCamera by remember { mutableStateOf(false) }
    var cameraRoomId by remember { mutableStateOf<String?>(null) }
    var annotatingPhoto by remember { mutableStateOf<Pair<Int, Int>?>(null) }
    var showPdfViewer by remember { mutableStateOf(false) }
    var pdfContent by remember { mutableStateOf<String?>(null) }
    var pdfFileName by remember { mutableStateOf("Laudo_Vistoria.pdf") }
    var isUploading by remember { mutableStateOf(false) }
    var inspectingRoomId by remember { mutableStateOf<String?>(null) }
    var reviewRoomId by remember { mutableStateOf<String?>(null) }
    var writingConsiderations by remember { mutableStateOf(false) }
    var considerationsBeforeAi by remember { mutableStateOf<String?>(null) }
    var considerationHighlights by remember { mutableStateOf<List<String>>(emptyList()) }
    var estimatingRepairs by remember { mutableStateOf(false) }
    var customTemplateDraft by remember { mutableStateOf(PdfTemplateCatalog.loadCustomTemplate(context)) }
    LaunchedEffect(vm.pdfTemplate.id) {
        if (vm.pdfTemplate.id == "t9_custom") customTemplateDraft = vm.pdfTemplate
    }
    var showTemplatePickerDialog by remember { mutableStateOf(false) }
    var showCustomBuilderDialog by remember { mutableStateOf(false) }
    var finalizedPdf by remember { mutableStateOf(false) }
    var startupAssistantSelected by remember { mutableStateOf(true) }
    var startupBlankRooms by remember { mutableStateOf(false) }

    suspend fun rebuildWizardPdf(targetVistoria: Vistoria? = null) {
        val v = targetVistoria ?: vm.snapshot()
        val vid = if (v.id > 0L) v.id else savedId
        if (vid > 0L) PdfTemplateCatalog.saveForVistoria(context, vid, vm.pdfTemplate)
        PdfTemplateCatalog.saveDefaultTemplate(context, vm.pdfTemplate)
        val opts = com.imobweb.app.ui.settings.loadLaudoOptions(context, vid).copy(template = vm.pdfTemplate)
        pdfContent = withContext(Dispatchers.Default) { LaudoHtmlBuilder.build(v, opts) }
        pdfFileName = ReportPdfExporter.fileNameFor(v)
    }

    LaunchedEffect(vm.pdfTemplate, showPdfViewer) {
        if (showPdfViewer && pdfContent != null) {
            runCatching { rebuildWizardPdf() }
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        if (uris.isEmpty()) return@rememberLauncherForActivityResult
        // O cômodo e a tag do móvel são fixados no momento da escolha
        val room = rooms.getOrNull(currentRoomIdx)
        val roomId = room?.id
        val fTag = vm.activeFurnitureTag?.trim().orEmpty()
        val wmLabel = listOfNotNull(
            room?.name?.takeIf { it.isNotBlank() },
            fTag.takeIf { it.isNotBlank() }
        ).joinToString(" • ").takeIf { it.isNotBlank() }
        vm.activeFurnitureTag = null
        scope.launch {
            isUploading = true
            var failed = 0
            for (uri in uris) {
                val photo = PhotoStore.importUri(context, uri, label = wmLabel, furnitureTag = fTag)
                if (photo != null) addPhotoToRoom(roomId, photo) else failed++
            }
            isUploading = false
            if (failed > 0) Toast.makeText(context, "$failed foto(s) não puderam ser lidas", Toast.LENGTH_SHORT).show()
        }
    }

    val totalSteps = 6
    val canProceed = vm.canProceed

    suspend fun saveCurrent(): Long = vm.saveCurrent()

    /** Grava num escopo que sobrevive à saída da tela e então volta. */
    fun exit() {
        vm.saveDetached(app.appScope) { SyncWorker.syncNow(app) }
        onBack()
    }

    BackHandler(enabled = !showCamera && annotatingPhoto == null && !showPdfViewer && !showTemplatePickerDialog && !showCustomBuilderDialog) { exit() }
    BackHandler(enabled = showCamera) { showCamera = false; vm.activeFurnitureTag = null }
    BackHandler(enabled = annotatingPhoto != null) { annotatingPhoto = null }
    BackHandler(enabled = showPdfViewer) { showPdfViewer = false; onSaved() }

    // Grava quando o app vai para segundo plano (ligação, troca de app, encerramento pelo sistema)
    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_STOP) vm.saveDetached(app.appScope)
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(if (vistoriaId != null && vistoriaId > 0) "Editar Vistoria" else "Nova Vistoria", fontWeight = FontWeight.Bold)
                        Text("Vistoria de ${TipoVistoria.label(tipoVistoria).lowercase()}", style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { exit() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    if (vm.modeChosen) {
                        Text(
                            text = "${currentStep + 1}/$totalSteps",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.width(8.dp))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (!vm.modeChosen) {
                        Button(
                            onClick = {
                                PdfTemplateCatalog.saveDefaultTemplate(context, vm.pdfTemplate)
                                vm.chooseMode(assistant = startupAssistantSelected, blankRooms = startupBlankRooms)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Iniciar Vistoria")
                        }
                    } else {
                        if (currentStep > 0) {
                            OutlinedButton(
                                onClick = { currentStep-- },
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Voltar")
                            }
                        }

                        Button(
                            onClick = {
                                if (currentStep < totalSteps - 1) {
                                    scope.launch { saveCurrent() }
                                    currentStep++
                                } else {
                                    scope.launch {
                                        isSaving = true
                                        val id = runCatching { saveCurrent() }.getOrDefault(0L)
                                        SyncWorker.syncNow(context)
                                        val vistoria = if (id > 0) repository.getVistoriaById(id) else null
                                        if (vistoria != null) {
                                            runCatching {
                                                rebuildWizardPdf(vistoria)
                                                finalizedPdf = true
                                                showPdfViewer = true
                                            }.onFailure { e ->
                                                Toast.makeText(context, "Erro ao gerar laudo: ${e.message}", Toast.LENGTH_LONG).show()
                                            }
                                        } else {
                                            Toast.makeText(context, "Não foi possível salvar a vistoria", Toast.LENGTH_SHORT).show()
                                        }
                                        isSaving = false
                                    }
                                }
                            },
                            enabled = canProceed && !isSaving,
                            modifier = Modifier.weight(1f)
                        ) {
                            if (isSaving) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            } else {
                                Text(if (currentStep < totalSteps - 1) "Próximo" else "Finalizar")
                                if (currentStep < totalSteps - 1) {
                                    Spacer(Modifier.width(4.dp))
                                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            if (!vm.modeChosen) {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text(
                        "Configuração Inicial da Vistoria",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "Antes de começar, escolha o modo de operação e o modelo de PDF que deseja utilizar neste laudo.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Text("1. Modo de Vistoria", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

                    Card(
                        onClick = { startupAssistantSelected = true },
                        colors = CardDefaults.cardColors(
                            containerColor = if (startupAssistantSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                            else MaterialTheme.colorScheme.surface
                        ),
                        border = BorderStroke(
                            if (startupAssistantSelected) 2.dp else 1.dp,
                            if (startupAssistantSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                        )
                    ) {
                        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("🤖", fontSize = 24.sp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text("Com Assistente (Guiado)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(
                                    "Questionário inteligente de cômodos, roteiro sugerido na câmera, alertas de enquadramento/luz e análise por IA.",
                                    fontSize = 11.sp, lineHeight = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            if (startupAssistantSelected) Icon(Icons.Default.CheckCircle, null, tint = MaterialTheme.colorScheme.primary)
                        }
                    }

                    Card(
                        onClick = { startupAssistantSelected = false },
                        colors = CardDefaults.cardColors(
                            containerColor = if (!startupAssistantSelected) Color(0xFF059669).copy(alpha = 0.12f)
                            else MaterialTheme.colorScheme.surface
                        ),
                        border = BorderStroke(
                            if (!startupAssistantSelected) 2.dp else 1.dp,
                            if (!startupAssistantSelected) Color(0xFF059669) else MaterialTheme.colorScheme.outlineVariant
                        )
                    ) {
                        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("⚡", fontSize = 24.sp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text("Sem Assistente (Modo Livre / Mobiliado)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(
                                    "Adicione cômodos, móveis, eletros e utensílios 1 a 1 sem questionário, com disparo contínuo em rajada e fotos vinculadas a cada móvel.",
                                    fontSize = 11.sp, lineHeight = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            if (!startupAssistantSelected) Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF059669))
                        }
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { startupBlankRooms = !startupBlankRooms }
                            .padding(vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(checked = startupBlankRooms, onCheckedChange = { startupBlankRooms = it })
                        Text("Começar lista de cômodos em branco (adicionar 1 a 1 do zero)", fontSize = 12.sp)
                    }

                    HorizontalDivider()

                    // Seção 2: 8 Templates pré-definidos + Opção 9 Criar Template
                    PdfTemplatePickerSection(
                        selectedTemplate = vm.pdfTemplate,
                        customTemplate = customTemplateDraft,
                        onSelectPreset = { vm.pdfTemplate = it },
                        onOpenCustomBuilder = { showCustomBuilderDialog = true }
                    )
                }
            } else {
                // Resumo em tempo real + alternância rápida de modo & template
                val totalMoveis = rooms.sumOf { roomFurnitureCount(it) }
                val totalFotos = rooms.sumOf { it.photos.size }
                val totalAvarias = rooms.sumOf { it.damages.size + it.problems.size }
                LazyRow(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    item {
                        AssistChip(
                            onClick = { vm.useAssistant = !vm.useAssistant },
                            label = {
                                Text(
                                    if (vm.useAssistant) "🤖 Assistente" else "⚡ Modo Livre",
                                    fontSize = 11.sp, fontWeight = FontWeight.Bold
                                )
                            }
                        )
                    }
                    item {
                        AssistChip(
                            onClick = { showTemplatePickerDialog = true },
                            label = { Text("📄 PDF #${vm.pdfTemplate.number}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                        )
                    }
                    item {
                        Surface(shape = RoundedCornerShape(8.dp), color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)) {
                            Text("📊 ${rooms.size} cômodos • 🪑 $totalMoveis • 📷 $totalFotos • ⚠️ $totalAvarias",
                                fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp))
                        }
                    }
                }

                // Navegação livre entre as 6 etapas
                val stepLabels = listOf("1. Imóvel", "2. Partes", "3. Cômodos", "4. Inventário", "5. Fotos", "6. Revisão")
                LazyRow(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    itemsIndexed(stepLabels) { idx, label ->
                        val active = idx == currentStep
                        val done = idx < currentStep
                        FilterChip(
                            selected = active,
                            onClick = { currentStep = idx },
                            label = { Text(label, fontSize = 11.sp, fontWeight = if (active) FontWeight.Bold else FontWeight.Medium) },
                            leadingIcon = if (done) {
                                { Icon(Icons.Default.Check, null, modifier = Modifier.size(13.dp)) }
                            } else null
                        )
                    }
                }

            // Step content
            when (currentStep) {
                0 -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    TipoVistoriaSelector(
                        tipo = tipoVistoria,
                        onChange = { tipoVistoria = it },
                        isLinkedExit = linkedId != null
                    )
                    StepPropertyInfo(
                        condominio = condominio, onCondominioChange = { condominio = it },
                        endereco = endereco, onEnderecoChange = { endereco = it },
                        numero = numero, onNumeroChange = { numero = it },
                        conjApto = conjApto, onConjAptoChange = { conjApto = it },
                        cep = cep, onCepChange = { cep = it },
                        bairro = bairro, onBairroChange = { bairro = it },
                        cidade = cidade, onCidadeChange = { cidade = it },
                        estado = estado, onEstadoChange = { estado = it },
                        tipoImovel = tipoImovel, onTipoImovelChange = { tipoImovel = it },
                        finalidade = finalidade, onFinalidadeChange = { finalidade = it },
                        metragem = metragem, onMetragemChange = { metragem = it },
                        mobiliado = mobiliado, onMobiliadoChange = { mobiliado = it },
                        context = context
                    )
                    AndarCard(tipoImovel = tipoImovel, andar = vm.andar, onAndarChange = { vm.andar = it })
                }

                1 -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    StepParties(
                        locadorTipo = vm.locadorTipo, onLocadorTipoChange = { vm.locadorTipo = it },
                        locadora = locadora, onLocadoraChange = { locadora = it },
                        locadoraCpf = locadoraCpf, onLocadoraCpfChange = { locadoraCpf = it },
                        locatarioTipo = vm.locatarioTipo, onLocatarioTipoChange = { vm.locatarioTipo = it },
                        locatario = locatario, onLocatarioChange = { locatario = it },
                        locatarioCpf = locatarioCpf, onLocatarioCpfChange = { locatarioCpf = it },
                        vistoriadora = vistoriadora, onVistoriadoraChange = { vistoriadora = it },
                        solicitante = solicitante, onSolicitanteChange = { solicitante = it }
                    )
                    ContactsCard(
                        locadoraTelefone = vm.locadoraTelefone, onLocadoraTelefone = { vm.locadoraTelefone = it },
                        locatarioTelefone = vm.locatarioTelefone, onLocatarioTelefone = { vm.locatarioTelefone = it },
                        emailContestacao = vm.emailContestacao, onEmailContestacao = { vm.emailContestacao = it }
                    )
                    MetersKeysCard(
                        medidores = medidores,
                        medidoresEntrada = medidoresEntrada,
                        chaves = chaves,
                        onMedidoresChange = { medidores = it },
                        onChavesChange = { chaves = it }
                    )
                }

                2 -> StepRooms(
                    rooms = rooms,
                    onRoomsChange = { rooms = it },
                    currentRoomIdx = currentRoomIdx,
                    onCurrentRoomIdxChange = { currentRoomIdx = it },
                    tipoImovel = tipoImovel,
                    context = context,
                    useAssistant = vm.useAssistant,
                    onUseAssistantChange = { vm.useAssistant = it },
                    onDuplicateRoom = vm::duplicateRoom,
                    onMoveRoom = vm::moveRoom
                )

                3 -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    StepInventory(
                        rooms = rooms,
                        onRoomsChange = { rooms = it },
                        onUpdateRoom = updateRoom,
                        currentRoomIdx = currentRoomIdx,
                        onCurrentRoomIdxChange = { currentRoomIdx = it },
                        repository = repository,
                        tipoImovel = tipoImovel,
                        finalidade = finalidade,
                        context = context,
                        onTakePhoto = {
                            vm.activeFurnitureTag = null
                            cameraRoomId = rooms.getOrNull(currentRoomIdx)?.id
                            showCamera = true
                        },
                        onPickFromGallery = {
                            vm.activeFurnitureTag = null
                            galleryLauncher.launch("image/*")
                        },
                        isUploading = isUploading,
                        onAddOrUpdateDetail = vm::addOrUpdateFurnitureDetail,
                        onRemoveDetail = vm::removeFurnitureDetail,
                        onDuplicateDetail = vm::duplicateFurnitureDetail,
                        onTakePhotoForFurniture = { tag ->
                            vm.activeFurnitureTag = tag
                            cameraRoomId = rooms.getOrNull(currentRoomIdx)?.id
                            showCamera = true
                        },
                        onPickFromGalleryForFurniture = { tag ->
                            vm.activeFurnitureTag = tag
                            galleryLauncher.launch("image/*")
                        },
                        onOpenPhotoAnnotator = { photoIdx ->
                            annotatingPhoto = currentRoomIdx to photoIdx
                        }
                    )
                    rooms.getOrNull(currentRoomIdx)?.let { room ->
                        ProposalsCard(
                            room = room,
                            busy = inspectingRoomId == room.id,
                            onDetect = {
                                scope.launch {
                                    inspectingRoomId = room.id
                                    repository.inspectRoom(room, tipoImovel)
                                        .onSuccess { result ->
                                            var added = 0
                                            updateRoom(room.id) { cur ->
                                                val known = cur.proposals.map { it.id }.toSet()
                                                val fresh = result.proposals.filter { it.id !in known }
                                                added = fresh.size
                                                cur.copy(proposals = cur.proposals + fresh)
                                            }
                                            if (added == 0) Toast.makeText(context, "Nenhum item ou defeito novo encontrado", Toast.LENGTH_SHORT).show()
                                            else reviewRoomId = room.id
                                        }
                                        .onFailure { Toast.makeText(context, it.message ?: "Erro na detecção", Toast.LENGTH_LONG).show() }
                                    inspectingRoomId = null
                                }
                            },
                            onReview = { reviewRoomId = room.id }
                        )
                        RoomConditionCard(room = room, onChange = { updated -> updateRoom(updated.id) { updated } })
                    }
                }

                4 -> StepPhotos(
                    rooms = rooms,
                    onRoomsChange = { rooms = it },
                    currentRoomIdx = currentRoomIdx,
                    onCurrentRoomIdxChange = { currentRoomIdx = it },
                    repository = repository,
                    tipoImovel = tipoImovel,
                    finalidade = finalidade,
                    context = context,
                    onTakePhoto = {
                        vm.activeFurnitureTag = null
                        cameraRoomId = rooms.getOrNull(currentRoomIdx)?.id
                        showCamera = true
                    },
                    onPickFromGallery = {
                        vm.activeFurnitureTag = null
                        galleryLauncher.launch("image/*")
                    },
                    onAnnotatePhoto = { roomIdx, photoIdx ->
                        annotatingPhoto = roomIdx to photoIdx
                    },
                    onUpdateRoom = updateRoom,
                    isUploading = isUploading
                )

                5 -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    StepReview(
                        condominio = condominio, endereco = endereco, numero = numero,
                        conjApto = conjApto, cep = cep, bairro = bairro,
                        cidade = cidade, estado = estado, tipoImovel = tipoImovel,
                        finalidade = finalidade, metragem = metragem, mobiliado = mobiliado,
                        locadora = locadora, locatario = locatario,
                        vistoriadora = vistoriadora, solicitante = solicitante,
                        rooms = rooms, consideracoes = consideracoes,
                        onConsideracoesChange = { consideracoes = it },
                        locadoraCpf = locadoraCpf, locatarioCpf = locatarioCpf,
                        dataVistoria = dataFotografia,
                        onDataVistoriaChange = { dataFotografia = it },
                        dataLaudo = dataLaudo,
                        onDataLaudoChange = { dataLaudo = it },
                        emailContestacao = vm.emailContestacao,
                        onEmailContestacaoChange = { vm.emailContestacao = it },
                        onJumpToRoom = { idx ->
                            currentRoomIdx = idx
                            currentStep = 3
                        },
                        onFillMissingChecklists = { state ->
                            val defaultMap = Checklist.ITEMS.take(9).associateWith { state }
                            rooms.forEach { room ->
                                if (room.checklist.isEmpty()) {
                                    updateRoom(room.id) { it.copy(checklist = defaultMap) }
                                }
                            }
                            Toast.makeText(
                                context,
                                "Checklists pendentes preenchidos como ${Checklist.label(state)}!",
                                Toast.LENGTH_SHORT
                            ).show()
                        },
                        selectedTemplateName = "#${vm.pdfTemplate.number} — ${vm.pdfTemplate.name}",
                        onOpenTemplatePicker = { showTemplatePickerDialog = true },
                        onPreviewPdf = {
                            scope.launch {
                                runCatching {
                                    rebuildWizardPdf()
                                    finalizedPdf = false
                                    showPdfViewer = true
                                }.onFailure { e ->
                                    Toast.makeText(context, "Erro ao gerar prévia: ${e.message}", Toast.LENGTH_LONG).show()
                                }
                            }
                        }
                    )
                    AiConsiderationsCard(
                        busy = writingConsiderations,
                        canUndo = considerationsBeforeAi != null,
                        highlights = considerationHighlights,
                        onGenerate = {
                            scope.launch {
                                writingConsiderations = true
                                repository.generateConsiderations(vm.snapshot())
                                    .onSuccess { (text, highlights) ->
                                        considerationsBeforeAi = consideracoes
                                        consideracoes = text
                                        considerationHighlights = highlights
                                    }
                                    .onFailure { Toast.makeText(context, it.message ?: "Erro ao redigir", Toast.LENGTH_LONG).show() }
                                writingConsiderations = false
                            }
                        },
                        onUndo = {
                            considerationsBeforeAi?.let { consideracoes = it }
                            considerationsBeforeAi = null
                        },
                        onDictated = { consideracoes = appendDictation(consideracoes, it) }
                    )
                    RepairsCard(
                        reparos = vm.reparos,
                        rooms = rooms,
                        busy = estimatingRepairs,
                        onEstimate = {
                            scope.launch {
                                estimatingRepairs = true
                                repository.estimateRepairs(vm.snapshot())
                                    .onSuccess { list ->
                                        // mantém os itens lançados à mão; troca os da IA
                                        vm.reparos = vm.reparos.filter { it.origem == "manual" } + list
                                        if (list.isEmpty()) Toast.makeText(context, "A IA não conseguiu estimar", Toast.LENGTH_SHORT).show()
                                    }
                                    .onFailure { Toast.makeText(context, it.message ?: "Erro na estimativa", Toast.LENGTH_LONG).show() }
                                estimatingRepairs = false
                            }
                        },
                        onChange = { vm.reparos = it }
                    )
                    SignaturesCard(
                        signatures = signatures,
                        locadora = locadora, locatario = locatario, vistoriadora = vistoriadora,
                        onChange = { signatures = it }
                    )
                }
            }
            }
        }
    }

    if (showTemplatePickerDialog) {
        PdfTemplatePickerDialog(
            selectedTemplate = vm.pdfTemplate,
            customTemplate = customTemplateDraft,
            onSelectPreset = { vm.pdfTemplate = it },
            onOpenCustomBuilder = { showCustomBuilderDialog = true },
            onDismiss = { showTemplatePickerDialog = false }
        )
    }

    if (showCustomBuilderDialog) {
        CustomTemplateBuilderDialog(
            initialConfig = if (vm.pdfTemplate.id == "t9_custom") vm.pdfTemplate else customTemplateDraft,
            onDismiss = { showCustomBuilderDialog = false },
            onSave = { savedCfg ->
                PdfTemplateCatalog.saveCustomTemplate(context, savedCfg)
                customTemplateDraft = savedCfg
                vm.pdfTemplate = savedCfg
                showCustomBuilderDialog = false
                Toast.makeText(context, "Template personalizado #9 aplicado!", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // Revisão das sugestões da IA
    reviewRoomId?.let { rid ->
        val room = rooms.firstOrNull { it.id == rid }
        if (room == null || room.proposals.isEmpty()) {
            reviewRoomId = null
        } else {
            ProposalsReviewDialog(
                room = room,
                onDismiss = { reviewRoomId = null },
                onApply = { updated ->
                    updateRoom(rid) { cur ->
                        // aplica sobre o estado atual (fotos adicionadas durante a revisão continuam)
                        updated.copy(photos = cur.photos.map { p -> updated.photos.firstOrNull { it.id == p.id } ?: p })
                    }
                    reviewRoomId = null
                }
            )
        }
    }
    BackHandler(enabled = reviewRoomId != null) { reviewRoomId = null }

    // Câmera: fica aberta para várias fotos seguidas do mesmo cômodo
    if (showCamera) {
        val cameraRoom = rooms.firstOrNull { it.id == cameraRoomId }
        val shotList = remember(cameraRoomId) {
            val room = cameraRoom ?: return@remember emptyList<String>()
            val done = room.photos.map { it.name.lowercase() }.toSet()
            (room.problems.map { "Problema: $it" } + RoomPhotoTips.getTips(room.name))
                .distinct().filter { it.lowercase() !in done }
        }
        val furnitureList = remember(cameraRoomId, cameraRoom?.furniture, cameraRoom?.furnitureDetails) {
            cameraRoom?.let { (it.furnitureDetails.map { d -> d.name } + it.furniture).distinct() } ?: emptyList()
        }
        CameraScreen(
            onPhotoCaptured = { filePath, label, furnitureTag ->
                val roomId = cameraRoomId
                val roomName = rooms.firstOrNull { it.id == roomId }?.name.orEmpty()
                val fTag = furnitureTag?.trim().orEmpty()
                val wmLabel = listOfNotNull(
                    roomName.takeIf { it.isNotBlank() },
                    fTag.takeIf { it.isNotBlank() } ?: label?.takeIf { it.isNotBlank() }
                ).joinToString(" • ").takeIf { it.isNotBlank() }
                scope.launch {
                    val photo = PhotoStore.importFile(context, filePath, label = wmLabel, furnitureTag = fTag)
                    if (photo != null) {
                        val finalPhoto = if (fTag.isBlank() && !label.isNullOrBlank()) photo.copy(name = label) else photo
                        addPhotoToRoom(roomId, finalPhoto)
                    } else {
                        Toast.makeText(context, "Não foi possível salvar a foto", Toast.LENGTH_SHORT).show()
                    }
                }
            },
            onClose = { showCamera = false; vm.activeFurnitureTag = null },
            title = cameraRoom?.name?.ifBlank { null } ?: "Tirar Foto",
            photoCount = cameraRoom?.photos?.size ?: 0,
            shotList = shotList,
            initialFreeMode = !vm.useAssistant || vm.activeFurnitureTag != null,
            furnitureList = furnitureList,
            initialFurnitureTag = vm.activeFurnitureTag
        )
    }

    // Photo annotator
    annotatingPhoto?.let { (roomIdx, photoIdx) ->
        val room = rooms.getOrNull(roomIdx)
        val photo = room?.photos?.getOrNull(photoIdx)
        if (room != null && photo != null) {
            PhotoAnnotatorScreen(
                image = PhotoStore.model(photo),
                initialAnnotations = photo.annotations,
                onSave = { annotations ->
                    updateRoom(room.id) { r ->
                        r.copy(photos = r.photos.map { if (it === photo || it == photo) it.copy(annotations = annotations) else it })
                    }
                    annotatingPhoto = null
                },
                onClose = { annotatingPhoto = null }
            )
        } else {
            annotatingPhoto = null
        }
    }

    // PDF Viewer
    if (showPdfViewer && pdfContent != null) {
        PdfPreviewScreen(
            htmlContent = pdfContent!!,
            title = "Laudo de Vistoria - $condominio",
            fileName = pdfFileName,
            templateLabel = "#${vm.pdfTemplate.number} ${vm.pdfTemplate.name}",
            onChangeTemplate = { showTemplatePickerDialog = true },
            onClose = {
                val shouldFinish = finalizedPdf
                showPdfViewer = false
                if (shouldFinish) onSaved()
            }
        )
    }
}
