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

    /** Altura total medida e os pontos de quebra de página (px físicos, começando em 0). */
    private data class PageLayout(val heightPx: Int, val breaksPx: List<Int>)

    suspend fun exportHtml(context: Context, html: String, fileName: String): File =
        withContext(Dispatchers.Main) {
            val spec = renderSpec(context.resources.displayMetrics.density)
            val webView = createWebView(context, spec.widthPx)
            try {
                val layout = loadAndMeasure(
                    webView,
                    injectReadyScript(html, spec.pageHeightPx),
                    spec.pageHeightPx
                )
                renderPdf(webView, layout, spec, context, fileName)
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
        layout: PageLayout,
        spec: RenderSpec,
        context: Context,
        fileName: String
    ): File {
        val contentHeightPx = layout.heightPx
        webView.measure(
            View.MeasureSpec.makeMeasureSpec(spec.widthPx, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(contentHeightPx, View.MeasureSpec.EXACTLY)
        )
        webView.layout(0, 0, spec.widthPx, contentHeightPx)
        awaitMainLoop()
        // Dá tempo para o Chromium pintar a camada de software antes de desenhar.
        kotlinx.coroutines.delay(300)

        // Quebras calculadas no HTML (não cortam fotos, linhas nem cabeçalhos e respeitam
        // .page-break). Sem elas, cai no fatiamento por altura fixa de A4.
        val starts = layout.breaksPx
            .filter { it in 0 until contentHeightPx }
            .distinct()
            .sorted()
            .ifEmpty {
                val pages = ceil(contentHeightPx.toDouble() / spec.pageHeightPx).toInt().coerceAtLeast(1)
                (0 until pages).map { it * spec.pageHeightPx }
            }
            .let { if (it.first() != 0) listOf(0) + it else it }

        val document = PdfDocument()
        try {
            starts.forEachIndexed { index, start ->
                val end = (starts.getOrNull(index + 1) ?: contentHeightPx)
                    .coerceAtMost(start + spec.pageHeightPx)
                val sliceHeightPt = ((end - start) * spec.scale).coerceIn(1f, PAGE_HEIGHT_PT.toFloat())
                val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH_PT, PAGE_HEIGHT_PT, index + 1).create()
                val page = document.startPage(pageInfo)
                val canvas = page.canvas
                canvas.drawColor(Color.WHITE)
                canvas.save()
                canvas.clipRect(0f, 0f, PAGE_WIDTH_PT.toFloat(), sliceHeightPt)
                canvas.scale(spec.scale, spec.scale)
                canvas.translate(0f, -start.toFloat())
                webView.draw(canvas)
                canvas.restore()
                document.finishPage(page)
            }
            val pages = starts.size

            val dir = File(context.cacheDir, "share").apply { mkdirs() }
            val file = File(dir, safeFileName(fileName))
            FileOutputStream(file).use { document.writeTo(it) }
            Log.d(TAG, "PDF com $pages página(s): ${file.length()} bytes")
            return file
        } finally {
            document.close()
        }
    }

    private suspend fun loadAndMeasure(webView: WebView, html: String, minHeightPx: Int): PageLayout =
        suspendCancellableCoroutine { continuation ->
            val mainHandler = Handler(Looper.getMainLooper())
            val finished = AtomicBoolean(false)

            fun finish(heightCss: Int, pixelRatio: Double = 1.0, breaksCss: List<Double> = emptyList()) {
                val height = (heightCss * pixelRatio).roundToInt()
                if (finished.compareAndSet(false, true) && continuation.isActive) {
                    Log.d(TAG, "Conteúdo medido: ${height}px físicos (${heightCss}px CSS @ ${pixelRatio}x), ${breaksCss.size} página(s)")
                    continuation.resume(
                        PageLayout(
                            heightPx = height.coerceAtLeast(minHeightPx),
                            breaksPx = breaksCss.map { (it * pixelRatio).roundToInt() }
                        )
                    )
                }
            }

            val bridge = object {
                @JavascriptInterface
                fun onReady(height: Double, viewportWidth: Double, pixelRatio: Double) {
                    mainHandler.post { finish(height.toInt(), pixelRatio) }
                }

                @JavascriptInterface
                fun onLayout(height: Double, pixelRatio: Double, breaksCsv: String) {
                    val breaks = breaksCsv.split(",").mapNotNull { it.trim().toDoubleOrNull() }
                    Log.d(TAG, "JS onLayout: altura=$height dpr=$pixelRatio quebras=${breaks.size}")
                    mainHandler.post { finish(height.toInt(), pixelRatio, breaks) }
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

    private fun injectReadyScript(html: String, pageHeightPx: Int): String {
        val script = """
            <script>
            (function () {
                var PAGE_PX = $pageHeightPx;
                // Blocos que não devem ser cortados entre duas páginas
                var KEEP = '.photo, .room-head, .block, .sig, .stat, .chip, li, tr, p, h1, h2, h3, h4, img';
                var KEEP_WITH_NEXT = '.room, .room-head, h2, h3';
                var ORPHAN_PX = 160;
                function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }
                function breaks(total, page) {
                    var forced = Array.prototype.map.call(document.querySelectorAll('.page-break'), docTop);
                    var blocks = Array.prototype.map.call(document.querySelectorAll(KEEP), function (el) {
                        var r = el.getBoundingClientRect();
                        return [r.top + window.scrollY, r.bottom + window.scrollY];
                    }).filter(function (b) { return b[1] - b[0] < page * 0.9; });
                    // Títulos e início de cômodo não ficam sozinhos no pé da página
                    var heads = Array.prototype.map.call(document.querySelectorAll(KEEP_WITH_NEXT), docTop);
                    var out = [0], start = 0, guard = 0;
                    while (start + page < total - 1 && guard++ < 500) {
                        var limit = start + page, cut = limit;
                        forced.forEach(function (f) { if (f > start + 20 && f < cut) cut = f; });
                        if (cut === limit) {
                            for (var pass = 0; pass < 25; pass++) {
                                var moved = false;
                                blocks.forEach(function (b) {
                                    if (b[0] < cut && b[1] > cut && b[0] > start + page * 0.3) { cut = b[0]; moved = true; }
                                });
                                if (!moved) break;
                            }
                            heads.forEach(function (t) {
                                if (t > start + page * 0.3 && t < cut && cut - t < ORPHAN_PX) cut = t;
                            });
                        }
                        out.push(cut);
                        start = cut;
                    }
                    return out;
                }
                function notify() {
                    try {
                        var h = Math.max(
                            document.body.scrollHeight, document.body.offsetHeight,
                            document.documentElement.scrollHeight, document.documentElement.offsetHeight
                        );
                        var dpr = window.devicePixelRatio || 1;
                        try {
                            AndroidBridge.onLayout(h, dpr, breaks(h, PAGE_PX / dpr).join(','));
                        } catch (e) {
                            AndroidBridge.onReady(h, window.innerWidth, dpr);
                        }
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
