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

/** Valores padrão configurados pelo usuário, usados para preencher uma nova vistoria. */
data class VistoriaDefaults(
    val vistoriadora: String = "",
    val solicitante: String = "",
    val cidade: String = "",
    val estado: String = ""
)

suspend fun loadVistoriaDefaults(context: android.content.Context): VistoriaDefaults {
    val prefs = context.settingsStore.data.first()
    return VistoriaDefaults(
        vistoriadora = prefs[VISTORIADORA_KEY].orEmpty(),
        solicitante = prefs[SOLICITANTE_KEY].orEmpty(),
        cidade = prefs[CIDADE_KEY].orEmpty(),
        estado = prefs[ESTADO_KEY].orEmpty()
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
    val appScope = (context.applicationContext as com.imobweb.app.ImobWebApp).appScope

    // Load settings
    LaunchedEffect(Unit) {
        val prefs = context.settingsStore.data.first()
        vistoriadora = prefs[VISTORIADORA_KEY] ?: ""
        solicitante = prefs[SOLICITANTE_KEY] ?: ""
        cidade = prefs[CIDADE_KEY] ?: "São Paulo"
        estado = prefs[ESTADO_KEY] ?: "SP"
        geminiKey = repository.getGeminiKey() ?: prefs[GEMINI_KEY] ?: ""
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
