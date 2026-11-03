package com.imobweb.app.ui.camera

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.exifinterface.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.*
import java.util.concurrent.Executors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraScreen(
    /** Recebe o caminho do JPEG original (com EXIF). A câmera continua aberta para a próxima foto. */
    onPhotoCaptured: (String) -> Unit,
    onClose: () -> Unit,
    title: String = "Tirar Foto",
    photoCount: Int = 0
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()

    // Permissions state
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
        if (!granted) {
            Toast.makeText(context, "Permissão de câmera é necessária para tirar fotos", Toast.LENGTH_LONG).show()
        }
    }

    // Auto-request permission on first open
    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    // System camera fallback launcher
    var systemPhotoFile by remember { mutableStateOf<File?>(null) }
    val systemCameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        val file = systemPhotoFile
        if (success && file != null && file.exists() && file.length() > 0) {
            onPhotoCaptured(file.absolutePath)
        }
    }

    fun launchSystemCamera() {
        val photosDir = File(context.cacheDir, "photos")
        photosDir.mkdirs()
        val file = File(photosDir, "sys_${UUID.randomUUID()}.jpg")
        systemPhotoFile = file
        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        systemCameraLauncher.launch(uri)
    }

    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }
    var flashEnabled by remember { mutableStateOf(false) }
    var cameraFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var isCapturing by remember { mutableStateOf(false) }
    var cameraInitError by remember { mutableStateOf<String?>(null) }
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }

    // CameraX setup: triggers when previewView is ready AND has permission AND lens/flash change
    LaunchedEffect(cameraFacing, flashEnabled, previewView, hasCameraPermission) {
        val pv = previewView
        if (!hasCameraPermission || pv == null) return@LaunchedEffect

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build()
                val capture = ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                    .setFlashMode(if (flashEnabled) ImageCapture.FLASH_MODE_ON else ImageCapture.FLASH_MODE_OFF)
                    .build()

                val selector = CameraSelector.Builder()
                    .requireLensFacing(cameraFacing)
                    .build()

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(lifecycleOwner, selector, preview, capture)
                preview.setSurfaceProvider(pv.surfaceProvider)
                imageCapture = capture
                cameraInitError = null
            } catch (e: Exception) {
                cameraInitError = e.message ?: "Falha ao inicializar câmera interna"
            }
        }, ContextCompat.getMainExecutor(context))
    }

    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
            previewView = null
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(title, fontWeight = FontWeight.Bold)
                        if (photoCount > 0) {
                            Text("$photoCount foto(s) neste cômodo", fontSize = 12.sp, color = LocalContentColor.current.copy(alpha = 0.7f))
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    // Botão para alternar flash
                    IconButton(onClick = { flashEnabled = !flashEnabled }) {
                        Icon(
                            if (flashEnabled) Icons.Default.FlashOn else Icons.Default.FlashOff,
                            contentDescription = "Flash",
                            tint = if (flashEnabled) Color.Yellow else LocalContentColor.current
                        )
                    }
                    // Botão para virar câmera
                    IconButton(onClick = {
                        cameraFacing = if (cameraFacing == CameraSelector.LENS_FACING_BACK)
                            CameraSelector.LENS_FACING_FRONT else CameraSelector.LENS_FACING_BACK
                    }) {
                        Icon(Icons.Default.FlipCameraAndroid, contentDescription = "Virar Câmera")
                    }
                    // Botão câmera do sistema como alternativa
                    IconButton(onClick = { launchSystemCamera() }) {
                        Icon(Icons.Default.PhotoCamera, contentDescription = "Câmera Nativa")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color.Black)
        ) {
            if (!hasCameraPermission) {
                // Tela de permissão
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Default.CameraAlt,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = Color.White
                    )
                    Spacer(Modifier.height(16.dp))
                    Text(
                        "Permissão de Câmera Necessária",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "O ImobWeb precisa de acesso à câmera para fotografar os cômodos e itens vistoriados.",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Spacer(Modifier.height(24.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Conceder Permissão")
                    }
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = { launchSystemCamera() }) {
                        Text("Usar Câmera do Sistema", color = Color.White)
                    }
                }
            } else if (cameraInitError != null) {
                // Fallback se o hardware da câmera falhar no CameraX
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(56.dp), tint = Color(0xFFF59E0B))
                    Spacer(Modifier.height(16.dp))
                    Text("Não foi possível iniciar o preview", fontWeight = FontWeight.Bold, color = Color.White)
                    Spacer(Modifier.height(8.dp))
                    Text(cameraInitError ?: "", textAlign = TextAlign.Center, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                    Spacer(Modifier.height(20.dp))
                    Button(onClick = { launchSystemCamera() }) {
                        Icon(Icons.Default.PhotoCamera, null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Abrir Câmera do Sistema")
                    }
                }
            } else {
                // Viewfinder CameraX
                AndroidView(
                    factory = { ctx ->
                        PreviewView(ctx).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                            scaleType = PreviewView.ScaleType.FILL_CENTER
                            previewView = this
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // Shutter button & controls
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 36.dp)
                ) {
                    IconButton(
                        onClick = {
                            val capture = imageCapture
                            if (capture == null) {
                                // Se a captura CameraX ainda não estiver pronta, abre a câmera do sistema
                                launchSystemCamera()
                                return@IconButton
                            }

                            isCapturing = true
                            val photosDir = File(context.cacheDir, "photos")
                            photosDir.mkdirs()
                            val photoFile = File(photosDir, "cam_${UUID.randomUUID()}.jpg")

                            val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                            capture.takePicture(
                                outputOptions,
                                cameraExecutor,
                                object : ImageCapture.OnImageSavedCallback {
                                    override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                                        // Sem decodificar aqui: a rotação (EXIF) e a redução são feitas ao importar
                                        if (photoFile.exists() && photoFile.length() > 0) {
                                            scope.launch(Dispatchers.Main) {
                                                onPhotoCaptured(photoFile.absolutePath)
                                                isCapturing = false
                                            }
                                        } else {
                                            scope.launch(Dispatchers.Main) {
                                                isCapturing = false
                                                Toast.makeText(context, "Erro ao processar imagem capturada", Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }

                                    override fun onError(exception: ImageCaptureException) {
                                        scope.launch(Dispatchers.Main) {
                                            isCapturing = false
                                            Toast.makeText(context, "Erro: ${exception.message}", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                }
                            )
                        },
                        enabled = !isCapturing,
                        modifier = Modifier.size(80.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(4.dp, Color.White.copy(alpha = 0.4f), CircleShape)
                                .padding(6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isCapturing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(32.dp),
                                    strokeWidth = 3.dp,
                                    color = Color.Black
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .clip(CircleShape)
                                        .background(Color.White)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
