package com.imobweb.app.util

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.FileProvider
import com.imobweb.app.model.Vistoria
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.math.ceil
import kotlin.math.roundToInt

/**
 * Renderiza o HTML do laudo em um PDF real (A4), usando o WebView do Android.
 * Funciona 100% offline: as fotos são data URLs embutidas no próprio HTML.
 *
 * O laudo é diagramado em 794px de largura (equivalente a uma folha A4) e o
 * WebView é configurado para usar exatamente essa largura de layout, aplicando
 * um zoom inverso à densidade da tela. Assim o PDF sai igual em qualquer aparelho.
 */
object ReportPdfExporter {

    private const val PAGE_WIDTH_PT = 595   // A4 @ 72dpi
    private const val PAGE_HEIGHT_PT = 842

    /** Largura de diagramação do laudo, em px de projeto. */
    private const val CONTENT_WIDTH_PX = 794

    private const val TAG = "ReportPdfExporter"
    private const val LOAD_TIMEOUT_MS = 15_000L

    /**
     * O WebView diagrama o conteúdo em [CONTENT_WIDTH_PX] px CSS, mas pinta em
     * px físicos conforme a densidade da tela. Para capturar a página inteira
     * (sem cortar a direita), o WebView precisa ter essa mesma largura física.
     */
    private data class RenderSpec(
        val widthPx: Int,
        /** pt por px físico. */
        val scale: Float,
        /** Altura útil de uma página A4, em px físicos. */
        val pageHeightPx: Int
    )

    private fun renderSpec(density: Float): RenderSpec {
        val width = (CONTENT_WIDTH_PX * density).roundToInt().coerceAtLeast(CONTENT_WIDTH_PX)
        val scale = PAGE_WIDTH_PT.toFloat() / width
        val pageHeight = (PAGE_HEIGHT_PT / scale).roundToInt()
        return RenderSpec(width, scale, pageHeight)
    }

    suspend fun exportLaudo(context: Context, vistoria: Vistoria): File {
        val html = LaudoHtmlBuilder.build(vistoria)
        return exportHtml(context, html, "Laudo_${slug(vistoria)}.pdf")
    }

    suspend fun exportHtml(context: Context, html: String, fileName: String): File =
        withContext(Dispatchers.Main) {
            val spec = renderSpec(context.resources.displayMetrics.density)
            val webView = createWebView(context, spec.widthPx)
            try {
                val contentHeight = loadAndMeasure(
                    webView,
                    injectReadyScript(html),
                    spec.pageHeightPx
                )
                renderPdf(webView, contentHeight, spec, context, fileName)
            } finally {
                webView.removeJavascriptInterface(BRIDGE_NAME)
                webView.stopLoading()
                webView.destroy()
            }
        }

    private fun createWebView(context: Context, widthPx: Int): WebView =
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(widthPx, ViewGroup.LayoutParams.WRAP_CONTENT)
            setBackgroundColor(Color.WHITE)
            setLayerType(View.LAYER_TYPE_SOFTWARE, null)
            settings.apply {
                javaScriptEnabled = true
                loadsImagesAutomatically = true
                blockNetworkImage = false
                allowFileAccess = true
                domStorageEnabled = true
                defaultTextEncodingName = "UTF-8"
                useWideViewPort = false
                loadWithOverviewMode = false
                builtInZoomControls = false
            }
            measure(
                View.MeasureSpec.makeMeasureSpec(widthPx, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
            )
            layout(0, 0, widthPx, measuredHeight.coerceAtLeast(1))
        }

    private suspend fun renderPdf(
        webView: WebView,
        contentHeightPx: Int,
        spec: RenderSpec,
        context: Context,
        fileName: String
    ): File {
        webView.measure(
            View.MeasureSpec.makeMeasureSpec(spec.widthPx, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(contentHeightPx, View.MeasureSpec.EXACTLY)
        )
        webView.layout(0, 0, spec.widthPx, contentHeightPx)
        awaitMainLoop()
        // Dá tempo para o Chromium pintar a camada de software antes de desenhar.
        kotlinx.coroutines.delay(300)

        val document = PdfDocument()
        try {
            val pages = ceil(contentHeightPx.toDouble() / spec.pageHeightPx).toInt().coerceAtLeast(1)
            for (index in 0 until pages) {
                val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH_PT, PAGE_HEIGHT_PT, index + 1).create()
                val page = document.startPage(pageInfo)
                val canvas = page.canvas
                canvas.save()
                canvas.clipRect(0, 0, PAGE_WIDTH_PT, PAGE_HEIGHT_PT)
                canvas.scale(spec.scale, spec.scale)
                canvas.translate(0f, -(index * spec.pageHeightPx).toFloat())
                webView.draw(canvas)
                canvas.restore()
                document.finishPage(page)
            }

            val dir = File(context.cacheDir, "share").apply { mkdirs() }
            val file = File(dir, safeFileName(fileName))
            FileOutputStream(file).use { document.writeTo(it) }
            Log.d(TAG, "PDF com $pages página(s): ${file.length()} bytes")
            return file
        } finally {
            document.close()
        }
    }

    private suspend fun loadAndMeasure(webView: WebView, html: String, minHeightPx: Int): Int =
        suspendCancellableCoroutine { continuation ->
            val mainHandler = Handler(Looper.getMainLooper())
            val finished = AtomicBoolean(false)

            fun finish(heightCss: Int, pixelRatio: Double = 1.0) {
                val height = (heightCss * pixelRatio).roundToInt()
                if (finished.compareAndSet(false, true) && continuation.isActive) {
                    Log.d(TAG, "Conteúdo medido: ${height}px físicos (${heightCss}px CSS @ ${pixelRatio}x)")
                    continuation.resume(height.coerceAtLeast(minHeightPx))
                }
            }

            val bridge = object {
                @JavascriptInterface
                fun onReady(height: Double, viewportWidth: Double, pixelRatio: Double) {
                    Log.d(
                        TAG,
                        "JS onReady: altura=$height viewport=$viewportWidth dpr=$pixelRatio " +
                            "webView=${webView.width}x${webView.height} scale=${webView.scale} " +
                            "contentHeight=${webView.contentHeight}"
                    )
                    mainHandler.post { finish(height.toInt(), pixelRatio) }
                }

                @JavascriptInterface
                fun debug(json: String) {
                    Log.d(TAG, "JS debug: $json")
                }
            }

            // Garantia de que a exportação nunca fica travada caso o WebView
            // não dispare onPageFinished/JS (ex.: WebView indisponível).
            mainHandler.postDelayed({
                if (!finished.get() && continuation.isActive) {
                    Log.w(TAG, "Timeout aguardando o WebView; usando altura padrão")
                    finish(minHeightPx)
                }
            }, LOAD_TIMEOUT_MS)

            webView.addJavascriptInterface(bridge, BRIDGE_NAME)
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d(TAG, "onPageFinished")
                    // O script injetado chama onReady depois que as imagens carregam.
                    // Este fallback só existe para o caso de o script não responder.
                    mainHandler.postDelayed({
                        if (!finished.get()) {
                            webView.evaluateJavascript(
                                "(function(){var h=Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight);return h+','+(window.devicePixelRatio||1);})()"
                            ) { value ->
                                val parts = value?.trim()?.trim('"')?.split(",")
                                val height = parts?.getOrNull(0)?.toDoubleOrNull()?.toInt()
                                    ?: minHeightPx
                                val ratio = parts?.getOrNull(1)?.toDoubleOrNull() ?: 1.0
                                finish(height, ratio)
                            }
                        }
                    }, 4_000)
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: android.webkit.WebResourceRequest?,
                    error: android.webkit.WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    Log.e(TAG, "Erro no WebView: ${error?.description}")
                    if (!finished.get() && continuation.isActive) {
                        continuation.resumeWithException(
                            IllegalStateException("Falha ao renderizar o laudo: ${error?.description}")
                        )
                    }
                }
            }

            continuation.invokeOnCancellation { webView.destroy() }
            Log.d(TAG, "Carregando HTML (${html.length} caracteres)")
            webView.loadDataWithBaseURL("file:///android_asset/", html, "text/html", "UTF-8", null)
        }

    private suspend fun awaitMainLoop() {
        suspendCancellableCoroutine { continuation ->
            Handler(Looper.getMainLooper()).post {
                if (continuation.isActive) continuation.resume(Unit)
            }
        }
    }

    private fun injectReadyScript(html: String): String {
        val script = """
            <script>
            (function () {
                function notify() {
                    try {
                        var h = Math.max(
                            document.body.scrollHeight, document.body.offsetHeight,
                            document.documentElement.scrollHeight, document.documentElement.offsetHeight
                        );
                        AndroidBridge.onReady(h, window.innerWidth, window.devicePixelRatio || 1);
                        try {
                            var b = document.body.getBoundingClientRect();
                            AndroidBridge.debug(JSON.stringify({
                                innerWidth: window.innerWidth,
                                innerHeight: window.innerHeight,
                                dpr: window.devicePixelRatio,
                                visualScale: window.visualViewport ? window.visualViewport.scale : null,
                                docClientWidth: document.documentElement.clientWidth,
                                bodyRectWidth: b.width,
                                bodyOffsetWidth: document.body.offsetWidth,
                                bodyScrollWidth: document.body.scrollWidth,
                                bodyScrollHeight: document.body.scrollHeight,
                                bodyRectHeight: b.height,
                                docScrollHeight: document.documentElement.scrollHeight
                            }));
                        } catch (e) { }
                    } catch (e) { }
                }
                function afterImages() {
                    var imgs = Array.prototype.slice.call(document.images || []);
                    if (!imgs.length) { setTimeout(notify, 80); return; }
                    var pending = imgs.length;
                    function done() {
                        pending--;
                        if (pending <= 0) setTimeout(notify, 120);
                    }
                    imgs.forEach(function (img) {
                        if (img.complete) { done(); return; }
                        img.addEventListener('load', done);
                        img.addEventListener('error', done);
                    });
                }
                if (document.readyState === 'complete') afterImages();
                else window.addEventListener('load', afterImages);
            })();
            </script>
        """.trimIndent()
        return if (html.contains("</body>", ignoreCase = true)) {
            html.replace("</body>", "$script</body>", ignoreCase = true)
        } else {
            html + script
        }
    }

    /** Salva uma cópia em Downloads (ou na pasta do app quando o Android não permite). */
    suspend fun saveToDownloads(context: Context, file: File, displayName: String): String? =
        withContext(Dispatchers.IO) {
            runCatching {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, displayName)
                        put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
                        put(MediaStore.Downloads.IS_PENDING, 1)
                    }
                    val resolver = context.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: return@runCatching null
                    resolver.openOutputStream(uri)?.use { output ->
                        file.inputStream().use { input -> input.copyTo(output) }
                    }
                    values.clear()
                    values.put(MediaStore.Downloads.IS_PENDING, 0)
                    resolver.update(uri, values, null, null)
                    "Downloads/$displayName"
                } else {
                    val downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    downloads.mkdirs()
                    val target = File(downloads, displayName)
                    file.copyTo(target, overwrite = true)
                    target.absolutePath
                }
            }.getOrElse {
                val dir = File(context.getExternalFilesDir(null) ?: context.filesDir, "laudos").apply { mkdirs() }
                val target = File(dir, displayName)
                file.copyTo(target, overwrite = true)
                target.absolutePath
            }
        }

    fun sharePdf(context: Context, file: File, title: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Compartilhar laudo em PDF"))
    }

    fun fileNameFor(vistoria: Vistoria): String =
        "Laudo_${slug(vistoria)}_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale("pt", "BR")).format(Date())}.pdf"

    private fun slug(vistoria: Vistoria): String {
        val base = vistoria.condominio.ifBlank { vistoria.endereco }.ifBlank { "Vistoria" }
        val normalized = java.text.Normalizer.normalize(base, java.text.Normalizer.Form.NFD)
            .replace(Regex("[\\p{InCombiningDiacriticalMarks}]"), "")
        return normalized.replace(Regex("[^A-Za-z0-9]+"), "_")
            .trim('_')
            .take(40)
            .ifBlank { "Vistoria" }
    }

    private fun safeFileName(name: String): String =
        name.replace(Regex("[^A-Za-z0-9._-]+"), "_").take(80).ifBlank { "laudo.pdf" }

    private const val BRIDGE_NAME = "AndroidBridge"
}
