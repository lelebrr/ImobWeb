package com.imobweb.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Typeface
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Base64
import java.util.Date
import java.util.Locale
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Compressão de fotos da vistoria:
 * 1. Corrige a orientação EXIF e garante fotos em pé (modo retrato).
 * 2. Reduz para no máximo [DEFAULT_MAX_DIMENSION] px.
 * 3. Aplica marca d'água permanente com data, hora e identificação da vistoria.
 * 4. Grava JPEG otimizado em disco.
 */
object ImageCompressor {

    const val DEFAULT_MAX_DIMENSION = 1600
    const val DEFAULT_QUALITY = 82
    private const val MAX_SIZE_BYTES = 1_500_000L

    /** Lê [uri], comprime, aplica rotação para retrato e marca d'água com data/hora, gravando em [target]. */
    fun compressToFile(
        context: Context,
        uri: Uri,
        target: File,
        maxDimension: Int = DEFAULT_MAX_DIMENSION,
        quality: Int = DEFAULT_QUALITY,
        watermarkText: String? = null
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

            // Garante fotos em pé (modo retrato / portrait)
            val portrait = if (oriented.width > oriented.height) {
                val matrix = Matrix().apply { postRotate(90f) }
                val rotated = Bitmap.createBitmap(oriented, 0, 0, oriented.width, oriented.height, matrix, true)
                if (rotated !== oriented && oriented !== decoded) oriented.recycle()
                rotated
            } else {
                oriented
            }

            val scaled = scaleToFit(portrait, maxDimension)

            // Aplica marca d'água com data e hora atual ou do arquivo
            val watermarked = applyWatermark(scaled, watermarkText)

            val output = ByteArrayOutputStream()
            var q = quality
            watermarked.compress(Bitmap.CompressFormat.JPEG, q, output)
            while (output.size() > MAX_SIZE_BYTES && q > 40) {
                output.reset()
                q -= 10
                watermarked.compress(Bitmap.CompressFormat.JPEG, q, output)
            }

            target.parentFile?.mkdirs()
            FileOutputStream(target).use { it.write(output.toByteArray()) }

            if (watermarked !== scaled && watermarked !== portrait) watermarked.recycle()
            if (scaled !== portrait) scaled.recycle()
            if (portrait !== oriented) portrait.recycle()
            if (oriented !== decoded) oriented.recycle()
            decoded.recycle()
            target
        } catch (e: Exception) {
            null
        } catch (e: OutOfMemoryError) {
            null
        }
    }

    /**
     * Aplica uma marca d'água legível e profissional no rodapé da imagem
     * contendo data, hora e texto da vistoria.
     */
    fun applyWatermark(
        source: Bitmap,
        extraLabel: String? = null,
        timestampDate: Date = Date()
    ): Bitmap {
        return try {
            val workingBitmap = if (source.isMutable) source else source.copy(Bitmap.Config.ARGB_8888, true)
            val canvas = Canvas(workingBitmap)
            val w = workingBitmap.width.toFloat()
            val h = workingBitmap.height.toFloat()

            val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale("pt", "BR"))
            val dateTimeStr = dateFormat.format(timestampDate)
            val labelStr = extraLabel?.takeIf { it.isNotBlank() } ?: "IMOBWEB VISTORIA"

            // Tamanho de fonte proporcional à resolução da imagem
            val textSize = max(20f, h * 0.024f)
            val subTextSize = textSize * 0.8f
            val padding = h * 0.015f
            val bannerHeight = (textSize + subTextSize) + (padding * 2.2f)

            // Faixa semi-transparente no rodapé para contraste perfeito
            val bgPaint = Paint().apply {
                color = android.graphics.Color.argb(140, 0, 0, 0)
                style = Paint.Style.FILL
            }
            canvas.drawRect(0f, h - bannerHeight, w, h, bgPaint)

            // Texto de data/hora
            val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = android.graphics.Color.WHITE
                this.textSize = textSize
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                setShadowLayer(3f, 1f, 1f, android.graphics.Color.BLACK)
            }

            // Texto secundário (cômodo ou ImobWeb)
            val subTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = android.graphics.Color.rgb(220, 225, 230)
                this.textSize = subTextSize
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
                setShadowLayer(2f, 1f, 1f, android.graphics.Color.BLACK)
            }

            canvas.drawText("📅 $dateTimeStr", padding * 1.5f, h - bannerHeight + padding + textSize, textPaint)
            canvas.drawText("🏢 $labelStr", padding * 1.5f, h - padding * 0.8f, subTextPaint)

            workingBitmap
        } catch (_: Exception) {
            source
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
