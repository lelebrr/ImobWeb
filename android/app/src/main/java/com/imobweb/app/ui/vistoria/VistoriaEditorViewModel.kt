package com.imobweb.app.ui.vistoria

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.model.*
import com.imobweb.app.ui.settings.loadVistoriaDefaults
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * Estado do editor de vistoria. Sobrevive à rotação; se o Android encerrar o app, o
 * id/passo ficam no SavedStateHandle e o rascunho (gravado no ON_STOP) é recarregado do banco.
 */
class VistoriaEditorViewModel(
    private val handle: SavedStateHandle,
    private val repository: VistoriaRepository,
    initialId: Long?
) : ViewModel() {

    // ---------------- navegação/controle (persistidos no SavedStateHandle)
    private val _step = mutableIntStateOf(handle.get<Number>("step")?.toInt() ?: 0)
    var currentStep: Int
        get() = _step.intValue
        set(v) { _step.intValue = v; handle["step"] = v }

    private val _roomIdx = mutableIntStateOf(handle.get<Number>("roomIdx")?.toInt() ?: 0)
    var currentRoomIdx: Int
        get() = _roomIdx.intValue
        set(v) { _roomIdx.intValue = v; handle["roomIdx"] = v }

    private val _savedId = mutableLongStateOf(handle.get<Number>("savedId")?.toLong() ?: (initialId ?: 0L))
    var savedId: Long
        get() = _savedId.longValue
        set(v) { _savedId.longValue = v; handle["savedId"] = v }

    val draftKey: String = handle["draftKey"] ?: UUID.randomUUID().toString().also { handle["draftKey"] = it }

    var loaded by mutableStateOf(false)
        private set
    var isSaving by mutableStateOf(false)

    // ---------------- dados da vistoria
    val hoje: String = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).format(Date())
    var condominio by mutableStateOf("")
    var endereco by mutableStateOf("")
    var numero by mutableStateOf("")
    var conjApto by mutableStateOf("")
    var andar by mutableStateOf("")
    var cep by mutableStateOf("")
    var bairro by mutableStateOf("")
    var cidade by mutableStateOf("São Paulo")
    var estado by mutableStateOf("SP")
    var tipoImovel by mutableStateOf("APARTAMENTO")
    var finalidade by mutableStateOf("RESIDENCIAL")
    var metragem by mutableStateOf("")
    var mobiliado by mutableStateOf("NÃO")
    var locadora by mutableStateOf("")
    var locadoraCpf by mutableStateOf("")
    var locadoraTelefone by mutableStateOf("")
    var locatario by mutableStateOf("")
    var locatarioCpf by mutableStateOf("")
    var locatarioTelefone by mutableStateOf("")
    var vistoriadora by mutableStateOf("")
    var solicitante by mutableStateOf("")
    var emailContestacao by mutableStateOf("")
    var consideracoes by mutableStateOf("")
    var dataFotografia by mutableStateOf(hoje)
    var dataLaudo by mutableStateOf(hoje)
    var rooms by mutableStateOf<List<RoomData>>(emptyList())
    var tipoVistoria by mutableStateOf(TipoVistoria.ENTRADA)
    var medidores by mutableStateOf(Medidores())
    var medidoresEntrada by mutableStateOf<Medidores?>(null)
    var chaves by mutableStateOf<List<ChaveItem>>(emptyList())
    var signatures by mutableStateOf(Signatures())
    var reparos by mutableStateOf<List<Reparo>>(emptyList())
    var linkedId by mutableStateOf<Long?>(null)
    var syncStatus by mutableStateOf(SyncStatus.DRAFT)
        private set

    /** Atualiza um cômodo pelo id, sempre sobre o estado mais recente (seguro em corrotinas). */
    fun updateRoom(id: String, transform: (RoomData) -> RoomData) {
        rooms = rooms.map { if (it.id == id) transform(it) else it }
    }

    fun addPhotoToRoom(roomId: String?, photo: PhotoData) {
        val target = roomId ?: return
        updateRoom(target) { it.copy(photos = it.photos + photo) }
    }

    /** Carrega o rascunho existente ou os valores padrão de Configurações (uma vez). */
    fun load(context: Context) {
        if (loaded) return
        viewModelScope.launch {
            val existing = if (savedId > 0) repository.getVistoriaById(savedId) else null
            if (existing != null) {
                apply(existing)
            } else {
                savedId = 0L
                val d = loadVistoriaDefaults(context)
                if (d.vistoriadora.isNotBlank()) vistoriadora = d.vistoriadora
                if (d.solicitante.isNotBlank()) solicitante = d.solicitante
                if (d.cidade.isNotBlank()) cidade = d.cidade
                if (d.estado.isNotBlank()) estado = d.estado
                if (d.emailContestacao.isNotBlank()) emailContestacao = d.emailContestacao
            }
            loaded = true
            startAutosave()
        }
    }

    private fun apply(v: Vistoria) {
        condominio = v.condominio; endereco = v.endereco; numero = v.numero
        conjApto = v.conjApto; andar = v.andar; cep = v.cep; bairro = v.bairro
        cidade = v.cidade; estado = v.estado; tipoImovel = v.tipoImovel
        finalidade = v.finalidade; metragem = v.metragem; mobiliado = v.mobiliado
        locadora = v.locadora; locadoraCpf = v.locadoraCpf; locadoraTelefone = v.locadoraTelefone
        locatario = v.locatario; locatarioCpf = v.locatarioCpf; locatarioTelefone = v.locatarioTelefone
        vistoriadora = v.vistoriadora; solicitante = v.solicitante; emailContestacao = v.emailContestacao
        consideracoes = v.consideracoes
        dataFotografia = v.dataFotografia.ifBlank { hoje }
        dataLaudo = v.dataLaudo.ifBlank { hoje }
        rooms = v.rooms.map { it.copy(analyzing = false) }
        tipoVistoria = v.tipoVistoria
        medidores = v.medidores
        medidoresEntrada = v.medidoresEntrada
        chaves = v.chaves
        signatures = v.signatures
        reparos = v.reparos
        linkedId = v.linkedId
        syncStatus = v.status
    }

    val canProceed: Boolean
        get() = when (currentStep) {
            0 -> endereco.isNotBlank() || condominio.isNotBlank()
            1 -> locadora.isNotBlank() && locatario.isNotBlank()
            2 -> rooms.isNotEmpty()
            else -> true
        }

    /** Foto do estado atual do formulário. */
    fun snapshot(): Vistoria = Vistoria(
        id = savedId,
        condominio = condominio, endereco = endereco, numero = numero,
        conjApto = conjApto, cep = cep, bairro = bairro,
        cidade = cidade, estado = estado, tipoImovel = tipoImovel,
        finalidade = finalidade, metragem = metragem, mobiliado = mobiliado,
        locadora = locadora, locadoraCpf = locadoraCpf,
        locatario = locatario, locatarioCpf = locatarioCpf,
        vistoriadora = vistoriadora, dataFotografia = dataFotografia,
        dataLaudo = dataLaudo, solicitante = solicitante,
        consideracoes = consideracoes, rooms = rooms,
        tipoVistoria = tipoVistoria, medidores = medidores, chaves = chaves, signatures = signatures,
        linkedId = linkedId, medidoresEntrada = medidoresEntrada,
        andar = andar, locadoraTelefone = locadoraTelefone, locatarioTelefone = locatarioTelefone,
        emailContestacao = emailContestacao, reparos = reparos
    )

    fun hasContent(): Boolean =
        savedId > 0 || condominio.isNotBlank() || endereco.isNotBlank() || locadora.isNotBlank() || rooms.isNotEmpty()

    /** Grava o rascunho. As gravações são serializadas no repositório (sem duplicar registros). */
    suspend fun saveCurrent(): Long {
        if (!loaded || !hasContent()) return savedId
        val id = repository.saveFromEditor(snapshot(), draftKey)
        savedId = id
        repository.getVistoriaById(id)?.let { syncStatus = it.status }
        return id
    }

    /** Grava num escopo que sobrevive ao fim desta tela/ViewModel (saída, segundo plano). */
    fun saveDetached(scope: CoroutineScope, then: suspend () -> Unit = {}) {
        if (!loaded || !hasContent()) return
        val draft = snapshot()
        scope.launch {
            runCatching {
                val id = repository.saveFromEditor(draft, draftKey)
                if (savedId == 0L) savedId = id
            }
            then()
        }
    }

    private var autosaveStarted = false
    private fun startAutosave() {
        if (autosaveStarted) return
        autosaveStarted = true
        viewModelScope.launch {
            while (true) {
                delay(30_000)
                if (!isSaving) runCatching { saveCurrent() }
            }
        }
    }
}
