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
import kotlin.math.min
import kotlin.math.roundToInt

object ImageCompressor {

    data class CompressedImage(
        val bitmap: Bitmap,
        val filePath: String?,
        val base64: String,
        val width: Int,
        val height: Int,
        val sizeBytes: Long
    )

    suspend fun compress(
        context: Context,
        uri: Uri,
        maxDimension: Int = 1200,
        quality: Int = 80,
        maxSizeBytes: Long = 2_000_000 // 2MB
    ): CompressedImage? {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri)
            val originalBitmap = BitmapFactory.decodeStream(inputStream)
            inputStream?.close()

            if (originalBitmap == null) return null

            // Fix orientation from EXIF
            val correctedBitmap = fixOrientation(context, uri, originalBitmap)

            // Scale down
            val scaled = scaleToFit(correctedBitmap, maxDimension)

            // Compress to JPEG
            val outputStream = ByteArrayOutputStream()
            var currentQuality = quality
            scaled.compress(Bitmap.CompressFormat.JPEG, currentQuality, outputStream)

            // Reduce quality until under maxSizeBytes
            while (outputStream.size() > maxSizeBytes && currentQuality > 20) {
                outputStream.reset()
                currentQuality -= 10
                scaled.compress(Bitmap.CompressFormat.JPEG, currentQuality, outputStream)
            }

            val byteArray = outputStream.toByteArray()
            val base64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(byteArray)

            // Save to cache
            val fileName = "photo_${System.currentTimeMillis()}_${(Math.random() * 1000).toInt()}.jpg"
            val cacheFile = File(context.cacheDir, "photos/$fileName")
            cacheFile.parentFile?.mkdirs()
            FileOutputStream(cacheFile).use { it.write(byteArray) }

            if (originalBitmap != correctedBitmap) correctedBitmap.recycle()
            originalBitmap.recycle()

            CompressedImage(
                bitmap = scaled,
                filePath = cacheFile.absolutePath,
                base64 = base64,
                width = scaled.width,
                height = scaled.height,
                sizeBytes = byteArray.size.toLong()
            )
        } catch (e: Exception) {
            null
        }
    }

    private fun fixOrientation(context: Context, uri: Uri, bitmap: Bitmap): Bitmap {
        try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return bitmap
            val exif = ExifInterface(inputStream)
            inputStream.close()

            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )
            val matrix = Matrix()
            when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
                ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
                ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
                ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
                ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
                else -> return bitmap
            }
            return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
        } catch (_: Exception) {
            return bitmap
        }
    }

    private fun scaleToFit(bitmap: Bitmap, maxDimension: Int): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val ratio = min(maxDimension.toFloat() / width, maxDimension.toFloat() / height)
        if (ratio >= 1f) return bitmap
        val newWidth = (width * ratio).roundToInt()
        val newHeight = (height * ratio).roundToInt()
        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
    }

    fun base64FromFile(filePath: String, maxDimension: Int = 1200, quality: Int = 80): String? {
        return try {
            val bitmap = BitmapFactory.decodeFile(filePath) ?: return null
            val scaled = scaleToFit(bitmap, maxDimension)
            val outputStream = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
            val byteArray = outputStream.toByteArray()
            bitmap.recycle()
            if (scaled != bitmap) scaled.recycle()
            "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(byteArray)
        } catch (_: Exception) { null }
    }

    fun saveBitmapToCache(context: Context, bitmap: Bitmap, fileName: String): String? {
        return try {
            val cacheDir = File(context.cacheDir, "photos")
            if (!cacheDir.exists()) cacheDir.mkdirs()
            val file = File(cacheDir, fileName)
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
            }
            file.absolutePath
        } catch (e: Exception) { null }
    }

    fun cleanCache(context: Context) {
        val cacheDir = File(context.cacheDir, "photos")
        if (cacheDir.exists()) {
            cacheDir.listFiles()?.forEach { it.delete() }
        }
    }
}
