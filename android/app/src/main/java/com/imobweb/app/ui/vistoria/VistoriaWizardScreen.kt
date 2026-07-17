package com.imobweb.app.ui.vistoria

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.LocationManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import com.imobweb.app.ui.camera.CameraScreen
import com.imobweb.app.util.ImageCompressor
import kotlinx.coroutines.launch
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
    var currentStep by remember { mutableIntStateOf(0) }
    var isSaving by remember { mutableStateOf(false) }
    var savedId by remember { mutableLongStateOf(vistoriaId ?: 0L) }

    // Vistoria data state
    var condominio by remember { mutableStateOf("") }
    var endereco by remember { mutableStateOf("") }
    var numero by remember { mutableStateOf("") }
    var conjApto by remember { mutableStateOf("") }
    var cep by remember { mutableStateOf("") }
    var bairro by remember { mutableStateOf("") }
    var cidade by remember { mutableStateOf("São Paulo") }
    var estado by remember { mutableStateOf("SP") }
    var tipoImovel by remember { mutableStateOf("APARTAMENTO") }
    var finalidade by remember { mutableStateOf("RESIDENCIAL") }
    var metragem by remember { mutableStateOf("") }
    var mobiliado by remember { mutableStateOf("NÃO") }
    var locadora by remember { mutableStateOf("") }
    var locadoraCpf by remember { mutableStateOf("") }
    var locatario by remember { mutableStateOf("") }
    var locatarioCpf by remember { mutableStateOf("") }
    var vistoriadora by remember { mutableStateOf("") }
    var solicitante by remember { mutableStateOf("") }
    var consideracoes by remember { mutableStateOf("") }
    var rooms by remember { mutableStateOf<List<RoomData>>(emptyList()) }
    var currentRoomIdx by remember { mutableIntStateOf(0) }

    // Guard room index when rooms change
    LaunchedEffect(rooms.size) {
        if (currentRoomIdx >= rooms.size && rooms.isNotEmpty()) {
            currentRoomIdx = rooms.size - 1
        }
    }
    var generatingPdf by remember { mutableStateOf(false) }
    var pdfHtml by remember { mutableStateOf<String?>(null) }
    var showPdfPreview by remember { mutableStateOf(false) }
    var showCamera by remember { mutableStateOf(false) }
    var annotatingPhoto by remember { mutableStateOf<Triple<Int, Int, String>?>(null) }
    var galleryUris by remember { mutableStateOf<List<Uri>>(emptyList()) }
    var showPdfViewer by remember { mutableStateOf(false) }
    var pdfContent by remember { mutableStateOf<String?>(null) }
    var isUploading by remember { mutableStateOf(false) }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        galleryUris = uris
        scope.launch {
            isUploading = true
            for (uri in uris) {
                val compressed = ImageCompressor.compress(context, uri)
                if (compressed != null) {
                    val photo = PhotoData(
                        dataUrl = compressed.base64,
                        name = "photo_${System.currentTimeMillis()}.jpg",
                        filePath = compressed.filePath
                    )
                    if (currentRoomIdx in rooms.indices) {
                        val mutable = rooms.toMutableList()
                        val room = mutable[currentRoomIdx]
                        mutable[currentRoomIdx] = room.copy(photos = room.photos + photo)
                        rooms = mutable
                    }
                }
            }
            isUploading = false
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            scope.launch {
                val filePath = ImageCompressor.saveBitmapToCache(context, bitmap,
                    "camera_${System.currentTimeMillis()}.jpg")
                val base64 = ImageCompressor.compress(context,
                    Uri.fromFile(File(filePath ?: "")), 1200)?.base64 ?: ""
                val photo = PhotoData(
                    dataUrl = base64,
                    name = "camera_${System.currentTimeMillis()}.jpg",
                    filePath = filePath
                )
                if (currentRoomIdx in rooms.indices) {
                    val mutable = rooms.toMutableList()
                    val room = mutable[currentRoomIdx]
                    mutable[currentRoomIdx] = room.copy(photos = room.photos + photo)
                    rooms = mutable
                }
            }
        }
    }

    // Load existing vistoria
    LaunchedEffect(vistoriaId) {
        if (vistoriaId != null && vistoriaId > 0) {
            repository.getVistoriaById(vistoriaId)?.let { v ->
                condominio = v.condominio; endereco = v.endereco; numero = v.numero
                conjApto = v.conjApto; cep = v.cep; bairro = v.bairro
                cidade = v.cidade; estado = v.estado; tipoImovel = v.tipoImovel
                finalidade = v.finalidade; metragem = v.metragem; mobiliado = v.mobiliado
                locadora = v.locadora; locadoraCpf = v.locadoraCpf
                locatario = v.locatario; locatarioCpf = v.locatarioCpf
                vistoriadora = v.vistoriadora; solicitante = v.solicitante
                consideracoes = v.consideracoes; rooms = v.rooms
            }
        }
    }

    val totalSteps = 6
    val canProceed = when (currentStep) {
        0 -> condominio.isNotBlank()
        1 -> locadora.isNotBlank() && locatario.isNotBlank()
        2 -> rooms.isNotEmpty()
        3 -> true
        else -> true
    }

    // Auto-save every 30 seconds
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(30_000)
            if (savedId > 0 || condominio.isNotBlank() || locadora.isNotBlank()) {
                saveCurrent()
            }
        }
    }

    // Save current state to DB
    suspend fun saveCurrent() {
        val today = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).format(Date())
        val vistoria = Vistoria(
            id = if (savedId > 0) savedId else 0,
            condominio = condominio, endereco = endereco, numero = numero,
            conjApto = conjApto, cep = cep, bairro = bairro,
            cidade = cidade, estado = estado, tipoImovel = tipoImovel,
            finalidade = finalidade, metragem = metragem, mobiliado = mobiliado,
            locadora = locadora, locadoraCpf = locadoraCpf,
            locatario = locatario, locatarioCpf = locatarioCpf,
            vistoriadora = vistoriadora, dataFotografia = today,
            dataLaudo = today, solicitante = solicitante,
            consideracoes = consideracoes, rooms = rooms,
            status = "pending_sync"
        )
        if (savedId > 0) {
            repository.updateVistoria(vistoria.copy(id = savedId))
        } else {
            savedId = repository.saveVistoria(vistoria)
        }
        // Trigger immediate sync if online
        if (com.imobweb.app.util.NetworkUtil.isOnline(context)) {
            repository.syncPendingVistorias()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nova Vistoria", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        scope.launch { saveCurrent() }
                        onBack()
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    Text(
                        text = "${currentStep + 1}/$totalSteps",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.width(8.dp))
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
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
                                    saveCurrent()
                                    // Generate PDF
                                    val vistoria = repository.getVistoriaById(savedId)
                                    if (vistoria != null) {
                                        val result = repository.generatePdf(vistoria)
                                        result.fold(
                                            onSuccess = { html ->
                                                pdfContent = html
                                                showPdfViewer = true
                                            },
                                            onFailure = { e ->
                                                Toast.makeText(context, "Erro: ${e.message}", Toast.LENGTH_SHORT).show()
                                            }
                                        )
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
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Step indicator
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                for (i in 0 until totalSteps) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .clip(MaterialTheme.shapes.small)
                            .background(
                                when {
                                    i < currentStep -> MaterialTheme.colorScheme.primary
                                    i == currentStep -> MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                    )
                }
            }

            // Step content
            when (currentStep) {
                0 -> StepPropertyInfo(
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

                1 -> StepParties(
                    locadora = locadora, onLocadoraChange = { locadora = it },
                    locadoraCpf = locadoraCpf, onLocadoraCpfChange = { locadoraCpf = it },
                    locatario = locatario, onLocatarioChange = { locatario = it },
                    locatarioCpf = locatarioCpf, onLocatarioCpfChange = { locatarioCpf = it },
                    vistoriadora = vistoriadora, onVistoriadoraChange = { vistoriadora = it },
                    solicitante = solicitante, onSolicitanteChange = { solicitante = it }
                )

                2 -> StepRooms(
                    rooms = rooms,
                    onRoomsChange = { rooms = it },
                    currentRoomIdx = currentRoomIdx,
                    onCurrentRoomIdxChange = { currentRoomIdx = it },
                    tipoImovel = tipoImovel,
                    context = context
                )

                3 -> StepInventory(
                    rooms = rooms,
                    onRoomsChange = { rooms = it },
                    currentRoomIdx = currentRoomIdx,
                    onCurrentRoomIdxChange = { currentRoomIdx = it }
                )

                4 -> StepPhotos(
                    rooms = rooms,
                    onRoomsChange = { rooms = it },
                    currentRoomIdx = currentRoomIdx,
                    onCurrentRoomIdxChange = { currentRoomIdx = it },
                    repository = repository,
                    tipoImovel = tipoImovel,
                    finalidade = finalidade,
                    context = context,
                    onTakePhoto = { showCamera = true },
                    onPickFromGallery = { galleryLauncher.launch("image/*") },
                    onAnnotatePhoto = { roomIdx, photoIdx, dataUrl ->
                        annotatingPhoto = Triple(roomIdx, photoIdx, dataUrl)
                    },
                    isUploading = isUploading
                )

                5 -> StepReview(
                    condominio = condominio, endereco = endereco, numero = numero,
                    conjApto = conjApto, cep = cep, bairro = bairro,
                    cidade = cidade, estado = estado, tipoImovel = tipoImovel,
                    finalidade = finalidade, metragem = metragem, mobiliado = mobiliado,
                    locadora = locadora, locatario = locatario,
                    vistoriadora = vistoriadora, solicitante = solicitante,
                    rooms = rooms, consideracoes = consideracoes,
                    onConsideracoesChange = { consideracoes = it }
                )
            }
        }
    }

    // Camera screen
    if (showCamera) {
        CameraScreen(
            onPhotoCaptured = { bitmap, filePath ->
                scope.launch {
                    val base64 = ImageCompressor.base64FromFile(filePath) ?: ""
                    val photo = PhotoData(
                        dataUrl = base64,
                        name = "camera_${System.currentTimeMillis()}.jpg",
                        filePath = filePath
                    )
                    if (currentRoomIdx in rooms.indices) {
                        val mutable = rooms.toMutableList()
                        val room = mutable[currentRoomIdx]
                        mutable[currentRoomIdx] = room.copy(photos = room.photos + photo)
                        rooms = mutable
                    }
                    showCamera = false
                }
            },
            onClose = { showCamera = false }
        )
    }

    // Photo annotator
    annotatingPhoto?.let { (roomIdx, photoIdx, dataUrl) ->
        val room = rooms.getOrNull(roomIdx)
        val photo = room?.photos?.getOrNull(photoIdx)
        if (photo != null) {
            PhotoAnnotatorScreen(
                imageDataUrl = dataUrl,
                initialAnnotations = photo.annotations,
                onSave = { annotations ->
                    val mutable = rooms.toMutableList()
                    val r = mutable[roomIdx]
                    val newPhotos = r.photos.toMutableList()
                    newPhotos[photoIdx] = photo.copy(annotations = annotations)
                    mutable[roomIdx] = r.copy(photos = newPhotos)
                    rooms = mutable
                    annotatingPhoto = null
                },
                onClose = { annotatingPhoto = null }
            )
        }
    }

    // PDF Viewer
    if (showPdfViewer && pdfContent != null) {
        PdfPreviewScreen(
            htmlContent = pdfContent!!,
            title = "Laudo de Vistoria - $condominio",
            onClose = { showPdfViewer = false; onSaved() },
            onShare = { }
        )
    }
}

// ===================== STEP 1: Property Info =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepPropertyInfo(
    condominio: String, onCondominioChange: (String) -> Unit,
    endereco: String, onEnderecoChange: (String) -> Unit,
    numero: String, onNumeroChange: (String) -> Unit,
    conjApto: String, onConjAptoChange: (String) -> Unit,
    cep: String, onCepChange: (String) -> Unit,
    bairro: String, onBairroChange: (String) -> Unit,
    cidade: String, onCidadeChange: (String) -> Unit,
    estado: String, onEstadoChange: (String) -> Unit,
    tipoImovel: String, onTipoImovelChange: (String) -> Unit,
    finalidade: String, onFinalidadeChange: (String) -> Unit,
    metragem: String, onMetragemChange: (String) -> Unit,
    mobiliado: String, onMobiliadoChange: (String) -> Unit,
    context: Context
) {
    val scope = rememberCoroutineScope()
    var isLookingUpCep by remember { mutableStateOf(false) }

    Column {
        Text("Dados do Imóvel", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Preencha as informações básicas do imóvel", style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        // Address with GPS button
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Endereço", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.weight(1f))
                    AssistChip(
                        onClick = {
                            val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                            try {
                                val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                                    ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                                if (location != null) {
                                    val geocoder = Geocoder(context, Locale("pt", "BR"))
                                    val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                                    if (addresses != null && addresses.isNotEmpty()) {
                                        val addr = addresses[0]
                                        onEnderecoChange(addr.thoroughfare ?: "")
                                        onNumeroChange(addr.subThoroughfare ?: "")
                                        onBairroChange(addr.subLocality ?: addr.subAdminArea ?: "")
                                        onCidadeChange(addr.locality ?: cidade)
                                        onEstadoChange(addr.adminArea?.take(2) ?: estado)
                                        onCepChange(addr.postalCode ?: "")
                                        Toast.makeText(context, "Endereço capturado!", Toast.LENGTH_SHORT).show()
                                    }
                                } else {
                                    Toast.makeText(context, "GPS sem localização recente. Abra o GPS e tente novamente.", Toast.LENGTH_LONG).show()
                                }
                            } catch (e: Exception) {
                                Toast.makeText(context, "Erro ao capturar endereço: ${e.message}", Toast.LENGTH_SHORT).show()
                            }
                        },
                        label = { Text("GPS", fontSize = 12.sp) },
                        leadingIcon = { Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        modifier = Modifier.height(32.dp)
                    )
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        if (tipoImovel in Constants.CONDOMINIO_TYPES) {
            OutlinedTextField(value = condominio, onValueChange = onCondominioChange,
                label = { Text("Nome do Condomínio *") }, placeholder = { Text("EX: EDIFÍCIO COLUMBUS TOWER") },
                modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = endereco, onValueChange = onEnderecoChange,
                label = { Text("Endereço") }, placeholder = { Text("Rua/Avenida") },
                modifier = Modifier.weight(2f), singleLine = true)
            OutlinedTextField(value = numero, onValueChange = onNumeroChange,
                label = { Text("Nº") }, placeholder = { Text("Número") },
                modifier = Modifier.weight(1f), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
        }
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(value = conjApto, onValueChange = onConjAptoChange,
            label = { Text("Conjunto / Apartamento") }, placeholder = { Text("EX: conj. 103 / APTO 182") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = cep, onValueChange = { v ->
                val formatted = com.imobweb.app.util.Formatters.formatCep(v)
                onCepChange(formatted)
                // Auto-fill when CEP has 8 digits
                if (formatted.filter { it.isDigit() }.length == 8) {
                    scope.launch {
                        isLookingUpCep = true
                        com.imobweb.app.util.CepService.lookup(v).fold(
                            onSuccess = { result ->
                                onEnderecoChange(result.logradouro)
                                onBairroChange(result.bairro)
                                onCidadeChange(result.localidade)
                                onEstadoChange(result.uf)
                            },
                            onFailure = {
                                Toast.makeText(context, "CEP não encontrado", Toast.LENGTH_SHORT).show()
                            }
                        )
                        isLookingUpCep = false
                    }
                }
            },
                label = { Text("CEP") }, placeholder = { Text("05640-003") },
                modifier = Modifier.weight(1f), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                trailingIcon = {
                    if (isLookingUpCep) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                    } else if (cep.filter { it.isDigit() }.length == 8) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null,
                            tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(18.dp))
                    } else {
                        Icon(Icons.Default.Search, contentDescription = "Buscar CEP",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                    }
                })
            OutlinedTextField(value = bairro, onValueChange = onBairroChange,
                label = { Text("Bairro") }, placeholder = { Text("Bairro") },
                modifier = Modifier.weight(1f), singleLine = true)
        }
        Spacer(Modifier.height(8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = cidade, onValueChange = onCidadeChange,
                label = { Text("Cidade") }, modifier = Modifier.weight(2f), singleLine = true)
            OutlinedTextField(value = estado, onValueChange = onEstadoChange,
                label = { Text("UF") }, modifier = Modifier.weight(1f), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text))
        }
        Spacer(Modifier.height(12.dp))

        // Selects
        Text("Tipo do Imóvel", style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Constants.TIPO_IMOVEL_OPTIONS.forEach { option ->
                FilterChip(
                    selected = tipoImovel == option,
                    onClick = { onTipoImovelChange(option) },
                    label = { Text(option, fontSize = 11.sp) }
                )
            }
        }
        Spacer(Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Finalidade", style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Constants.FINALIDADE_OPTIONS.forEach { option ->
                        FilterChip(
                            selected = finalidade == option,
                            onClick = { onFinalidadeChange(option) },
                            label = { Text(option, fontSize = 11.sp) }
                        )
                    }
                }
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Mobiliado", style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Constants.MOBILIADO_OPTIONS.forEach { option ->
                        FilterChip(
                            selected = mobiliado == option,
                            onClick = { onMobiliadoChange(option) },
                            label = { Text(option, fontSize = 10.sp) }
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(value = metragem, onValueChange = onMetragemChange,
            label = { Text("Metragem") }, placeholder = { Text("EX: 87m²") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)
    }
}

// ===================== STEP 2: Parties =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepParties(
    locadora: String, onLocadoraChange: (String) -> Unit,
    locadoraCpf: String, onLocadoraCpfChange: (String) -> Unit,
    locatario: String, onLocatarioChange: (String) -> Unit,
    locatarioCpf: String, onLocatarioCpfChange: (String) -> Unit,
    vistoriadora: String, onVistoriadoraChange: (String) -> Unit,
    solicitante: String, onSolicitanteChange: (String) -> Unit
) {
    Column {
        Text("Partes Envolvidas", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Dados do locador, locatário e vistoriadora", style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        OutlinedTextField(value = locadora, onValueChange = onLocadoraChange,
            label = { Text("Nome da Locadora *") }, placeholder = { Text("Nome completo") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(value = locadoraCpf, onValueChange = onLocadoraCpfChange,
            label = { Text("CPF da Locadora") }, placeholder = { Text("000.000.000-00") },
            modifier = Modifier.fillMaxWidth(), singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
        Spacer(Modifier.height(12.dp))

        HorizontalDivider()
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(value = locatario, onValueChange = onLocatarioChange,
            label = { Text("Nome do(a) Locatário(a) *") }, placeholder = { Text("Nome completo") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(value = locatarioCpf, onValueChange = onLocatarioCpfChange,
            label = { Text("CPF do(a) Locatário(a)") }, placeholder = { Text("000.000.000-00") },
            modifier = Modifier.fillMaxWidth(), singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
        Spacer(Modifier.height(12.dp))

        HorizontalDivider()
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(value = vistoriadora, onValueChange = onVistoriadoraChange,
            label = { Text("Vistoriadora") }, placeholder = { Text("Nome da vistoriadora") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(value = solicitante, onValueChange = onSolicitanteChange,
            label = { Text("Solicitante") }, placeholder = { Text("EX: ARTIMOB NEGÓCIOS IMOBILIÁRIOS") },
            modifier = Modifier.fillMaxWidth(), singleLine = true)

        Spacer(Modifier.height(16.dp))
        Card(
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            )
        ) {
            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
                Icon(Icons.Default.Info, contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Preencha corretamente os dados pois serão utilizados no laudo de vistoria",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// ===================== STEP 3: Rooms =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepRooms(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit,
    tipoImovel: String,
    context: Context
) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Cômodos", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Adicione os cômodos que serão vistoriados",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Spacer(Modifier.height(12.dp))

        if (rooms.isEmpty()) {
            // Show room template selection
            Text("Escolha um modelo de cômodos:",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))

            val templateScope = rememberScrollState()
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(templateScope),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                RoomTemplates.templates.forEach { template ->
                    Card(
                        modifier = Modifier
                            .width(140.dp)
                            .clickable {
                                val newRooms = template.rooms.map { name ->
                                    RoomData(
                                        id = java.util.UUID.randomUUID().toString(),
                                        name = name
                                    )
                                }
                                onRoomsChange(newRooms)
                            },
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                when (template.name) {
                                    "Apartamento" -> Icons.Default.Apartment
                                    "Casa" -> Icons.Default.House
                                    "Sala Comercial" -> Icons.Default.Store
                                    "Cobertura" -> Icons.Default.Villa
                                    "Studio/Flat" -> Icons.Default.OtherHouses
                                    else -> Icons.Default.Add
                                },
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(Modifier.height(6.dp))
                            Text(template.name,
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1)
                            Text("${template.rooms.size} cômodos",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (template.rooms.isNotEmpty()) {
                                Text(template.rooms.take(3).joinToString(", "),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                    maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            HorizontalDivider()
            Spacer(Modifier.height(8.dp))

            Text("Ou adicione manualmente:",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))

            Button(
                onClick = {
                    onRoomsChange(listOf(RoomData(id = java.util.UUID.randomUUID().toString(), name = "")))
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text("Adicionar Cômodo")
            }
        } else {
            rooms.forEachIndexed { idx, room ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    border = if (idx == currentRoomIdx) BorderStroke(1.dp, MaterialTheme.colorScheme.primary) else null
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(36.dp),
                            shape = MaterialTheme.shapes.medium,
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("${idx + 1}",
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary)
                            }
                        }
                        Spacer(Modifier.width(12.dp))
                        OutlinedTextField(
                            value = room.name,
                            onValueChange = { newName ->
                                onRoomsChange(rooms.toMutableList().apply {
                                    this[idx] = room.copy(name = newName)
                                })
                            },
                            placeholder = { Text("Ex: SALA, COZINHA, QUARTO") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(onClick = {
                            val mutable = rooms.toMutableList()
                            mutable.removeAt(idx)
                            onRoomsChange(mutable)
                            if (currentRoomIdx >= mutable.size && mutable.isNotEmpty()) {
                                onCurrentRoomIdxChange(mutable.size - 1)
                            }
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Remover",
                                tint = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))
        Card(
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
            )
        ) {
            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.TipsAndUpdates, contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Cômodos comuns: Entrada, Sala, Cozinha, Área de Serviço, Banheiro, Quarto, Suíte, Varanda, Escritório, Garagem",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// ===================== STEP 4: Inventory (per room) =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepInventory(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit
) {
    Column {
        Text("Inventário dos Cômodos", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Registre móveis, avarias e problemas de cada cômodo",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        if (rooms.isEmpty()) {
            Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                Text("Adicione cômodos primeiro", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            return
        }

        // Room tabs
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            rooms.forEachIndexed { idx, room ->
                FilterChip(
                    selected = idx == currentRoomIdx,
                    onClick = { onCurrentRoomIdxChange(idx) },
                    label = { Text(room.name.ifBlank { "Cômodo ${idx + 1}" }, fontSize = 11.sp, maxLines = 1) },
                    trailingIcon = {
                        val count = room.furniture.size + room.damages.size + room.problems.size
                        if (count > 0) Text("$count", fontSize = 9.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        val currentRoom = rooms.getOrNull(currentRoomIdx)
        if (currentRoom != null) {
            var tab by remember { mutableIntStateOf(0) }
            val tabs = listOf("Móveis", "Avarias", "Problemas")

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                tabs.forEachIndexed { i, label ->
                    FilterChip(
                        selected = tab == i,
                        onClick = { tab = i },
                        label = { Text(label, fontSize = 11.sp) }
                    )
                }
            }
            Spacer(Modifier.height(8.dp))

            var newItem by remember { mutableStateOf("") }

            when (tab) {
                0 -> {
                    Text("Móveis presentes neste cômodo",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        FurnitureItems.items.forEach { furniture ->
                            val isSelected = furniture in currentRoom.furniture
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.furniture.toMutableList()
                                    if (isSelected) list.remove(furniture) else list.add(furniture)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        furniture = list) { onRoomsChange(it) }
                                },
                                label = { Text(furniture, fontSize = 9.sp, maxLines = 1) },
                                leadingIcon = {
                                    if (isSelected) Icon(Icons.Default.Check, null,
                                        modifier = Modifier.size(14.dp),
                                        tint = MaterialTheme.colorScheme.secondary)
                                },
                                modifier = Modifier.height(28.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Adicionar móvel...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = MaterialTheme.typography.bodySmall
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(onClick = {
                            if (newItem.isNotBlank()) {
                                val list = currentRoom.furniture + newItem.trim()
                                updateRoomInventory(rooms, currentRoomIdx,
                                    furniture = list) { onRoomsChange(it) }
                                newItem = ""
                            }
                        }) { Icon(Icons.Default.Add, contentDescription = "Adicionar") }
                    }
                }

                1 -> {
                    Text("Avarias visíveis neste cômodo",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))

                    val quickDamages = listOf(
                        "Desgaste no piso", "Arranhão na parede", "Porta arranhada",
                        "Pintura descascando", "Trinca superficial"
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        quickDamages.forEach { dmg ->
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.damages.toMutableList()
                                    if (dmg in list) list.remove(dmg) else list.add(dmg)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        damages = list) { onRoomsChange(it) }
                                },
                                label = { Text(dmg, fontSize = 9.sp) },
                                modifier = Modifier.height(28.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    currentRoom.damages.forEach { dmg ->
                        Row(modifier = Modifier.padding(vertical = 2.dp)) {
                            Icon(Icons.Default.Warning, null, modifier = Modifier.size(16.dp),
                                tint = Color(0xFFF59E0B))
                            Spacer(Modifier.width(6.dp))
                            Text(dmg, style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Descrever avaria...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f), singleLine = true,
                            textStyle = MaterialTheme.typography.bodySmall
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(onClick = {
                            if (newItem.isNotBlank()) {
                                val list = currentRoom.damages + newItem.trim()
                                updateRoomInventory(rooms, currentRoomIdx,
                                    damages = list) { onRoomsChange(it) }
                                newItem = ""
                            }
                        }) { Icon(Icons.Default.Add, null) }
                    }
                }

                2 -> {
                    Text("Problemas identificados",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))

                    ProblemsCatalog.categories.forEach { category ->
                        Text(category.name,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(4.dp))

                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            category.problems.forEach { problem ->
                                val isSelected = problem in currentRoom.problems
                                AssistChip(
                                    onClick = {
                                        val list = currentRoom.problems.toMutableList()
                                        if (isSelected) list.remove(problem) else list.add(problem)
                                        updateRoomInventory(rooms, currentRoomIdx,
                                            problems = list) { onRoomsChange(it) }
                                    },
                                    label = { Text(problem, fontSize = 9.sp) },
                                    leadingIcon = {
                                        if (isSelected) Icon(Icons.Default.Check, null,
                                            modifier = Modifier.size(14.dp),
                                            tint = MaterialTheme.colorScheme.error)
                                    },
                                    modifier = Modifier.height(28.dp)
                                )
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                }
            }

            // Summary of items in current room
            val totalItems = currentRoom.furniture.size + currentRoom.damages.size + currentRoom.problems.size
            Spacer(Modifier.height(8.dp))
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                )
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.furniture.size}", fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary)
                        Text("Móveis", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.damages.size}", fontWeight = FontWeight.Bold,
                            color = Color(0xFFF59E0B))
                        Text("Avarias", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.problems.size}", fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error)
                        Text("Problemas", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

private fun updateRoomInventory(
    rooms: List<RoomData>, idx: Int,
    furniture: List<String>? = null,
    damages: List<String>? = null,
    problems: List<String>? = null,
    onResult: (List<RoomData>) -> Unit
) {
    val mutable = rooms.toMutableList()
    mutable[idx] = mutable[idx].copy(
        furniture = furniture ?: mutable[idx].furniture,
        damages = damages ?: mutable[idx].damages,
        problems = problems ?: mutable[idx].problems
    )
    onResult(mutable)
}

// FlowRow is available from compose.foundation.layout (stable since Compose 1.4)

// ===================== STEP 5: Photos =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepPhotos(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit,
    repository: VistoriaRepository,
    tipoImovel: String, finalidade: String,
    context: Context,
    onTakePhoto: () -> Unit = {},
    onPickFromGallery: () -> Unit = {},
    onAnnotatePhoto: (roomIdx: Int, photoIdx: Int, dataUrl: String) -> Unit = { _, _, _ -> },
    isUploading: Boolean = false
) {
    val scope = rememberCoroutineScope()

    Column {
        Text("Fotos e Anotações", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Adicione fotos de cada cômodo e marque problemas",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        // Room tabs
        if (rooms.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rooms.forEachIndexed { idx, room ->
                    FilterChip(
                        selected = idx == currentRoomIdx,
                        onClick = { onCurrentRoomIdxChange(idx) },
                        label = {
                            Text(
                                text = room.name.ifBlank { "Cômodo ${idx + 1}" },
                                fontSize = 11.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        },
                        leadingIcon = {
                            if (room.analyzed) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = MaterialTheme.colorScheme.secondary)
                            }
                        },
                        trailingIcon = {
                            val photoCount = room.photos.size
                            if (photoCount > 0) {
                                Text("$photoCount", fontSize = 9.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            val currentRoom = rooms.getOrNull(currentRoomIdx)
            if (currentRoom != null) {
                // Photo tips
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Dicas de fotos para ${currentRoom.name.ifBlank { "este cômodo" }}",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            RoomPhotoTips.getTips(currentRoom.name).forEach { tip ->
                                Surface(
                                    shape = MaterialTheme.shapes.small,
                                    color = MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Text(tip, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Action buttons row
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = onTakePhoto,
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(8.dp),
                        enabled = !isUploading
                    ) {
                        Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Tirar Foto", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = onPickFromGallery,
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(8.dp),
                        enabled = !isUploading
                    ) {
                        if (isUploading) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.PhotoLibrary, contentDescription = null, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Galeria", fontSize = 12.sp)
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                // AI Analysis button
                if (currentRoom.photos.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            scope.launch {
                                val idx = currentRoomIdx
                                onRoomsChange(rooms.toMutableList().apply {
                                    this[idx] = this[idx].copy(analyzing = true)
                                })
                                val result = repository.analyzeRoom(
                                    roomName = currentRoom.name.ifBlank { "Cômodo ${idx + 1}" },
                                    photos = currentRoom.photos.map { it.dataUrl },
                                    propertyType = tipoImovel,
                                    finality = finalidade
                                )
                                result.fold(
                                    onSuccess = { response ->
                                        val roomName = currentRoom.name.ifBlank { "Cômodo ${idx + 1}" }
                                        val items = response.results?.get(roomName) ?: emptyList()
                                        onRoomsChange(rooms.toMutableList().apply {
                                            this[idx] = this[idx].copy(
                                                items = items,
                                                analyzing = false,
                                                analyzed = true
                                            )
                                        })
                                        Toast.makeText(context, "Análise concluída!", Toast.LENGTH_SHORT).show()
                                    },
                                    onFailure = { e ->
                                        onRoomsChange(rooms.toMutableList().apply {
                                            this[idx] = this[idx].copy(analyzing = false)
                                        })
                                        Toast.makeText(context, "Erro: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }
                        },
                        enabled = !currentRoom.analyzing,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (currentRoom.analyzing) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                        } else {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                        }
                        Text(if (currentRoom.analyzing) "Analisando..." else "Analisar com IA")
                    }
                    Spacer(Modifier.height(12.dp))
                }

                // Photos grid
                if (currentRoom.photos.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null,
                                modifier = Modifier.size(40.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                            Text("Nenhuma foto ainda",
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                } else {
                    val photoList = currentRoom.photos
                    Column {
                        var globalIdx = 0
                        photoList.chunked(3).forEach { row ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                row.forEachIndexed { rowIdx, photo ->
                                    val photoIdx = globalIdx++
                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .clickable {
                                                onAnnotatePhoto(currentRoomIdx, photoIdx, photo.dataUrl)
                                            },
                                        border = if (photo.annotations.isNotEmpty())
                                            BorderStroke(2.dp, MaterialTheme.colorScheme.error)
                                        else null
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize()) {
                                            AsyncImage(
                                                model = photo.dataUrl,
                                                contentDescription = null,
                                                modifier = Modifier.fillMaxSize(),
                                                contentScale = ContentScale.Crop
                                            )
                                            if (photo.annotations.isNotEmpty()) {
                                                Surface(
                                                    modifier = Modifier
                                                        .align(Alignment.TopStart)
                                                        .padding(4.dp),
                                                    shape = MaterialTheme.shapes.small,
                                                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f)
                                                ) {
                                                    Text(
                                                        "${photo.annotations.size} pts",
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                                                        style = MaterialTheme.typography.labelSmall,
                                                        color = MaterialTheme.colorScheme.onError
                                                    )
                                                }
                                            }
                                            Row(
                                                modifier = Modifier
                                                    .align(Alignment.BottomStart)
                                                    .padding(4.dp),
                                                horizontalArrangement = Arrangement.spacedBy(2.dp)
                                            ) {
                                                repeat(minOf(photo.annotations.size, 3)) { i ->
                                                    Box(
                                                        modifier = Modifier
                                                            .size(6.dp)
                                                            .clip(CircleShape)
                                                            .background(Color(0xFFEF4444))
                                                    )
                                                }
                                            }
                                            IconButton(
                                                onClick = {
                                                    val mutable = rooms.toMutableList()
                                                    val r = mutable[currentRoomIdx]
                                                    val newPhotos = r.photos.toMutableList()
                                                    newPhotos.removeAt(photoIdx)
                                                    mutable[currentRoomIdx] = r.copy(photos = newPhotos)
                                                    onRoomsChange(mutable)
                                                },
                                                modifier = Modifier.align(Alignment.TopEnd)
                                            ) {
                                                Icon(Icons.Default.Close, contentDescription = "Remover",
                                                    tint = Color.White.copy(alpha = 0.8f),
                                                    modifier = Modifier.size(18.dp))
                                            }
                                        }
                                    }
                                }
                                repeat(3 - row.size) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Items detected
                if (currentRoom.items.isNotEmpty()) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Itens detectados (${currentRoom.items.size})",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.secondary)
                            Spacer(Modifier.height(4.dp))
                            currentRoom.items.take(8).forEach { item ->
                                Text("• $item",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            if (currentRoom.items.size > 8) {
                                Text("+${currentRoom.items.size - 8} mais...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
                            }
                        }
                    }
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                Text("Adicione cômodos primeiro",
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// ===================== STEP 5: Review =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StepReview(
    condominio: String, endereco: String, numero: String,
    conjApto: String, cep: String, bairro: String,
    cidade: String, estado: String, tipoImovel: String,
    finalidade: String, metragem: String, mobiliado: String,
    locadora: String, locatario: String,
    vistoriadora: String, solicitante: String,
    rooms: List<RoomData>,
    consideracoes: String, onConsideracoesChange: (String) -> Unit
) {
    val today = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).format(Date())

    Column {
        Text("Revisão e Observações", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Revise os dados, adicione observações e finalize",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

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
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
            )
        ) {
            Row(modifier = Modifier.padding(12.dp)) {
                Icon(Icons.Default.DateRange, contentDescription = null,
                    tint = MaterialTheme.colorScheme.tertiary, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Column {
                    Text("Data da vistoria: $today",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold)
                    Text("Ao finalizar, o laudo será gerado e salvo no dispositivo.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
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
private fun InfoRow(label: String, value: String) {
    if (value.isNotBlank()) {
        Row(modifier = Modifier.padding(vertical = 2.dp)) {
            Text("$label: ", style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodySmall)
        }
    }
}


