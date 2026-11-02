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
import androidx.activity.compose.rememberLauncherForActivityResult
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
import com.imobweb.app.util.ImageCompressor
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
    var pdfFileName by remember { mutableStateOf("Laudo_Vistoria.pdf") }
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
        0 -> {
            val isCondominio = tipoImovel.uppercase() in listOf("APARTAMENTO", "COBERTURA", "LOFT", "STUDIO/FLAT", "FLAT")
            if (isCondominio) {
                // Apartamento/Cobertura: requer condomínio OU endereço preenchido
                condominio.isNotBlank() || endereco.isNotBlank()
            } else {
                // Casa, Sala, Comercial, Galpão, etc.: condomínio NÃO é obrigatório; precisa de endereço (ou nome se houver)
                endereco.isNotBlank() || condominio.isNotBlank()
            }
        }
        1 -> locadora.isNotBlank() && locatario.isNotBlank()
        2 -> rooms.isNotEmpty()
        3 -> true
        else -> true
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

    // Auto-save every 30 seconds (after saveCurrent is declared)
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(30_000)
            if (savedId > 0 || condominio.isNotBlank() || locadora.isNotBlank()) {
                saveCurrent()
            }
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
                                    // Gera o laudo localmente (offline) e abre a pré-visualização
                                    val vistoria = repository.getVistoriaById(savedId)
                                    if (vistoria != null) {
                                        runCatching {
                                            pdfContent = LaudoHtmlBuilder.build(vistoria)
                                            pdfFileName = ReportPdfExporter.fileNameFor(vistoria)
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
                    onCurrentRoomIdxChange = { currentRoomIdx = it },
                    repository = repository,
                    tipoImovel = tipoImovel,
                    finalidade = finalidade,
                    context = context,
                    onTakePhoto = { showCamera = true },
                    onPickFromGallery = { galleryLauncher.launch("image/*") },
                    isUploading = isUploading
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
            fileName = pdfFileName,
            onClose = { showPdfViewer = false; onSaved() }
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
    var isLocatingGps by remember { mutableStateOf(false) }

    fun captureAddressFromLocation(location: Location) {
        scope.launch(Dispatchers.IO) {
            try {
                val geocoder = Geocoder(context, Locale("pt", "BR"))
                val addresses = try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        geocoder.getFromLocation(location.latitude, location.longitude, 1)
                    } else {
                        @Suppress("DEPRECATION")
                        geocoder.getFromLocation(location.latitude, location.longitude, 1)
                    }
                } catch (e: Exception) {
                    null
                }

                withContext(Dispatchers.Main) {
                    if (!addresses.isNullOrEmpty()) {
                        val addr = addresses[0]
                        val rua = addr.thoroughfare
                        val num = addr.subThoroughfare
                        val bairroStr = addr.subLocality ?: addr.subAdminArea
                        val cidadeStr = addr.locality ?: cidade
                        val ufStr = addr.adminArea?.let { if (it.length == 2) it else estado } ?: estado
                        val cepStr = addr.postalCode

                        if (!rua.isNullOrBlank()) onEnderecoChange(rua)
                        if (!num.isNullOrBlank()) onNumeroChange(num)
                        if (!bairroStr.isNullOrBlank()) onBairroChange(bairroStr)
                        if (!cidadeStr.isNullOrBlank()) onCidadeChange(cidadeStr)
                        if (!ufStr.isNullOrBlank()) onEstadoChange(ufStr)
                        if (!cepStr.isNullOrBlank()) onCepChange(com.imobweb.app.util.Formatters.formatCep(cepStr))

                        Toast.makeText(context, "Endereço preenchido via GPS!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "Localização capturada (${String.format(Locale.US, "%.5f, %.5f", location.latitude, location.longitude)}). Verifique a conexão para buscar o endereço.", Toast.LENGTH_LONG).show()
                    }
                    isLocatingGps = false
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Erro ao resolver endereço: ${e.message}", Toast.LENGTH_SHORT).show()
                    isLocatingGps = false
                }
            }
        }
    }

    fun startGpsCapture() {
        if (isLocatingGps) return
        isLocatingGps = true

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (locationManager == null) {
            Toast.makeText(context, "Serviço de localização indisponível no dispositivo", Toast.LENGTH_SHORT).show()
            isLocatingGps = false
            return
        }

        val hasGpsProvider = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
        val hasNetProvider = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

        if (!hasGpsProvider && !hasNetProvider) {
            Toast.makeText(context, "Por favor, ative a localização/GPS do seu aparelho nas configurações.", Toast.LENGTH_LONG).show()
            isLocatingGps = false
            return
        }

        scope.launch(Dispatchers.IO) {
            var bestLoc: Location? = null
            try {
                val finePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                val coarsePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                if (finePerm || coarsePerm) {
                    val providers = locationManager.getProviders(true)
                    for (prov in providers) {
                        val loc = locationManager.getLastKnownLocation(prov) ?: continue
                        if (bestLoc == null || loc.accuracy < bestLoc!!.accuracy) {
                            bestLoc = loc
                        }
                    }
                }
            } catch (se: SecurityException) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Permissão de localização negada pelo sistema", Toast.LENGTH_SHORT).show()
                    isLocatingGps = false
                }
                return@launch
            }

            // If we have a fairly recent location (< 5 min), use it immediately
            val fiveMinutesAgo = System.currentTimeMillis() - 5 * 60 * 1000
            if (bestLoc != null && bestLoc!!.time > fiveMinutesAgo) {
                captureAddressFromLocation(bestLoc!!)
                return@launch
            }

            // Otherwise, request a fresh location update with timeout
            val freshLocation = withTimeoutOrNull(9000L) {
                suspendCancellableCoroutine<Location?> { continuation ->
                    val listener = object : android.location.LocationListener {
                        override fun onLocationChanged(loc: Location) {
                            try { locationManager.removeUpdates(this) } catch (_: Exception) {}
                            if (continuation.isActive) continuation.resumeWith(Result.success(loc))
                        }
                        @Deprecated("Deprecated in Java")
                        override fun onStatusChanged(p0: String?, p1: Int, p2: android.os.Bundle?) {}
                        override fun onProviderEnabled(p0: String) {}
                        override fun onProviderDisabled(p0: String) {}
                    }

                    try {
                        val prov = when {
                            locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
                            locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
                            else -> LocationManager.PASSIVE_PROVIDER
                        }
                        locationManager.requestLocationUpdates(prov, 0L, 0f, listener, android.os.Looper.getMainLooper())
                        continuation.invokeOnCancellation {
                            try { locationManager.removeUpdates(listener) } catch (_: Exception) {}
                        }
                    } catch (e: Exception) {
                        if (continuation.isActive) continuation.resumeWith(Result.success(null))
                    }
                }
            }

            val finalLocation = freshLocation ?: bestLoc
            if (finalLocation != null) {
                captureAddressFromLocation(finalLocation)
            } else {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Não foi possível obter sinal de GPS. Tente novamente ou informe o CEP.", Toast.LENGTH_LONG).show()
                    isLocatingGps = false
                }
            }
        }
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            startGpsCapture()
        } else {
            Toast.makeText(context, "Permissão de localização é necessária para preencher o endereço via GPS.", Toast.LENGTH_LONG).show()
        }
    }

    fun requestGps() {
        val finePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarsePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

        if (finePerm || coarsePerm) {
            startGpsCapture()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    Column {
        Text("Dados do Imóvel", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Preencha as informações básicas do imóvel", style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(14.dp))

        // 1. Tipo do Imóvel no topo (adapta os campos dinamicamente)
        Text("O que é o imóvel? *", style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Constants.TIPO_IMOVEL_OPTIONS.forEach { option ->
                FilterChip(
                    selected = tipoImovel == option,
                    onClick = { onTipoImovelChange(option) },
                    label = { Text(option, fontSize = 12.sp) }
                )
            }
        }
        Spacer(Modifier.height(14.dp))

        // Address with GPS button
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Endereço & Localização", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.weight(1f))
                    AssistChip(
                        onClick = { requestGps() },
                        enabled = !isLocatingGps,
                        label = {
                            if (isLocatingGps) {
                                Text("Buscando...", fontSize = 12.sp)
                            } else {
                                Text("GPS", fontSize = 12.sp)
                            }
                        },
                        leadingIcon = {
                            if (isLocatingGps) {
                                CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        },
                        modifier = Modifier.height(32.dp)
                    )
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        val isCondominio = tipoImovel.uppercase() in listOf("APARTAMENTO", "COBERTURA", "LOFT", "STUDIO/FLAT", "FLAT")
        val isCasa = tipoImovel.uppercase() in listOf("CASA", "SOBRADO")
        val isComercial = tipoImovel.uppercase() in listOf("SALA", "COMERCIAL", "GALPÃO", "PRÉDIO")

        if (isCondominio) {
            OutlinedTextField(
                value = condominio,
                onValueChange = onCondominioChange,
                label = { Text("Nome do Condomínio / Edifício *") },
                placeholder = { Text("EX: EDIFÍCIO COLUMBUS TOWER") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(8.dp))
        } else if (isCasa) {
            OutlinedTextField(
                value = condominio,
                onValueChange = onCondominioChange,
                label = { Text("Condomínio Fechado / Residencial (Opcional)") },
                placeholder = { Text("EX: RESIDENCIAL JARDINS (se houver)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(8.dp))
        } else if (isComercial) {
            OutlinedTextField(
                value = condominio,
                onValueChange = onCondominioChange,
                label = { Text("Edifício / Centro Empresarial (Opcional)") },
                placeholder = { Text("EX: CORPORATE TOWER (se houver)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(Modifier.height(8.dp))
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = endereco,
                onValueChange = onEnderecoChange,
                label = { Text(if (!isCondominio) "Endereço / Rua *" else "Endereço") },
                placeholder = { Text("Rua/Avenida") },
                modifier = Modifier.weight(2f),
                singleLine = true
            )
            OutlinedTextField(
                value = numero,
                onValueChange = onNumeroChange,
                label = { Text("Nº") },
                placeholder = { Text("Número") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }
        Spacer(Modifier.height(8.dp))

        val compLabel = when {
            isCondominio -> "Apartamento / Bloco"
            isComercial -> "Sala / Conjunto"
            isCasa -> "Complemento / Casa nº (Opcional)"
            else -> "Complemento / Unidade"
        }
        val compPlaceholder = when {
            isCondominio -> "EX: APTO 182 / BLOCO B"
            isComercial -> "EX: SALA 402 / CONJ. 12"
            isCasa -> "EX: CASA 2 / FUNDOS (se houver)"
            else -> "EX: UNIDADE 1"
        }
        OutlinedTextField(
            value = conjApto,
            onValueChange = onConjAptoChange,
            label = { Text(compLabel) },
            placeholder = { Text(compPlaceholder) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
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

        Text("Finalidade", style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Constants.FINALIDADE_OPTIONS.forEach { option ->
                FilterChip(
                    selected = finalidade == option,
                    onClick = { onFinalidadeChange(option) },
                    label = { Text(option, fontSize = 12.sp) }
                )
            }
        }
        Spacer(Modifier.height(12.dp))

        Text("Mobiliado", style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Constants.MOBILIADO_OPTIONS.forEach { option ->
                FilterChip(
                    selected = mobiliado == option,
                    onClick = { onMobiliadoChange(option) },
                    label = { Text(option, fontSize = 12.sp) }
                )
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

        OutlinedTextField(
            value = locadora,
            onValueChange = onLocadoraChange,
            label = { Text("Nome da Locadora / Proprietário(a) *") },
            placeholder = { Text("Nome completo ou Razão Social") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = locadoraCpf,
            onValueChange = {
                onLocadoraCpfChange(com.imobweb.app.util.Formatters.maskCpfOrCnpj(it))
            },
            label = { Text("CPF / CNPJ da Locadora") },
            placeholder = { Text("000.000.000-00 ou 00.000.000/0000-00") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )
        Spacer(Modifier.height(12.dp))

        HorizontalDivider()
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = locatario,
            onValueChange = onLocatarioChange,
            label = { Text("Nome do(a) Locatário(a) / Inquilino(a) *") },
            placeholder = { Text("Nome completo ou Razão Social") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = locatarioCpf,
            onValueChange = {
                onLocatarioCpfChange(com.imobweb.app.util.Formatters.maskCpfOrCnpj(it))
            },
            label = { Text("CPF / CNPJ do(a) Locatário(a)") },
            placeholder = { Text("000.000.000-00 ou 00.000.000/0000-00") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )
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
private fun StepRooms(
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

// ===================== STEP 4: Inventory (per room) =====================
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun StepInventory(
    rooms: List<RoomData>, onRoomsChange: (List<RoomData>) -> Unit,
    currentRoomIdx: Int, onCurrentRoomIdxChange: (Int) -> Unit,
    repository: VistoriaRepository,
    tipoImovel: String,
    finalidade: String,
    context: Context,
    onTakePhoto: () -> Unit,
    onPickFromGallery: () -> Unit,
    isUploading: Boolean
) {
    val scope = rememberCoroutineScope()
    var showAllFurniture by remember { mutableStateOf(false) }

    // Dialog state for AI confirmation
    var pendingAiResult by remember { mutableStateOf<AiInspectionResult?>(null) }
    var selectedMoveis by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedAvarias by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedProblemas by remember { mutableStateOf<Set<String>>(emptySet()) }

    Column {
        Text("Inventário dos Cômodos", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text("Selecione o cômodo para registrar fotos, móveis e avarias",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(14.dp))

        if (rooms.isEmpty()) {
            Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                Text("Adicione cômodos primeiro na etapa anterior", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            return
        }

        // ================= ROOM SELECTOR AREA (ALL ROOMS VISIBLE & CLICKABLE) =================
        val completedCount = rooms.count { room ->
            room.analyzed || room.photos.isNotEmpty() || room.furniture.isNotEmpty() || room.damages.isNotEmpty() || room.problems.isNotEmpty()
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Cômodos da Vistoria (${rooms.size})",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (completedCount == rooms.size && rooms.isNotEmpty())
                            Color(0xFF064E3B)
                        else MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "$completedCount/${rooms.size} preenchidos",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (completedCount == rooms.size && rooms.isNotEmpty())
                                Color(0xFF34D399)
                            else MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(Modifier.height(10.dp))

                // FlowRow displaying ALL rooms clearly without truncation!
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    rooms.forEachIndexed { idx, room ->
                        val isSelected = idx == currentRoomIdx
                        val isComplete = room.analyzed || room.photos.isNotEmpty() || room.furniture.isNotEmpty() || room.damages.isNotEmpty() || room.problems.isNotEmpty()

                        Surface(
                            onClick = { onCurrentRoomIdxChange(idx) },
                            shape = RoundedCornerShape(8.dp),
                            color = when {
                                isComplete && isSelected -> Color(0xFF059669)
                                isComplete -> Color(0xFF064E3B)
                                isSelected -> MaterialTheme.colorScheme.primary
                                else -> MaterialTheme.colorScheme.surface
                            },
                            border = BorderStroke(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = when {
                                    isComplete && isSelected -> Color(0xFF6EE7B7)
                                    isComplete -> Color(0xFF10B981)
                                    isSelected -> MaterialTheme.colorScheme.primary
                                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                                }
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                if (isComplete) {
                                    Icon(
                                        Icons.Default.Check,
                                        contentDescription = "Concluído",
                                        modifier = Modifier.size(13.dp),
                                        tint = if (isSelected) Color.White else Color(0xFF34D399)
                                    )
                                }
                                Text(
                                    text = room.name.ifBlank { "Cômodo ${idx + 1}" },
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = when {
                                        isSelected -> Color.White
                                        isComplete -> Color(0xFF34D399)
                                        else -> MaterialTheme.colorScheme.onSurface
                                    }
                                )
                                val totalCount = room.photos.size + room.furniture.size + room.damages.size + room.problems.size
                                if (totalCount > 0) {
                                    Text(
                                        text = "($totalCount)",
                                        fontSize = 10.sp,
                                        color = if (isSelected) Color.White.copy(alpha = 0.85f) else if (isComplete) Color(0xFF34D399).copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        val currentRoom = rooms.getOrNull(currentRoomIdx)
        if (currentRoom != null) {

            // ================= SECTION: ROOM PHOTOS & AI VISION BUTTON =================
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.PhotoCamera,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                "Fotos de ${currentRoom.name} (${currentRoom.photos.size})",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Prominent AI Analysis button right next to the photos
                        Button(
                            onClick = {
                                if (currentRoom.photos.isEmpty()) {
                                    Toast.makeText(context, "Adicione ou tire fotos primeiro para a IA analisar!", Toast.LENGTH_SHORT).show()
                                    return@Button
                                }
                                scope.launch {
                                    val idx = currentRoomIdx
                                    val mutable = rooms.toMutableList()
                                    mutable[idx] = mutable[idx].copy(analyzing = true)
                                    onRoomsChange(mutable)

                                    val result = repository.analyzeRoomStructured(
                                        roomName = currentRoom.name,
                                        photos = currentRoom.photos.map { it.dataUrl },
                                        propertyType = tipoImovel,
                                        finality = finalidade
                                    )

                                    val doneMutable = rooms.toMutableList()
                                    doneMutable[idx] = doneMutable[idx].copy(analyzing = false)
                                    onRoomsChange(doneMutable)

                                    result.fold(
                                        onSuccess = { inspection ->
                                            pendingAiResult = inspection
                                            selectedMoveis = inspection.furniture.toSet()
                                            selectedAvarias = inspection.damages.toSet()
                                            selectedProblemas = inspection.problems.toSet()
                                        },
                                        onFailure = { err ->
                                            Toast.makeText(context, "Erro na análise: ${err.message}", Toast.LENGTH_LONG).show()
                                        }
                                    )
                                }
                            },
                            enabled = !currentRoom.analyzing && !isUploading,
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentRoom.photos.isNotEmpty()) Color(0xFF6366F1) else MaterialTheme.colorScheme.surfaceVariant,
                                contentColor = Color.White
                            )
                        ) {
                            if (currentRoom.analyzing) {
                                CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp, color = Color.White)
                                Spacer(Modifier.width(6.dp))
                                Text("Analisando...", fontSize = 11.sp)
                            } else {
                                Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Analisar com IA", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Buttons to Take Photo or Pick From Gallery
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onTakePhoto,
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Tirar Foto", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = onPickFromGallery,
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 8.dp),
                            enabled = !isUploading
                        ) {
                            if (isUploading) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.PhotoLibrary, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Adicionar Fotos", fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Thumbnails list
                    if (currentRoom.photos.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(64.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "Nenhuma foto neste cômodo ainda.\nTire fotos para a IA identificar móveis e avarias.",
                                textAlign = TextAlign.Center,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        LazyRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            itemsIndexed(currentRoom.photos) { pIdx, photo ->
                                Box(
                                    modifier = Modifier
                                        .size(72.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
                                ) {
                                    AsyncImage(
                                        model = photo.filePath?.let { File(it) } ?: photo.dataUrl,
                                        contentDescription = "Foto ${pIdx + 1}",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )

                                    // Remove photo button
                                    Box(
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .padding(3.dp)
                                            .size(20.dp)
                                            .clip(CircleShape)
                                            .background(Color.Black.copy(alpha = 0.7f))
                                            .clickable {
                                                val newPhotos = currentRoom.photos.toMutableList()
                                                newPhotos.removeAt(pIdx)
                                                val updated = rooms.toMutableList()
                                                updated[currentRoomIdx] = currentRoom.copy(photos = newPhotos)
                                                onRoomsChange(updated)
                                            },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Default.Close,
                                            contentDescription = "Remover foto",
                                            tint = Color.White,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }

                                    // Photo index pill
                                    Surface(
                                        modifier = Modifier
                                            .align(Alignment.BottomStart)
                                            .padding(3.dp),
                                        shape = RoundedCornerShape(4.dp),
                                        color = Color.Black.copy(alpha = 0.65f)
                                    ) {
                                        Text(
                                            "#${pIdx + 1}",
                                            color = Color.White,
                                            fontSize = 9.sp,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(14.dp))

            // ================= INVENTORY TABS (MÓVEIS / AVARIAS / PROBLEMAS) =================
            var tab by remember { mutableIntStateOf(0) }
            val tabs = listOf("Móveis (${currentRoom.furniture.size})", "Avarias (${currentRoom.damages.size})", "Problemas (${currentRoom.problems.size})")

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                tabs.forEachIndexed { i, label ->
                    FilterChip(
                        selected = tab == i,
                        onClick = { tab = i },
                        label = { Text(label, fontSize = 11.sp, fontWeight = if (tab == i) FontWeight.Bold else FontWeight.Normal) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(Modifier.height(10.dp))

            var newItem by remember { mutableStateOf("") }

            when (tab) {
                0 -> {
                    // Relevance-filtered furniture for this room
                    val relevantList = remember(currentRoom.name) {
                        RoomFurnitureCatalog.getRelevantFurniture(currentRoom.name)
                    }
                    val displayedList = if (showAllFurniture) (relevantList + FurnitureItems.items).distinct() else relevantList

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Móveis relevantes para ${currentRoom.name}",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        TextButton(
                            onClick = { showAllFurniture = !showAllFurniture },
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp)
                        ) {
                            Text(
                                text = if (showAllFurniture) "Menos" else "+ Todos os 25",
                                fontSize = 11.sp
                            )
                        }
                    }
                    Spacer(Modifier.height(6.dp))

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        displayedList.forEach { furniture ->
                            val isSelected = furniture in currentRoom.furniture
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.furniture.toMutableList()
                                    if (isSelected) list.remove(furniture) else list.add(furniture)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        furniture = list) { onRoomsChange(it) }
                                },
                                label = { Text(furniture, fontSize = 10.sp, maxLines = 1) },
                                leadingIcon = {
                                    if (isSelected) Icon(Icons.Default.Check, null,
                                        modifier = Modifier.size(14.dp),
                                        tint = MaterialTheme.colorScheme.secondary)
                                },
                                border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.secondary) else null,
                                modifier = Modifier.height(30.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Outro móvel ou item...", fontSize = 12.sp) },
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
                        "Pintura descascando", "Trinca superficial", "Mancha no teto"
                    )
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        quickDamages.forEach { dmg ->
                            val isSelected = dmg in currentRoom.damages
                            AssistChip(
                                onClick = {
                                    val list = currentRoom.damages.toMutableList()
                                    if (isSelected) list.remove(dmg) else list.add(dmg)
                                    updateRoomInventory(rooms, currentRoomIdx,
                                        damages = list) { onRoomsChange(it) }
                                },
                                label = { Text(dmg, fontSize = 10.sp) },
                                leadingIcon = {
                                    if (isSelected) Icon(Icons.Default.Check, null,
                                        modifier = Modifier.size(14.dp),
                                        tint = Color(0xFFF59E0B))
                                },
                                border = if (isSelected) BorderStroke(1.5.dp, Color(0xFFF59E0B)) else null,
                                modifier = Modifier.height(30.dp)
                            )
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    currentRoom.damages.forEach { dmg ->
                        Row(
                            modifier = Modifier.padding(vertical = 3.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Warning, null, modifier = Modifier.size(16.dp),
                                tint = Color(0xFFF59E0B))
                            Spacer(Modifier.width(6.dp))
                            Text(dmg, style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f))
                            IconButton(
                                onClick = {
                                    val list = currentRoom.damages.toMutableList()
                                    list.remove(dmg)
                                    updateRoomInventory(rooms, currentRoomIdx, damages = list) { onRoomsChange(it) }
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.Close, null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = newItem,
                            onValueChange = { newItem = it },
                            placeholder = { Text("Descrever outra avaria...", fontSize = 12.sp) },
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
                    Text("Problemas e defeitos funcionais",
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
                                    border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.error) else null,
                                    modifier = Modifier.height(28.dp)
                                )
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                }
            }

            // Summary of items in current room
            Spacer(Modifier.height(10.dp))
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.photos.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("Fotos", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.furniture.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                        Text("Móveis", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.damages.size}", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                        Text("Avarias", style = MaterialTheme.typography.labelSmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text("${currentRoom.problems.size}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                        Text("Problemas", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }

    // ================= INTERACTIVE AI CONFIRMATION DIALOG =================
    val aiResult = pendingAiResult
    if (aiResult != null && currentRoomIdx in rooms.indices) {
        val activeRoom = rooms[currentRoomIdx]
        AlertDialog(
            onDismissRequest = { pendingAiResult = null },
            icon = {
                Icon(
                    Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(28.dp)
                )
            },
            title = {
                Text(
                    text = "Itens Identificados pela IA",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        "A IA analisou as fotos de \"${activeRoom.name}\". Selecione quais itens deseja adicionar ao cômodo:",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(12.dp))

                    // 1. Móveis
                    if (aiResult.furniture.isNotEmpty()) {
                        Text(
                            "🛋️ Móveis e Mobília (${aiResult.furniture.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.furniture.forEach { item ->
                            val isChecked = item in selectedMoveis
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedMoveis = if (isChecked) selectedMoveis - item else selectedMoveis + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedMoveis = if (chk) selectedMoveis + item else selectedMoveis - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    // 2. Avarias
                    if (aiResult.damages.isNotEmpty()) {
                        Text(
                            "⚠️ Avarias e Danos Visíveis (${aiResult.damages.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF59E0B)
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.damages.forEach { item ->
                            val isChecked = item in selectedAvarias
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedAvarias = if (isChecked) selectedAvarias - item else selectedAvarias + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedAvarias = if (chk) selectedAvarias + item else selectedAvarias - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    // 3. Problemas
                    if (aiResult.problems.isNotEmpty()) {
                        Text(
                            "🛠️ Problemas / Defeitos (${aiResult.problems.size})",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(Modifier.height(4.dp))
                        aiResult.problems.forEach { item ->
                            val isChecked = item in selectedProblemas
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedProblemas = if (isChecked) selectedProblemas - item else selectedProblemas + item
                                    }
                                    .padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { chk ->
                                        selectedProblemas = if (chk) selectedProblemas + item else selectedProblemas - item
                                    }
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(item, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }

                    if (aiResult.furniture.isEmpty() && aiResult.damages.isEmpty() && aiResult.problems.isEmpty()) {
                        Text(
                            "Nenhum item em particular detectado nas fotos. O cômodo foi marcado como analisado.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val current = rooms[currentRoomIdx]
                        val newFurniture = (current.furniture + selectedMoveis).distinct()
                        val newDamages = (current.damages + selectedAvarias).distinct()
                        val newProblems = (current.problems + selectedProblemas).distinct()
                        val newItems = (current.items + aiResult.observations).distinct()

                        val updated = rooms.toMutableList()
                        updated[currentRoomIdx] = current.copy(
                            furniture = newFurniture,
                            damages = newDamages,
                            problems = newProblems,
                            items = newItems,
                            analyzed = true
                        )
                        onRoomsChange(updated)
                        pendingAiResult = null
                        val count = selectedMoveis.size + selectedAvarias.size + selectedProblemas.size
                        Toast.makeText(context, "$count itens adicionados ao cômodo!", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Adicionar Selecionados", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { pendingAiResult = null }) {
                    Text("Cancelar")
                }
            }
        )
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
    val context = LocalContext.current

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


