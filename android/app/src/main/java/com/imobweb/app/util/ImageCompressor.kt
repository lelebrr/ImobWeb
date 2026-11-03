package com.imobweb.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.Base64
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Compressão de fotos da vistoria: corrige a orientação (EXIF), reduz para no
 * máximo [DEFAULT_MAX_DIMENSION] px e grava JPEG em disco. A decodificação usa
 * inSampleSize para não carregar fotos de 12–50 MP inteiras na memória.
 */
object ImageCompressor {

    const val DEFAULT_MAX_DIMENSION = 1600
    const val DEFAULT_QUALITY = 82
    private const val MAX_SIZE_BYTES = 1_500_000L

    /** Lê [uri], comprime e grava em [target]. Retorna o arquivo ou null se a imagem for inválida. */
    fun compressToFile(
        context: Context,
        uri: Uri,
        target: File,
        maxDimension: Int = DEFAULT_MAX_DIMENSION,
        quality: Int = DEFAULT_QUALITY
    ): File? {
        return try {
            // 1) Só as dimensões, para escolher o fator de amostragem
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
            if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null

            var sample = 1
            while (max(bounds.outWidth, bounds.outHeight) / (sample * 2) >= maxDimension) sample *= 2

            val options = BitmapFactory.Options().apply { inSampleSize = sample }
            val decoded = context.contentResolver.openInputStream(uri)?.use {
                BitmapFactory.decodeStream(it, null, options)
            } ?: return null

            val oriented = fixOrientation(context, uri, decoded)
            val scaled = scaleToFit(oriented, maxDimension)

            val output = ByteArrayOutputStream()
            var q = quality
            scaled.compress(Bitmap.CompressFormat.JPEG, q, output)
            while (output.size() > MAX_SIZE_BYTES && q > 40) {
                output.reset()
                q -= 10
                scaled.compress(Bitmap.CompressFormat.JPEG, q, output)
            }

            target.parentFile?.mkdirs()
            FileOutputStream(target).use { it.write(output.toByteArray()) }

            if (scaled !== oriented) scaled.recycle()
            if (oriented !== decoded) oriented.recycle()
            decoded.recycle()
            target
        } catch (e: Exception) {
            null
        } catch (e: OutOfMemoryError) {
            null
        }
    }

    private fun fixOrientation(context: Context, uri: Uri, bitmap: Bitmap): Bitmap {
        return try {
            val orientation = context.contentResolver.openInputStream(uri)?.use {
                ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
            } ?: ExifInterface.ORIENTATION_NORMAL
            val matrix = Matrix()
            when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
                ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
                ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
                ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
                ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
                else -> return bitmap
            }
            Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
        } catch (_: Exception) {
            bitmap
        }
    }

    private fun scaleToFit(bitmap: Bitmap, maxDimension: Int): Bitmap {
        val ratio = min(maxDimension.toFloat() / bitmap.width, maxDimension.toFloat() / bitmap.height)
        if (ratio >= 1f) return bitmap
        return Bitmap.createScaledBitmap(
            bitmap,
            (bitmap.width * ratio).roundToInt(),
            (bitmap.height * ratio).roundToInt(),
            true
        )
    }

    /**
     * Data URL de um JPEG já comprimido em disco. Não decodifica a imagem:
     * os bytes do arquivo são codificados direto em base64.
     */
    fun base64FromFile(filePath: String): String? {
        return try {
            val file = File(filePath)
            if (!file.exists() || file.length() == 0L) return null
            "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(file.readBytes())
        } catch (_: Exception) {
            null
        } catch (_: OutOfMemoryError) {
            null
        }
    }
}
