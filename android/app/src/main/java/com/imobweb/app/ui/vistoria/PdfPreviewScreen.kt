package com.imobweb.app.ui.vistoria

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
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.imobweb.app.util.ReportPdfExporter
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfPreviewScreen(
    htmlContent: String,
    title: String = "Laudo de Vistoria",
    fileName: String = "Laudo_Vistoria.pdf",
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isBusy by remember { mutableStateOf(false) }
    var busyLabel by remember { mutableStateOf("Gerando PDF...") }
    var webView by remember { mutableStateOf<WebView?>(null) }

    fun runExport(share: Boolean) {
        if (isBusy) return
        scope.launch {
            isBusy = true
            busyLabel = if (share) "Preparando compartilhamento..." else "Gerando PDF..."
            runCatching {
                val pdf = ReportPdfExporter.exportHtml(context, htmlContent, fileName)
                if (share) {
                    ReportPdfExporter.sharePdf(context, pdf, title)
                    null
                } else {
                    ReportPdfExporter.saveToDownloads(context, pdf, fileName)
                }
            }.onSuccess { path ->
                if (!share) {
                    Toast.makeText(
                        context,
                        if (path != null) "PDF salvo em $path" else "Não foi possível salvar o PDF",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }.onFailure { error ->
                Toast.makeText(context, "Erro: ${error.message}", Toast.LENGTH_LONG).show()
            }
            isBusy = false
        }
    }

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
                    IconButton(onClick = { runExport(share = false) }) {
                        Icon(Icons.Default.Download, contentDescription = "Salvar PDF")
                    }
                    IconButton(onClick = { runExport(share = true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Compartilhar PDF")
                    }
                    IconButton(onClick = {
                        val printManager = context.getSystemService(android.content.Context.PRINT_SERVICE) as? android.print.PrintManager
                        val printAdapter = webView?.createPrintDocumentAdapter(fileName)
                        if (printManager != null && printAdapter != null) {
                            printManager.print(
                                fileName.removeSuffix(".pdf"),
                                printAdapter,
                                android.print.PrintAttributes.Builder()
                                    .setMediaSize(android.print.PrintAttributes.MediaSize.ISO_A4)
                                    .build()
                            )
                        } else {
                            runExport(share = false)
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
                        }
                        loadDataWithBaseURL(
                            "file:///android_asset/",
                            previewHtml(htmlContent),
                            "text/html",
                            "UTF-8",
                            null
                        )
                        webView = this
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (isBusy) {
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
                            Text(busyLabel)
                        }
                    }
                }
            }
        }
    }
}

private fun previewHtml(html: String): String {
    if (html.contains("<html", ignoreCase = true)) {
        return html.replace(
            "</head>",
            """
            <style>
                body { width: auto !important; padding: 8px !important; font-size: 11px; }
                .photo-grid { grid-template-columns: 1fr !important; }
                .cover { min-height: auto !important; }
                .cover-kicker { margin-top: 24px !important; }
                .cover-title { font-size: 40px !important; }
                .sig-grid { grid-template-columns: 1fr !important; }
                .page-break { page-break-before: auto !important; }
            </style>
            </head>
            """.trimIndent(),
            ignoreCase = true
        )
    }
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px; line-height: 1.5; color: #1a1a1a;
                padding: 12px; background: white;
            }
            .photo-grid { grid-template-columns: 1fr !important; }
            .info-grid { grid-template-columns: 1fr !important; }
        </style>
    </head>
    <body>$html</body>
    </html>
    """.trimIndent()
}
