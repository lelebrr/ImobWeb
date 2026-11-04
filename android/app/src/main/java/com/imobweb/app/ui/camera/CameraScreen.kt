package com.imobweb.app.ui.camera

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.imobweb.app.util.PhotoQuality
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.sqrt

/**
 * Câmera assistida (como a do sistema web):
 *  - avisos ao vivo de pouca luz, luz estourada, movimento ("segure firme") e inclinação;
 *  - roteiro de fotos do cômodo ("Agora: …"), avançando a cada foto;
 *  - disparo automático opcional quando o aparelho fica firme e bem iluminado;
 *  - revisão automática de cada foto (escura / estourada / tremida) com "Refazer" ou "Usar";
 *  - grade, foco por toque, lanterna e tela sempre acesa.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraScreen(
    /** Caminho do JPEG original e o item do roteiro fotografado (se houver). A câmera continua aberta. */
    onPhotoCaptured: (String, String?) -> Unit,
    onClose: () -> Unit,
    title: String = "Tirar Foto",
    photoCount: Int = 0,
    shotList: List<String> = emptyList()
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("camera_prefs", Context.MODE_PRIVATE) }

    var hasCameraPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        hasCameraPermission = granted
        if (!granted) Toast.makeText(context, "Permissão de câmera é necessária para tirar fotos", Toast.LENGTH_LONG).show()
    }
    LaunchedEffect(Unit) { if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA) }

    // Tela sempre acesa enquanto a câmera estiver aberta
    DisposableEffect(Unit) {
        val window = (context as? android.app.Activity)?.window
        window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose { window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
    }

    // ---------------- roteiro
    var shotIdx by remember { mutableIntStateOf(0) }
    val currentShot = shotList.getOrNull(shotIdx)

    // ---------------- preferências
    var showGrid by remember { mutableStateOf(prefs.getBoolean("grid", true)) }
    var autoShoot by remember { mutableStateOf(prefs.getBoolean("auto", false)) }
    var torch by remember { mutableStateOf(false) }

    // ---------------- sensores (movimento e inclinação)
    var motion by remember { mutableFloatStateOf(0f) }
    var tilt by remember { mutableFloatStateOf(0f) }
    DisposableEffect(Unit) {
        val sm = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val gyro = sm.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        val accel = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        var lastAccel = 0f
        val listener = object : SensorEventListener {
            override fun onSensorChanged(e: SensorEvent) {
                when (e.sensor.type) {
                    Sensor.TYPE_GYROSCOPE -> {
                        val m = sqrt(e.values[0] * e.values[0] + e.values[1] * e.values[1] + e.values[2] * e.values[2])
                        motion = motion * 0.7f + m * 0.3f // suavizado
                    }
                    Sensor.TYPE_ACCELEROMETER -> {
                        // inclinação lateral em graus (0 = nivelado, retrato)
                        tilt = Math.toDegrees(atan2(e.values[0].toDouble(), e.values[1].toDouble())).toFloat()
                        if (gyro == null) {
                            val mag = sqrt(e.values[0] * e.values[0] + e.values[1] * e.values[1] + e.values[2] * e.values[2])
                            motion = motion * 0.7f + abs(mag - lastAccel) * 0.3f
                            lastAccel = mag
                        }
                    }
                }
            }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        gyro?.let { sm.registerListener(listener, it, SensorManager.SENSOR_DELAY_UI) }
        accel?.let { sm.registerListener(listener, it, SensorManager.SENSOR_DELAY_UI) }
        onDispose { sm.unregisterListener(listener) }
    }

    // ---------------- luz (análise do preview)
    var brightness by remember { mutableFloatStateOf(128f) }

    // ---------------- câmera
    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }
    var camera by remember { mutableStateOf<Camera?>(null) }
    var cameraFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var isCapturing by remember { mutableStateOf(false) }
    var cameraInitError by remember { mutableStateOf<String?>(null) }
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
    var review by remember { mutableStateOf<Triple<File, PhotoQuality.Result, String?>?>(null) }
    var focusPoint by remember { mutableStateOf<Offset?>(null) }

    LaunchedEffect(cameraFacing, previewView, hasCameraPermission) {
        val pv = previewView
        if (!hasCameraPermission || pv == null) return@LaunchedEffect
        val future = ProcessCameraProvider.getInstance(context)
        future.addListener({
            try {
                val provider = future.get()
                val preview = Preview.Builder().build()
                val capture = ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                    .build()
                var lastAnalysis = 0L
                val analysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                    .also {
                        it.setAnalyzer(cameraExecutor) { image ->
                            val now = System.currentTimeMillis()
                            if (now - lastAnalysis > 250) {
                                lastAnalysis = now
                                runCatching {
                                    val plane = image.planes[0]
                                    val buf = plane.buffer
                                    val bytes = ByteArray(buf.remaining()).also { b -> buf.get(b) }
                                    val luma = PhotoQuality.meanLuma(bytes, image.width, image.height, plane.rowStride, 16)
                                    brightness = luma.toFloat()
                                }
                            }
                            image.close()
                        }
                    }
                val selector = CameraSelector.Builder().requireLensFacing(cameraFacing).build()
                provider.unbindAll()
                camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, capture, analysis)
                preview.setSurfaceProvider(pv.surfaceProvider)
                imageCapture = capture
                cameraInitError = null
            } catch (e: Exception) {
                cameraInitError = e.message ?: "Falha ao inicializar câmera interna"
            }
        }, ContextCompat.getMainExecutor(context))
    }

    LaunchedEffect(torch, camera) {
        camera?.takeIf { it.cameraInfo.hasFlashUnit() }?.cameraControl?.enableTorch(torch)
    }

    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
            previewView = null
        }
    }

    // ---------------- avisos ao vivo
    val dark = brightness < PhotoQuality.DARK
    val bright = brightness > PhotoQuality.BRIGHT
    val shaking = motion > 0.35f
    val tilted = abs(tilt) in 6f..84f && abs(abs(tilt) - 90f) > 6f
    val liveTip = when {
        dark -> "Pouca luz — acenda a luz ou ligue a lanterna"
        bright -> "Luz estourada — evite apontar para a janela"
        shaking -> "Segure firme"
        tilted -> "Endireite o aparelho"
        else -> null
    }
    val ready = !dark && !bright && !shaking && !tilted

    fun advance() { if (shotList.isNotEmpty()) shotIdx = (shotIdx + 1).coerceAtMost(shotList.size) }

    /** Revisa a foto: se tiver problema, pergunta; senão entrega e avança no roteiro. */
    fun handleCaptured(file: File) {
        val label = currentShot
        scope.launch {
            val q = withContext(Dispatchers.Default) { PhotoQuality.analyze(file) }
            if (q != null && !q.ok) {
                review = Triple(file, q, label)
            } else {
                onPhotoCaptured(file.absolutePath, label)
                advance()
            }
        }
    }

    // Câmera do sistema (alternativa)
    var systemPhotoFile by remember { mutableStateOf<File?>(null) }
    val systemCameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { success ->
        val file = systemPhotoFile
        if (success && file != null && file.exists() && file.length() > 0) handleCaptured(file)
    }
    fun launchSystemCamera() {
        val dir = File(context.cacheDir, "photos").apply { mkdirs() }
        val file = File(dir, "sys_${UUID.randomUUID()}.jpg")
        systemPhotoFile = file
        val uri: Uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        systemCameraLauncher.launch(uri)
    }

    fun shoot() {
        val capture = imageCapture ?: run { launchSystemCamera(); return }
        if (isCapturing || review != null) return
        isCapturing = true
        val dir = File(context.cacheDir, "photos").apply { mkdirs() }
        val file = File(dir, "cam_${UUID.randomUUID()}.jpg")
        capture.takePicture(
            ImageCapture.OutputFileOptions.Builder(file).build(),
            cameraExecutor,
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    scope.launch(Dispatchers.Main) {
                        isCapturing = false
                        if (file.exists() && file.length() > 0) handleCaptured(file)
                        else Toast.makeText(context, "Erro ao processar imagem capturada", Toast.LENGTH_SHORT).show()
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
    }

    // ---------------- disparo automático: ~1,6 s firme e bem iluminado
    var autoProgress by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(autoShoot, ready, isCapturing, review) {
        autoProgress = 0f
        if (!autoShoot || !ready || isCapturing || review != null || imageCapture == null) return@LaunchedEffect
        val steps = 16
        for (i in 1..steps) {
            delay(100)
            autoProgress = i / steps.toFloat()
        }
        shoot()
        delay(900) // pausa para reposicionar antes da próxima
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        if (photoCount > 0) {
                            Text("$photoCount foto(s) neste cômodo", fontSize = 12.sp, color = LocalContentColor.current.copy(alpha = 0.7f))
                        }
                    }
                },
                navigationIcon = { IconButton(onClick = onClose) { Icon(Icons.Default.ArrowBack, contentDescription = "Voltar") } },
                actions = {
                    IconButton(onClick = { showGrid = !showGrid; prefs.edit().putBoolean("grid", showGrid).apply() }) {
                        Icon(if (showGrid) Icons.Default.GridOn else Icons.Default.GridOff, contentDescription = "Grade")
                    }
                    IconButton(onClick = { autoShoot = !autoShoot; prefs.edit().putBoolean("auto", autoShoot).apply() }) {
                        Icon(Icons.Default.Timer, contentDescription = "Disparo automático",
                            tint = if (autoShoot) Color(0xFF34D399) else LocalContentColor.current)
                    }
                    IconButton(onClick = { torch = !torch }) {
                        Icon(if (torch) Icons.Default.FlashlightOn else Icons.Default.FlashlightOff, contentDescription = "Lanterna",
                            tint = if (torch) Color.Yellow else LocalContentColor.current)
                    }
                    IconButton(onClick = {
                        cameraFacing = if (cameraFacing == CameraSelector.LENS_FACING_BACK) CameraSelector.LENS_FACING_FRONT else CameraSelector.LENS_FACING_BACK
                    }) { Icon(Icons.Default.FlipCameraAndroid, contentDescription = "Virar câmera") }
                    IconButton(onClick = { launchSystemCamera() }) { Icon(Icons.Default.PhotoCamera, contentDescription = "Câmera do sistema") }
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding).background(Color.Black)) {
            if (!hasCameraPermission) {
                Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(64.dp), tint = Color.White)
                    Spacer(Modifier.height(16.dp))
                    Text("Permissão de Câmera Necessária", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color.White)
                    Spacer(Modifier.height(8.dp))
                    Text("O ImobWeb precisa de acesso à câmera para fotografar os cômodos e itens vistoriados.",
                        textAlign = TextAlign.Center, color = Color.White.copy(alpha = 0.8f))
                    Spacer(Modifier.height(24.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) { Text("Conceder Permissão") }
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = { launchSystemCamera() }) { Text("Usar Câmera do Sistema", color = Color.White) }
                }
                return@Box
            }
            if (cameraInitError != null) {
                Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(56.dp), tint = Color(0xFFF59E0B))
                    Spacer(Modifier.height(16.dp))
                    Text("Não foi possível iniciar o preview", fontWeight = FontWeight.Bold, color = Color.White)
                    Text(cameraInitError ?: "", textAlign = TextAlign.Center, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                    Spacer(Modifier.height(20.dp))
                    Button(onClick = { launchSystemCamera() }) { Text("Abrir Câmera do Sistema") }
                }
                return@Box
            }

            AndroidView(
                factory = { ctx ->
                    PreviewView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                        implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                        scaleType = PreviewView.ScaleType.FILL_CENTER
                        // foco por toque
                        setOnTouchListener { v, ev ->
                            if (ev.action == android.view.MotionEvent.ACTION_UP) {
                                val point = meteringPointFactory.createPoint(ev.x, ev.y)
                                camera?.cameraControl?.startFocusAndMetering(FocusMeteringAction.Builder(point).build())
                                focusPoint = Offset(ev.x, ev.y)
                                v.performClick()
                            }
                            true
                        }
                        previewView = this
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // grade (terços) e nível
            Canvas(Modifier.fillMaxSize()) {
                if (showGrid) {
                    val c = Color.White.copy(alpha = 0.35f)
                    for (i in 1..2) {
                        drawLine(c, Offset(size.width * i / 3, 0f), Offset(size.width * i / 3, size.height), 1.5f)
                        drawLine(c, Offset(0f, size.height * i / 3), Offset(size.width, size.height * i / 3), 1.5f)
                    }
                }
                focusPoint?.let { drawCircle(Color.White, radius = 40f, center = it, style = Stroke(width = 3f)) }
            }
            LaunchedEffect(focusPoint) { if (focusPoint != null) { delay(900); focusPoint = null } }

            // roteiro + aviso ao vivo
            Column(Modifier.align(Alignment.TopCenter).fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                if (shotList.isNotEmpty()) {
                    Row(
                        Modifier.clip(RoundedCornerShape(12.dp)).background(Color.Black.copy(alpha = 0.6f)).padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { shotIdx = (shotIdx - 1).coerceAtLeast(0) }, enabled = shotIdx > 0, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Anterior", tint = Color.White)
                        }
                        Text(
                            if (currentShot != null) "Agora: $currentShot  (${shotIdx + 1}/${shotList.size})" else "Roteiro concluído ✓",
                            color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.widthIn(max = 260.dp), maxLines = 2
                        )
                        IconButton(onClick = { advance() }, enabled = currentShot != null, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Pular", tint = Color.White)
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                }
                if (liveTip != null) {
                    Row(
                        Modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xFFF59E0B).copy(alpha = 0.9f))
                            .clickable(enabled = dark && camera?.cameraInfo?.hasFlashUnit() == true) { torch = true }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(if (dark) Icons.Default.FlashlightOn else Icons.Default.Warning, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(liveTip + if (dark && !torch) " (toque)" else "", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // botão de disparo (com anel do disparo automático)
            Box(Modifier.align(Alignment.BottomCenter).padding(bottom = 36.dp), contentAlignment = Alignment.Center) {
                if (autoShoot && autoProgress > 0f) {
                    CircularProgressIndicator(progress = { autoProgress }, modifier = Modifier.size(96.dp), color = Color(0xFF34D399), strokeWidth = 5.dp)
                }
                Box(
                    Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(Color.White)
                        .border(4.dp, (if (ready) Color(0xFF34D399) else Color.White).copy(alpha = 0.6f), CircleShape)
                        .clickable(enabled = !isCapturing && review == null) { shoot() },
                    contentAlignment = Alignment.Center
                ) {
                    if (isCapturing) CircularProgressIndicator(Modifier.size(32.dp), strokeWidth = 3.dp, color = Color.Black)
                }
            }
            if (autoShoot) {
                Text("Disparo automático: fique parado com boa luz", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp,
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 12.dp))
            }

            // revisão da foto com problema
            review?.let { (file, q, label) ->
                val (issue, advice) = q.issue() ?: ("Foto" to "")
                AlertDialog(
                    onDismissRequest = {},
                    icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFF59E0B)) },
                    title = { Text(issue) },
                    text = { Text(advice) },
                    confirmButton = {
                        TextButton(onClick = { file.delete(); review = null }) { Text("Refazer") }
                    },
                    dismissButton = {
                        TextButton(onClick = {
                            review = null
                            onPhotoCaptured(file.absolutePath, label)
                            advance()
                        }) { Text("Usar assim mesmo") }
                    }
                )
            }
        }
    }
}
