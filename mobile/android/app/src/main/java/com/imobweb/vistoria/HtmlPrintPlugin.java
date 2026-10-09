package com.imobweb.vistoria;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Imprime / salva em PDF um arquivo HTML (o laudo) usando a tela de impressão do Android,
 * que já oferece "Salvar como PDF". O HTML chega como arquivo no cache (não pela ponte),
 * porque laudos com fotos podem ter dezenas de MB.
 */
@CapacitorPlugin(name = "HtmlPrint")
public class HtmlPrintPlugin extends Plugin {

    // Mantém a WebView de impressão viva até o spooler terminar de ler o documento
    private WebView printView;

    @PluginMethod
    public void print(final PluginCall call) {
        final String path = call.getString("path");
        final String name = call.getString("name", "laudo");
        if (path == null || path.isEmpty()) {
            call.reject("Arquivo não informado");
            return;
        }

        final String html;
        try {
            html = readFile(path, getContext().getCacheDir());
        } catch (Exception e) {
            call.reject("Não foi possível ler o laudo: " + e.getMessage());
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                final Context ctx = getActivity();
                if (printView != null) {
                    printView.destroy();
                    printView = null;
                }
                final boolean[] done = {false};
                final WebView view = new WebView(ctx);
                view.getSettings().setJavaScriptEnabled(false);
                view.getSettings().setAllowFileAccess(false);
                view.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView v, String url) {
                        if (done[0]) return;
                        done[0] = true;
                        try {
                            PrintManager pm = (PrintManager) ctx.getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter adapter = v.createPrintDocumentAdapter(name);
                            PrintAttributes attrs = new PrintAttributes.Builder()
                                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                    .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                    .build();
                            pm.print(name, adapter, attrs);
                            call.resolve(new JSObject().put("started", true));
                        } catch (Exception e) {
                            call.reject("Falha ao abrir a impressão: " + e.getMessage());
                        }
                    }
                });
                printView = view;
                view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("Falha ao preparar a impressão: " + e.getMessage());
            }
        });
    }

    private static String readFile(String uri, File allowedDir) throws Exception {
        String p = uri.startsWith("file://") ? uri.substring(7) : uri;
        File f = new File(p).getCanonicalFile();
        // segurança: só arquivos criados pelo próprio app no cache
        if (!f.getPath().startsWith(allowedDir.getCanonicalPath() + File.separator)) {
            throw new SecurityException("arquivo fora do cache do app");
        }
        try (InputStream in = new FileInputStream(f); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return out.toString(StandardCharsets.UTF_8.name());
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (printView != null) {
            printView.destroy();
            printView = null;
        }
        super.handleOnDestroy();
    }
}
