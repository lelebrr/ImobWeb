package com.imobweb.app.util

import android.content.Context
import android.net.Uri
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Base64
import java.util.UUID

/**
 * Armazenamento das fotos da vistoria.
 *
 * As fotos ficam como arquivos JPEG em `filesDir/photos` (área permanente do app,
 * que o Android não limpa sozinho). No banco Room só fica o caminho do arquivo:
 * guardar o base64 dentro da linha estoura o limite de ~2 MB do CursorWindow
 * ("Row too big to fit into CursorWindow") depois de poucas fotos.
 *
 * O base64 (data URL) só é montado quando é realmente necessário: IA, sincronização
 * e geração do laudo.
 */
object PhotoStore {

    fun dir(context: Context): File = File(context.filesDir, "photos").apply { mkdirs() }

    private fun newFile(context: Context): File = File(dir(context), "foto_${UUID.randomUUID()}.jpg")

    /** Importa uma foto da galeria (ou de qualquer content://). */
    suspend fun importUri(context: Context, uri: Uri): PhotoData? = withContext(Dispatchers.IO) {
        val file = ImageCompressor.compressToFile(context, uri, newFile(context)) ?: return@withContext null
        PhotoData(name = file.name, filePath = file.absolutePath)
    }

    /** Importa uma foto tirada pela câmera (arquivo temporário), apagando o original temporário. */
    suspend fun importFile(context: Context, path: String): PhotoData? = withContext(Dispatchers.IO) {
        val source = File(path)
        val result = ImageCompressor.compressToFile(context, Uri.fromFile(source), newFile(context))
        if (source.absolutePath.startsWith(context.cacheDir.absolutePath)) source.delete()
        result?.let { PhotoData(name = it.name, filePath = it.absolutePath) }
    }

    /** Grava uma foto recebida como data URL (servidor / dados antigos) e devolve a referência em disco. */
    fun fromDataUrl(context: Context, dataUrl: String, name: String = ""): File? {
        if (!dataUrl.startsWith("data:image/")) return null
        return try {
            val bytes = Base64.getMimeDecoder().decode(dataUrl.substringAfter(","))
            if (bytes.isEmpty()) return null
            newFile(context).also { it.writeBytes(bytes) }
        } catch (_: Exception) {
            null
        }
    }

    /** Garante que a foto está em disco e remove o base64 da estrutura (para gravar no Room). */
    fun persisted(context: Context, photo: PhotoData): PhotoData {
        val hasFile = !photo.filePath.isNullOrBlank() && File(photo.filePath).exists()
        if (hasFile) {
            return if (photo.dataUrl.isEmpty()) photo else photo.copy(dataUrl = "")
        }
        if (photo.dataUrl.startsWith("data:image/")) {
            val file = fromDataUrl(context, photo.dataUrl, photo.name)
            if (file != null) return photo.copy(dataUrl = "", filePath = file.absolutePath)
        }
        // Remoto (http) ou sem arquivo: mantém como está
        return photo
    }

    fun persisted(context: Context, rooms: List<RoomData>): List<RoomData> =
        rooms.map { room -> room.copy(photos = room.photos.map { persisted(context, it) }) }

    /** Data URL para envio à IA / servidor / laudo. */
    fun toDataUrl(photo: PhotoData): String? {
        if (photo.dataUrl.startsWith("data:image/")) return photo.dataUrl
        val path = photo.filePath ?: return null
        return ImageCompressor.base64FromFile(path)
    }

    /** Modelo para o Coil exibir a foto (arquivo local quando existir). */
    fun model(photo: PhotoData): Any {
        val path = photo.filePath
        if (!path.isNullOrBlank()) {
            val file = File(path)
            if (file.exists()) return file
        }
        return photo.dataUrl
    }

    fun exists(photo: PhotoData): Boolean =
        (!photo.filePath.isNullOrBlank() && File(photo.filePath).exists()) || photo.dataUrl.startsWith("data:image/")

    /** Apaga do disco as fotos de [vistoria] que não estão em [keep]. */
    fun deleteFiles(vistoria: Vistoria, keep: Set<String> = emptySet()) {
        vistoria.rooms.flatMap { it.photos }.mapNotNull { it.filePath }
            .filter { it !in keep }
            .forEach { runCatching { File(it).delete() } }
    }

    fun deletePhoto(photo: PhotoData) {
        photo.filePath?.let { runCatching { File(it).delete() } }
    }

    fun deleteAll(context: Context) {
        dir(context).listFiles()?.forEach { it.delete() }
    }

    // ------------------------------------------------------------------ fotos no servidor (R2)

    private fun sha256Hex(file: File): String {
        val md = java.security.MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buf = ByteArray(64 * 1024)
            while (true) {
                val n = input.read(buf)
                if (n <= 0) break
                md.update(buf, 0, n)
            }
        }
        return md.digest().joinToString("") { "%02x".format(it) }
    }

    private fun extOf(file: File): String? {
        val head = ByteArray(12)
        val n = file.inputStream().use { it.read(head) }
        if (n < 4) return null
        return when {
            head[0] == 0xFF.toByte() && head[1] == 0xD8.toByte() && head[2] == 0xFF.toByte() -> "jpg"
            head[0] == 0x89.toByte() && head[1] == 0x50.toByte() && head[2] == 0x4E.toByte() && head[3] == 0x47.toByte() -> "png"
            n >= 12 && head[0] == 'R'.code.toByte() && head[8] == 'W'.code.toByte() && head[9] == 'E'.code.toByte() -> "webp"
            else -> null
        }
    }

    /** Mesma chave que o servidor calcula: vistoria/<org>/<sha256>.<ext> (null se não for imagem). */
    fun keyFor(org: String, file: File): String? = runCatching {
        val ext = extOf(file) ?: return@runCatching null
        "vistoria/$org/${sha256Hex(file)}.$ext"
    }.getOrNull()

    /** Arquivo local de uma foto baixada do servidor (nome = hash, então nunca baixa duas vezes). */
    fun fileForKey(context: Context, key: String): File {
        val name = key.substringAfterLast('/').filter { it.isLetterOrDigit() || it == '.' }.ifBlank { "foto.jpg" }
        return File(dir(context), "r2_$name")
    }
}
