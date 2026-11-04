package com.imobweb.app.util

import android.graphics.BitmapFactory
import java.io.File

/**
 * Checagem local da qualidade das fotos (nada sai do aparelho), como o assistente
 * de câmera do sistema web: luz insuficiente/estourada e foto tremida/desfocada.
 */
object PhotoQuality {
    const val DARK = 55.0
    const val BRIGHT = 225.0
    /** variância do Laplaciano abaixo disso = sem detalhes nítidos (tremida/desfocada) */
    const val BLUR = 60.0

    data class Result(val brightness: Double, val sharpness: Double) {
        val tooDark get() = brightness < DARK
        val tooBright get() = brightness > BRIGHT
        /** parede lisa bem iluminada tem pouca textura: só acusa tremida quando há luz razoável */
        val blurry get() = sharpness < BLUR && !tooDark
        val ok get() = !tooDark && !tooBright && !blurry

        fun issue(): Pair<String, String>? = when {
            tooDark -> "Foto escura" to "Acenda a luz ou ative o flash e fotografe de novo."
            tooBright -> "Luz estourada" to "Evite apontar para a janela/lâmpada; mude o ângulo."
            blurry -> "Foto tremida ou desfocada" to "Apoie os braços, toque na tela para focar e segure firme."
            else -> null
        }
    }

    /** Média de luminância (0–255) de um plano Y amostrado. */
    fun meanLuma(y: ByteArray, width: Int, height: Int, rowStride: Int = width, step: Int = 8): Double {
        var sum = 0L
        var n = 0
        var row = 0
        while (row < height) {
            var col = 0
            val base = row * rowStride
            while (col < width) {
                val i = base + col
                if (i < y.size) { sum += (y[i].toInt() and 0xFF); n++ }
                col += step
            }
            row += step
        }
        return if (n == 0) 0.0 else sum.toDouble() / n
    }

    /** Variância do Laplaciano (4 vizinhos) de uma imagem em tons de cinza. */
    fun laplacianVariance(gray: IntArray, w: Int, h: Int): Double {
        if (w < 3 || h < 3) return 0.0
        var sum = 0.0
        var sumSq = 0.0
        var n = 0
        for (y in 1 until h - 1) {
            for (x in 1 until w - 1) {
                val i = y * w + x
                val lap = (gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i]).toDouble()
                sum += lap
                sumSq += lap * lap
                n++
            }
        }
        val mean = sum / n
        return sumSq / n - mean * mean
    }

    /** Analisa um JPEG em disco (decodifica reduzido, ~320 px). */
    fun analyze(file: File): Result? = runCatching {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(file.absolutePath, bounds)
        var sample = 1
        while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= 320) sample *= 2
        val bmp = BitmapFactory.decodeFile(file.absolutePath, BitmapFactory.Options().apply { inSampleSize = sample }) ?: return null
        val w = bmp.width
        val h = bmp.height
        val px = IntArray(w * h)
        bmp.getPixels(px, 0, w, 0, 0, w, h)
        bmp.recycle()
        val gray = IntArray(px.size) { i ->
            val c = px[i]
            ((c shr 16 and 0xFF) * 299 + (c shr 8 and 0xFF) * 587 + (c and 0xFF) * 114) / 1000
        }
        Result(gray.average(), laplacianVariance(gray, w, h))
    }.getOrNull()
}
