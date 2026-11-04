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

// ===================== STEP 1: Property Info =====================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun StepPropertyInfo(
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
internal fun StepParties(
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
