package com.imobweb.app.util

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class PdfScaleProbeTest {

    @Test
    fun geraCaixaDeReferencia() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val html = """
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background:#ffffff">
              <div style="width:794px;height:100px;background:#ff0000"></div>
              <div style="width:100px;height:100px;background:#00ff00"></div>
            </body></html>
        """.trimIndent()
        val pdf = ReportPdfExporter.exportHtml(context, html, "sonda.pdf")
        println("PDF sonda: ${pdf.absolutePath} (${pdf.length()} bytes)")
    }
}
