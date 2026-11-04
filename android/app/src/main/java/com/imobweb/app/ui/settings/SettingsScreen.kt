package com.imobweb.app.ui.settings

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.imobweb.app.data.repository.VistoriaRepository
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

private val android.content.Context.settingsStore by preferencesDataStore(name = "vistoria_settings")
private val VISTORIADORA_KEY = stringPreferencesKey("vistoriadora")
private val SOLICITANTE_KEY = stringPreferencesKey("solicitante")
private val CIDADE_KEY = stringPreferencesKey("cidade")
private val ESTADO_KEY = stringPreferencesKey("estado")
private val GEMINI_KEY = stringPreferencesKey("gemini_api_key")
private val EMPRESA_KEY = stringPreferencesKey("empresa_nome")
private val EMAIL_CONTEST_KEY = stringPreferencesKey("email_contestacao")
private val WM_ENABLED_KEY = stringPreferencesKey("watermark_enabled")
private val WM_TEXT_KEY = stringPreferencesKey("watermark_text")
private val WM_IMAGE_KEY = stringPreferencesKey("watermark_image")

/** Logo reduzido (máx. 360 px) e bem transparente, pronto para usar como marca d'água (PNG em data URL). */
private fun faintWatermark(path: String): String? = runCatching {
    val f = java.io.File(path)
    if (!f.exists()) return null
    val src = android.graphics.BitmapFactory.decodeFile(f.absolutePath) ?: return null
    val scale = minOf(1f, 360f / maxOf(src.width, src.height))
    val w = (src.width * scale).toInt().coerceAtLeast(1)
    val h = (src.height * scale).toInt().coerceAtLeast(1)
    val out = android.graphics.Bitmap.createBitmap(w, h, android.graphics.Bitmap.Config.ARGB_8888)
    val canvas = android.graphics.Canvas(out)
    val paint = android.graphics.Paint(android.graphics.Paint.FILTER_BITMAP_FLAG).apply { alpha = 22 }
    canvas.drawBitmap(src, null, android.graphics.Rect(0, 0, w, h), paint)
    src.recycle()
    val bytes = java.io.ByteArrayOutputStream().also { out.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, it) }.toByteArray()
    out.recycle()
    "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(bytes)
}.getOrNull()

suspend fun loadLaudoOptions(context: android.content.Context): com.imobweb.app.util.LaudoOptions {
    val p = context.settingsStore.data.first()
    val enabled = p[WM_ENABLED_KEY] == "1"
    val image = if (enabled) p[WM_IMAGE_KEY]?.let { path -> faintWatermark(path) } else null
    return com.imobweb.app.util.LaudoOptions(
        empresaNome = p[EMPRESA_KEY].orEmpty(),
        watermarkText = if (enabled) p[WM_TEXT_KEY]?.takeIf { it.isNotBlank() } else null,
        watermarkImage = image
    )
}

/** Valores padrão configurados pelo usuário, usados para preencher uma nova vistoria. */
data class VistoriaDefaults(
    val vistoriadora: String = "",
    val solicitante: String = "",
    val cidade: String = "",
    val estado: String = "",
    val emailContestacao: String = ""
)

suspend fun loadVistoriaDefaults(context: android.content.Context): VistoriaDefaults {
    val prefs = context.settingsStore.data.first()
    return VistoriaDefaults(
        vistoriadora = prefs[VISTORIADORA_KEY].orEmpty(),
        solicitante = prefs[SOLICITANTE_KEY].orEmpty(),
        cidade = prefs[CIDADE_KEY].orEmpty(),
        estado = prefs[ESTADO_KEY].orEmpty(),
        emailContestacao = prefs[EMAIL_CONTEST_KEY].orEmpty()
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    repository: VistoriaRepository,
    onBack: () -> Unit,
    onLoggedOut: () -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var vistoriadora by remember { mutableStateOf("") }
    var solicitante by remember { mutableStateOf("") }
    var cidade by remember { mutableStateOf("São Paulo") }
    var estado by remember { mutableStateOf("SP") }
    var geminiKey by remember { mutableStateOf("") }
    var showGeminiKey by remember { mutableStateOf(false) }
    var serverUrl by remember { mutableStateOf("") }
    var totalSaved by remember { mutableIntStateOf(0) }
    var loggedEmail by remember { mutableStateOf<String?>(null) }
    var isLoggedIn by remember { mutableStateOf(false) }
    var confirmClear by remember { mutableStateOf(false) }
    var confirmLogout by remember { mutableStateOf(false) }
    var empresaNome by remember { mutableStateOf("") }
    var emailContestacao by remember { mutableStateOf("") }
    var wmEnabled by remember { mutableStateOf(false) }
    var wmText by remember { mutableStateOf("") }
    var wmImage by remember { mutableStateOf<String?>(null) }
    var backupBusy by remember { mutableStateOf<String?>(null) }

    val wmPicker = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            val saved = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                runCatching {
                    // copia os bytes (mantém a transparência do PNG), limitado a 1,5 MB
                    val bytes = context.contentResolver.openInputStream(uri)!!.use { it.readBytes() }
                    require(bytes.size <= 1_500_000) { "Imagem grande demais (máx. 1,5 MB)" }
                    val isPng = bytes.size > 4 && bytes[0] == 0x89.toByte() && bytes[1] == 0x50.toByte()
                    val dir = java.io.File(context.filesDir, "brand").apply { mkdirs() }
                    dir.listFiles()?.forEach { it.delete() }
                    java.io.File(dir, if (isPng) "watermark.png" else "watermark.jpg").apply { writeBytes(bytes) }.absolutePath
                }
            }
            saved.onSuccess { wmImage = it }.onFailure {
                Toast.makeText(context, it.message ?: "Não foi possível usar a imagem", Toast.LENGTH_LONG).show()
            }
        }
    }

    val exportLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            backupBusy = "Exportando…"
            runCatching { com.imobweb.app.util.BackupManager.export(context, repository, uri) }
                .onSuccess { Toast.makeText(context, "Backup exportado: $it vistoria(s)", Toast.LENGTH_LONG).show() }
                .onFailure { Toast.makeText(context, "Falha no backup: ${it.message}", Toast.LENGTH_LONG).show() }
            backupBusy = null
        }
    }
    val importLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            backupBusy = "Importando…"
            runCatching { com.imobweb.app.util.BackupManager.import(context, repository, uri) }
                .onSuccess {
                    totalSaved = repository.getAllVistorias().first().size
                    Toast.makeText(context, "$it vistoria(s) importada(s)", Toast.LENGTH_LONG).show()
                }
                .onFailure { Toast.makeText(context, "Falha ao importar: ${it.message}", Toast.LENGTH_LONG).show() }
            backupBusy = null
        }
    }
    val appScope = (context.applicationContext as com.imobweb.app.ImobWebApp).appScope

    // Load settings
    LaunchedEffect(Unit) {
        val prefs = context.settingsStore.data.first()
        vistoriadora = prefs[VISTORIADORA_KEY] ?: ""
        solicitante = prefs[SOLICITANTE_KEY] ?: ""
        cidade = prefs[CIDADE_KEY] ?: "São Paulo"
        estado = prefs[ESTADO_KEY] ?: "SP"
        geminiKey = repository.getGeminiKey() ?: prefs[GEMINI_KEY] ?: ""
        empresaNome = prefs[EMPRESA_KEY].orEmpty()
        emailContestacao = prefs[EMAIL_CONTEST_KEY].orEmpty()
        wmEnabled = prefs[WM_ENABLED_KEY] == "1"
        wmText = prefs[WM_TEXT_KEY].orEmpty()
        wmImage = prefs[WM_IMAGE_KEY]
        serverUrl = repository.getBaseUrl()

        val vistorias = repository.getAllVistorias().first()
        totalSaved = vistorias.size
        isLoggedIn = repository.isLoggedIn()
        loggedEmail = repository.getUserEmail()
    }

    suspend fun saveSettings() {
        context.settingsStore.edit {
            it[VISTORIADORA_KEY] = vistoriadora
            it[SOLICITANTE_KEY] = solicitante
            it[CIDADE_KEY] = cidade
            it[ESTADO_KEY] = estado.trim().uppercase().take(2)
            it.remove(GEMINI_KEY) // a chave fica só no SessionManager
            it[EMPRESA_KEY] = empresaNome.trim()
            it[EMAIL_CONTEST_KEY] = emailContestacao.trim()
            it[WM_ENABLED_KEY] = if (wmEnabled) "1" else "0"
            it[WM_TEXT_KEY] = wmText.trim()
            val img = wmImage
            if (img == null) it.remove(WM_IMAGE_KEY) else it[WM_IMAGE_KEY] = img
        }
        repository.setGeminiKey(geminiKey)
        repository.setBaseUrl(serverUrl)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Configurações", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        // Escopo do app: a gravação não é cancelada ao sair da tela
                        appScope.launch { saveSettings() }
                        onBack()
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Conta
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccountCircle, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Conta", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        if (isLoggedIn) "Conectado como ${loggedEmail ?: "usuário"}. As vistorias são sincronizadas com o servidor."
                        else "Sem login (modo offline). As vistorias ficam apenas neste aparelho.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(8.dp))
                    if (isLoggedIn) {
                        OutlinedButton(onClick = { confirmLogout = true }, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Sair da conta")
                        }
                    } else {
                        Button(onClick = {
                            appScope.launch { saveSettings() }
                            onLoggedOut()
                        }, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Default.Login, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Entrar com minha conta")
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Server / Cloudflare Connection
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Cloud, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Servidor & Nuvem", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("Endereço do backend para sincronização e login (ex: Cloudflare / Domínio próprio):",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = serverUrl,
                        onValueChange = { serverUrl = it },
                        label = { Text("URL do Servidor") },
                        placeholder = { Text("https://seu-dominio.com.br") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Default values section
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Valores Padrão", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(value = vistoriadora, onValueChange = { vistoriadora = it },
                        label = { Text("Vistoriadora") }, placeholder = { Text("Nome padrão do vistoriador") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = solicitante, onValueChange = { solicitante = it },
                        label = { Text("Solicitante") }, placeholder = { Text("Ex: ARTIMOB NEGÓCIOS IMOBILIÁRIOS") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = cidade, onValueChange = { cidade = it },
                            label = { Text("Cidade") }, modifier = Modifier.weight(1f), singleLine = true)
                        OutlinedTextField(value = estado, onValueChange = { estado = it },
                            label = { Text("UF") }, modifier = Modifier.weight(1f), singleLine = true)
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // AI Configuration
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AutoAwesome, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Google Gemini AI", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("Configure a chave da API Gemini para análise automática de fotos.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = geminiKey,
                        onValueChange = { geminiKey = it },
                        label = { Text("API Key") },
                        placeholder = { Text("Sua chave Gemini AI") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        visualTransformation = if (showGeminiKey) VisualTransformation.None
                            else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showGeminiKey = !showGeminiKey }) {
                                Icon(
                                    if (showGeminiKey) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null
                                )
                            }
                        }
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Laudo (PDF): empresa, contestação e marca d'água
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PictureAsPdf, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Laudo (PDF)", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = empresaNome, onValueChange = { empresaNome = it.take(80) },
                        label = { Text("Nome da empresa (rodapé do laudo)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = emailContestacao, onValueChange = { emailContestacao = it.take(120) },
                        label = { Text("E-mail para contestação (padrão)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Marca d'água no laudo", modifier = Modifier.weight(1f))
                        Switch(checked = wmEnabled, onCheckedChange = { wmEnabled = it })
                    }
                    if (wmEnabled) {
                        OutlinedTextField(value = wmText, onValueChange = { wmText = it.take(40) },
                            label = { Text("Texto da marca d'água") }, placeholder = { Text("Ex.: CÓPIA — imobWeb") },
                            modifier = Modifier.fillMaxWidth(), singleLine = true)
                        Spacer(Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedButton(onClick = { wmPicker.launch("image/*") }) {
                                Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(if (wmImage == null) "Usar logo como marca d'água" else "Trocar logo")
                            }
                            if (wmImage != null) {
                                TextButton(onClick = { wmImage = null }) { Text("Remover") }
                            }
                        }
                        Text("A marca d'água aparece clara, repetida em todas as páginas.",
                            style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Backup
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Backup, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Backup", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(6.dp))
                    Text("Arquivo .json com todas as vistorias e fotos. É o mesmo formato do sistema web: dá para importar lá e vice-versa.",
                        style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    if (backupBusy != null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                            Text(backupBusy!!)
                        }
                    } else {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = {
                                    val date = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
                                    exportLauncher.launch("vistorias-backup-$date.json")
                                },
                                enabled = totalSaved > 0,
                                modifier = Modifier.weight(1f)
                            ) { Text("Exportar") }
                            OutlinedButton(
                                onClick = { importLauncher.launch(arrayOf("application/json", "text/plain", "application/octet-stream")) },
                                modifier = Modifier.weight(1f)
                            ) { Text("Importar") }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Data management
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Storage, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Dados Salvos", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("$totalSaved laudo(s) de vistoria salvos no dispositivo.",
                        style = MaterialTheme.typography.bodyMedium)
                    Spacer(Modifier.height(12.dp))

                    OutlinedButton(
                        onClick = { confirmClear = true },
                        enabled = totalSaved > 0,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null,
                            modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Limpar Todos os Dados")
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // About
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, null,
                            tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Sobre", style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("ImobWeb v${com.imobweb.app.BuildConfig.VERSION_NAME}",
                        style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                    Text("Sistema de Vistorias Imobiliárias",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(4.dp))
                    Text("© 2026 ImobWeb",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            Spacer(Modifier.height(32.dp))

            // Save button
            Button(
                onClick = {
                    scope.launch {
                        saveSettings()
                        Toast.makeText(context, "Configurações salvas!", Toast.LENGTH_SHORT).show()
                        onBack()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Salvar Configurações")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Apagar todos os laudos?") },
            text = { Text("Isso apaga do aparelho as $totalSaved vistoria(s) e todas as fotos. Vistorias ainda não sincronizadas serão perdidas. As cópias no servidor não são afetadas.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmClear = false
                    scope.launch {
                        repository.deleteAllLocal()
                        totalSaved = 0
                        Toast.makeText(context, "Todos os dados foram limpos", Toast.LENGTH_SHORT).show()
                    }
                }) { Text("Apagar tudo", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold) }
            },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("Cancelar") } }
        )
    }

    if (confirmLogout) {
        AlertDialog(
            onDismissRequest = { confirmLogout = false },
            title = { Text("Sair da conta?") },
            text = { Text("As vistorias continuam salvas neste aparelho. Vistorias pendentes só serão enviadas depois que você entrar novamente.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmLogout = false
                    scope.launch {
                        saveSettings()
                        repository.logout()
                        onLoggedOut()
                    }
                }) { Text("Sair") }
            },
            dismissButton = { TextButton(onClick = { confirmLogout = false }) { Text("Cancelar") } }
        )
    }
}
