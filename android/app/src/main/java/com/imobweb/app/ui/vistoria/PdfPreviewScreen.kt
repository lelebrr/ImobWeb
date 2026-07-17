package com.imobweb.app.ui.vistoria

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfPreviewScreen(
    htmlContent: String,
    title: String = "Laudo de Vistoria",
    onClose: () -> Unit,
    onShare: ((String) -> Unit)? = null
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isSaving by remember { mutableStateOf(false) }
    var webView by remember { mutableStateOf<WebView?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Visualizar Laudo", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(title, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        webView?.let { wv ->
                            wv.evaluateJavascript(
                                "(function() { window.android.savePDF(document.documentElement.outerHTML); })()",
                                null
                            )
                        }
                    }) {
                        Icon(Icons.Default.Download, contentDescription = "Salvar")
                    }
                    IconButton(onClick = {
                        scope.launch {
                            sharePdf(context, htmlContent, title)
                        }
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Compartilhar")
                    }
                    IconButton(onClick = {
                        webView?.let {
                            it.evaluateJavascript("window.print()", null)
                        }
                    }) {
                        Icon(Icons.Default.Print, contentDescription = "Imprimir")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                            }
                        }
                        settings.apply {
                            javaScriptEnabled = true
                            allowFileAccess = true
                            builtInZoomControls = true
                            displayZoomControls = false
                            loadWithOverviewMode = true
                            useWideViewPort = true
                            defaultTextEncodingName = "UTF-8"
                            // Custom handler for Android JavaScript interface
                            addJavascriptInterface(object {
                                @android.webkit.JavascriptInterface
                                fun savePDF(html: String) {
                                    scope.launch {
                                        savePdfToDevice(context, htmlContent, title)
                                    }
                                }
                            }, "android")
                        }
                        loadDataWithBaseURL(
                            "file:///android_asset/",
                            wrapHtmlForMobile(htmlContent),
                            "text/html",
                            "UTF-8",
                            null
                        )
                        webView = this
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (isSaving) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Card {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator()
                            Spacer(Modifier.height(12.dp))
                            Text("Salvando PDF...")
                        }
                    }
                }
            }
        }
    }
}

private fun wrapHtmlForMobile(html: String): String {
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                line-height: 1.5;
                color: #1a1a1a;
                padding: 12px;
                background: white;
            }
            .cover-page { display: block !important; height: auto !important; padding: 20px 0; }
            .photo-grid { grid-template-columns: 1fr !important; }
            .photo-container { margin-bottom: 8px; }
            .photo-img { width: 100%; height: auto; }
            .photo-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            .info-grid { grid-template-columns: 1fr !important; }
            .signature-page { padding-top: 10px; }
            .room-section { margin-bottom: 16px; }
            @media (min-width: 600px) {
                .photo-grid { grid-template-columns: repeat(2, 1fr) !important; }
                .info-grid { grid-template-columns: 1fr 1fr !important; }
            }
        </style>
    </head>
    <body>$html</body>
    </html>
    """.trimIndent()
}

private suspend fun savePdfToDevice(context: Context, html: String, title: String) {
    withContext(Dispatchers.IO) {
        try {
            val filename = "Laudo_Vistoria_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale("pt", "BR")).format(Date())}.html"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, filename)
                    put(MediaStore.Downloads.MIME_TYPE, "text/html")
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }
                val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                uri?.let {
                    context.contentResolver.openOutputStream(it)?.use { out ->
                        out.write(wrapHtmlForMobile(html).toByteArray(Charsets.UTF_8))
                    }
                    values.clear()
                    values.put(MediaStore.Downloads.IS_PENDING, 0)
                    context.contentResolver.update(it, values, null, null)
                }
            } else {
                val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(dir, filename)
                FileOutputStream(file).use { it.write(wrapHtmlForMobile(html).toByteArray(Charsets.UTF_8)) }
            }
            withContext(Dispatchers.Main) {
                Toast.makeText(context, "Laudo salvo em Downloads/$filename", Toast.LENGTH_LONG).show()
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                Toast.makeText(context, "Erro ao salvar: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

private suspend fun sharePdf(context: Context, html: String, title: String) {
    withContext(Dispatchers.IO) {
        try {
            val cacheDir = File(context.cacheDir, "share")
            cacheDir.mkdirs()
            val file = File(cacheDir, "laudo_vistoria.html")
            FileOutputStream(file).use { it.write(wrapHtmlForMobile(html).toByteArray(Charsets.UTF_8)) }

            val uri = androidx.core.content.FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/html"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, title)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            withContext(Dispatchers.Main) {
                context.startActivity(Intent.createChooser(intent, "Compartilhar Laudo"))
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                Toast.makeText(context, "Erro ao compartilhar: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
