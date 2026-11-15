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
    templateLabel: String? = null,
    onChangeTemplate: (() -> Unit)? = null,
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isBusy by remember { mutableStateOf(false) }
    var busyLabel by remember { mutableStateOf("Gerando PDF...") }
    var webView by remember { mutableStateOf<WebView?>(null) }
    var lastLoadedHtml by remember { mutableStateOf("") }

    fun triggerPrint() {
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
        }
    }

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
                    if (onChangeTemplate != null) {
                        TextButton(onClick = onChangeTemplate) {
                            Icon(Icons.Default.Palette, null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Modelo", fontSize = 12.sp)
                        }
                    }
                    IconButton(onClick = { runExport(share = false) }) {
                        Icon(Icons.Default.Download, contentDescription = "Salvar PDF")
                    }
                    IconButton(onClick = { runExport(share = true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Compartilhar PDF")
                    }
                    IconButton(onClick = {
                        if (webView != null) triggerPrint() else runExport(share = false)
                    }) {
                        Icon(Icons.Default.Print, contentDescription = "Imprimir")
                    }
                }
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = 3.dp,
                shadowElevation = 6.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (onChangeTemplate != null) {
                        OutlinedButton(
                            onClick = onChangeTemplate,
                            modifier = Modifier.fillMaxWidth(),
                            shape = androidx.compose.foundation.shape.RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.Style, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "Modelo PDF: ${templateLabel ?: "Trocar (1 a 9)"}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1
                            )
                            Spacer(Modifier.weight(1f))
                            Text("Trocar", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { runExport(share = false) },
                            modifier = Modifier.weight(1f),
                            enabled = !isBusy
                        ) {
                            Icon(Icons.Default.Download, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Baixar PDF", fontSize = 13.sp)
                        }
                        FilledTonalButton(
                            onClick = { runExport(share = true) },
                            modifier = Modifier.weight(1f),
                            enabled = !isBusy
                        ) {
                            Icon(Icons.Default.Share, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Compartilhar", fontSize = 13.sp)
                        }
                    }
                }
            }
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
                        lastLoadedHtml = htmlContent
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
                update = { view ->
                    if (lastLoadedHtml != htmlContent) {
                        lastLoadedHtml = htmlContent
                        view.loadDataWithBaseURL(
                            "file:///android_asset/",
                            previewHtml(htmlContent),
                            "text/html",
                            "UTF-8",
                            null
                        )
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
                .photo-grid { gap: 6px !important; }
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
