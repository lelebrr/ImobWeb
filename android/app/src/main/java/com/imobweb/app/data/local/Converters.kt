package com.imobweb.app.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.imobweb.app.model.ChaveItem
import com.imobweb.app.model.Medidor
import com.imobweb.app.model.Medidores
import com.imobweb.app.model.PhotoAnnotation
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Signatures

/**
 * O Gson não usa os valores padrão do Kotlin: campos ausentes no JSON (dados
 * gravados por versões antigas do app ou vindos do servidor) chegam como null
 * mesmo em propriedades não-nulas. As funções `sane*` corrigem isso na leitura.
 */
@Suppress("SENSELESS_COMPARISON", "USELESS_ELVIS")
object ModelSanitizer {
    fun room(r: RoomData): RoomData = r.copy(
        id = r.id ?: java.util.UUID.randomUUID().toString(),
        name = r.name ?: "",
        furniture = r.furniture ?: emptyList(),
        damages = r.damages ?: emptyList(),
        problems = r.problems ?: emptyList(),
        items = r.items ?: emptyList(),
        photos = (r.photos ?: emptyList()).map { photo(it) },
        checklist = r.checklist ?: emptyMap(),
        observations = r.observations ?: ""
    )

    fun photo(p: PhotoData): PhotoData = p.copy(
        dataUrl = p.dataUrl ?: "",
        name = p.name ?: "",
        annotations = (p.annotations ?: emptyList()).map { a -> a.copy(label = a.label ?: "") }
    )

    fun medidor(m: Medidor?): Medidor = if (m == null) Medidor() else Medidor(m.numero ?: "", m.leitura ?: "")

    fun medidores(m: Medidores?): Medidores =
        if (m == null) Medidores() else Medidores(medidor(m.agua), medidor(m.luz), medidor(m.gas))

    fun chave(c: ChaveItem): ChaveItem = ChaveItem(
        id = c.id ?: java.util.UUID.randomUUID().toString(),
        descricao = c.descricao ?: "",
        quantidade = if (c.quantidade in 1..99) c.quantidade else 1
    )
}

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromRoomList(value: List<RoomData>): String = gson.toJson(value)

    @TypeConverter
    fun toRoomList(value: String): List<RoomData> {
        val type = object : TypeToken<List<RoomData>>() {}.type
        val list: List<RoomData>? = gson.fromJson(value, type)
        return list.orEmpty().map { ModelSanitizer.room(it) }
    }

    @TypeConverter
    fun fromPhotoList(value: List<PhotoData>): String = gson.toJson(value)

    @TypeConverter
    fun toPhotoList(value: String): List<PhotoData> {
        val type = object : TypeToken<List<PhotoData>>() {}.type
        val list: List<PhotoData>? = gson.fromJson(value, type)
        return list.orEmpty().map { ModelSanitizer.photo(it) }
    }

    @TypeConverter
    fun fromAnnotationList(value: List<PhotoAnnotation>): String = gson.toJson(value)

    @TypeConverter
    fun toAnnotationList(value: String): List<PhotoAnnotation> {
        val type = object : TypeToken<List<PhotoAnnotation>>() {}.type
        return gson.fromJson(value, type) ?: emptyList()
    }

    @TypeConverter
    fun fromMedidores(value: Medidores?): String? = value?.let { gson.toJson(it) }

    @TypeConverter
    fun toMedidores(value: String?): Medidores? =
        value?.let { runCatching { ModelSanitizer.medidores(gson.fromJson(it, Medidores::class.java)) }.getOrNull() }

    @TypeConverter
    fun fromChaves(value: List<ChaveItem>): String = gson.toJson(value)

    @TypeConverter
    fun toChaves(value: String?): List<ChaveItem> {
        if (value.isNullOrBlank()) return emptyList()
        val type = object : TypeToken<List<ChaveItem>>() {}.type
        val list: List<ChaveItem>? = runCatching { gson.fromJson<List<ChaveItem>>(value, type) }.getOrNull()
        return list.orEmpty().map { ModelSanitizer.chave(it) }
    }

    @TypeConverter
    fun fromSignatures(value: Signatures): String = gson.toJson(value)

    @TypeConverter
    fun toSignatures(value: String?): Signatures =
        value?.let { runCatching { gson.fromJson(it, Signatures::class.java) }.getOrNull() } ?: Signatures()
}
