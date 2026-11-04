package com.imobweb.app.util

import com.imobweb.app.model.Checklist
import com.imobweb.app.model.Medidores
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.TipoVistoria
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Identidade visual do laudo (Configurações). */
data class LaudoOptions(
    val empresaNome: String = "",
    val watermarkText: String? = null,
    /** data URL da imagem (logo) usada como marca d'água */
    val watermarkImage: String? = null
)

/**
 * Gera o laudo de vistoria em HTML puro, sem depender do servidor.
 * O mesmo HTML é usado na pré-visualização e na exportação para PDF.
 */
object LaudoHtmlBuilder {

    private val meses = listOf(
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    )

    fun build(vistoria: Vistoria, options: LaudoOptions = LaudoOptions()): String {
        val agora = Date()
        val dataGeracao = SimpleDateFormat("dd/MM/yyyy 'às' HH:mm", Locale("pt", "BR")).format(agora)
        val totalFotos = vistoria.rooms.sumOf { it.photos.size }
        val totalNaoConformidades = vistoria.rooms.sumOf { it.damages.size + it.problems.size }

        return buildString {
            append("<!DOCTYPE html><html lang=\"pt-BR\"><head>")
            append("<meta charset=\"utf-8\">")
            append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">")
            append("<title>Laudo de Vistoria - ${esc(vistoria.condominio.ifBlank { vistoria.endereco })}</title>")
            append(style())
            append(watermarkStyle(options))
            append("</head><body>")

            // ---------- CAPA ----------
            append("<section class=\"cover\">")
            append("<div class=\"brand\"><span class=\"brand-mark\">iW</span><span class=\"brand-name\">imob<b>Web</b></span><span class=\"brand-tag\">VISTORIA</span></div>")
            append("<div class=\"cover-kicker\">TERMO DE VISTORIA DE ${esc(TipoVistoria.label(vistoria.tipoVistoria).uppercase())}</div>")
            append("<h1 class=\"cover-title\">Laudo de<br>Vistoria</h1>")
            append("<div class=\"cover-rule\"></div>")
            append("<div class=\"cover-property\">${esc(vistoria.condominio.ifBlank { vistoria.tipoImovel.ifBlank { "Imóvel" } })}</div>")
            append("<div class=\"cover-address\">${esc(fullAddress(vistoria))}</div>")
            append("<div class=\"cover-date\">${esc(formatDateLong(vistoria.dataLaudo.ifBlank { hoje() }))}</div>")

            append("<div class=\"cover-chips\">")
            append(chip("Vistoria", TipoVistoria.label(vistoria.tipoVistoria)))
            append(chip("Tipo", vistoria.tipoImovel.ifBlank { "—" }))
            append(chip("Finalidade", vistoria.finalidade.ifBlank { "—" }))
            append(chip("Área", vistoria.metragem.ifBlank { "—" }))
            append(chip("Mobiliado", vistoria.mobiliado.ifBlank { "—" }))
            append("</div>")

            append("<div class=\"cover-stats\">")
            append(stat(vistoria.rooms.size.toString(), "Cômodos"))
            append(stat(totalFotos.toString(), "Fotos"))
            append(stat(totalNaoConformidades.toString(), "Não conformidades"))
            append("</div>")

            append("<div class=\"cover-footer\">")
            append("<div><span class=\"label\">Vistoriadora</span><b>${esc(vistoria.vistoriadora.ifBlank { "—" })}</b></div>")
            append("<div><span class=\"label\">Solicitante</span><b>${esc(vistoria.solicitante.ifBlank { "—" })}</b></div>")
            append("<div class=\"cover-generated\">Gerado em ${esc(dataGeracao)}</div>")
            append("</div>")
            append("</section>")

            var n = 0
            fun next(title: String) = "${++n}. $title"

            // ---------- DADOS DO IMÓVEL ----------
            append(section(next("Dados do imóvel")) {
                table(
                    row("Condomínio / Edifício", vistoria.condominio) +
                    row("Endereço", vistoria.endereco) +
                    row("Número", vistoria.numero) +
                    row("Complemento", vistoria.conjApto) +
                    row("Andar", vistoria.andar) +
                    row("Bairro", vistoria.bairro) +
                    row("Cidade / UF", listOf(vistoria.cidade, vistoria.estado).filter { it.isNotBlank() }.joinToString("/")) +
                    row("CEP", vistoria.cep) +
                    row("Tipo de imóvel", vistoria.tipoImovel) +
                    row("Finalidade", vistoria.finalidade) +
                    row("Metragem", vistoria.metragem) +
                    row("Mobiliado", vistoria.mobiliado)
                )
            })

            // ---------- PARTES ----------
            append(section(next("Partes envolvidas")) {
                table(
                    row("Locadora", vistoria.locadora) +
                    row("CPF/CNPJ da locadora", vistoria.locadoraCpf) +
                    row("Telefone da locadora", vistoria.locadoraTelefone) +
                    row("Locatário(a)", vistoria.locatario) +
                    row("CPF/CNPJ do locatário", vistoria.locatarioCpf) +
                    row("Telefone do locatário", vistoria.locatarioTelefone) +
                    row("Vistoriadora", vistoria.vistoriadora) +
                    row("Solicitante", vistoria.solicitante) +
                    row("Tipo de vistoria", TipoVistoria.label(vistoria.tipoVistoria)) +
                    row("Data da vistoria", vistoria.dataLaudo.ifBlank { hoje() })
                )
            })
            // ---------- MEDIDORES E CHAVES ----------
            val medidoresHtml = medidoresTable(vistoria)
            val chaves = vistoria.chaves.filter { it.descricao.isNotBlank() }
            if (medidoresHtml.isNotEmpty() || chaves.isNotEmpty()) {
                append(section(next("Medidores, chaves e acessos")) {
                    buildString {
                        append(medidoresHtml)
                        if (chaves.isNotEmpty()) {
                            append("<h4 class=\"sub-h\">Chaves, controles e acessos entregues</h4>")
                            append("<table class=\"data-table grid\"><thead><tr><th>Item</th><th style=\"width:70px\">Qtd.</th></tr></thead><tbody>")
                            chaves.forEach { append("<tr><td>${esc(it.descricao)}</td><td>${it.quantidade.coerceIn(1, 99)}</td></tr>") }
                            append("<tr><td><b>Total</b></td><td><b>${chaves.sumOf { it.quantidade.coerceIn(1, 99) }}</b></td></tr>")
                            append("</tbody></table>")
                        }
                    }
                })
            }

            // ---------- CÔMODOS ----------
            append("<section class=\"section page-break\">")
            append("<h2>${esc(next("Cômodos e constatações"))}</h2>")
            if (vistoria.rooms.isEmpty()) {
                append("<p class=\"empty\">Nenhum cômodo registrado nesta vistoria.</p>")
            } else {
                vistoria.rooms.forEachIndexed { index, room ->
                    append(roomSection(index + 1, room))
                }
            }
            append("</section>")

            // ---------- NÃO CONFORMIDADES CONSOLIDADAS ----------
            val problemas = vistoria.rooms.flatMap { room ->
                (room.damages.map { "Avaria" to it } + room.problems.map { "Problema" to it })
                    .map { (tipo, texto) -> Triple(room.name, tipo, texto) }
            }
            if (problemas.isNotEmpty()) {
                append(section(next("Resumo de não conformidades")) {
                    buildString {
                        append("<table class=\"data-table\"><thead><tr><th>Cômodo</th><th>Tipo</th><th>Constatação</th></tr></thead><tbody>")
                        problemas.forEach { (comodo, tipo, texto) ->
                            append("<tr><td>${esc(comodo)}</td><td>${esc(tipo)}</td><td>${esc(texto)}</td></tr>")
                        }
                        append("</tbody></table>")
                    }
                })
            }

            // ---------- ESTIMATIVA DE REPAROS ----------
            val reparos = vistoria.reparos.filter { it.descricao.isNotBlank() }
            if (reparos.isNotEmpty()) {
                append(section(next("Estimativa de custo de reparos")) {
                    buildString {
                        append("<table class=\"data-table grid\"><thead><tr><th>Cômodo</th><th>Reparo</th><th style=\"width:150px\">Faixa (R$)</th></tr></thead><tbody>")
                        reparos.forEach { r ->
                            append("<tr><td>${esc(r.comodo)}</td><td>${esc(r.descricao)}")
                            if (r.nota.isNotBlank()) append("<br><span class=\"muted\">${esc(r.nota)}</span>")
                            append("</td><td>${esc(brl(r.min))} – ${esc(brl(r.max))}</td></tr>")
                        }
                        append("<tr><td></td><td><b>Total estimado</b></td><td><b>${esc(brl(reparos.sumOf { it.min }))} – ${esc(brl(reparos.sumOf { it.max }))}</b></td></tr>")
                        append("</tbody></table>")
                        append("<p class=\"muted\">Valores referenciais de mão de obra e material; não constituem orçamento.</p>")
                    }
                })
            }

            // ---------- CONSIDERAÇÕES ----------
            append(section(next("Considerações finais")) {
                if (vistoria.consideracoes.isBlank()) {
                    "<p class=\"empty\">Sem considerações adicionais.</p>"
                } else {
                    "<p class=\"considerations\">${esc(vistoria.consideracoes).replace("\n", "<br>")}</p>"
                } + if (vistoria.emailContestacao.isNotBlank()) {
                    "<p class=\"contest\">Eventuais divergências podem ser contestadas por escrito em até 5 (cinco) dias do recebimento deste laudo, pelo e-mail <b>${esc(vistoria.emailContestacao)}</b>.</p>"
                } else ""
            })

            // ---------- ASSINATURAS ----------
            append("<section class=\"section signatures page-break\">")
            append("<h2>${esc(next("Assinaturas"))}</h2>")
            append("<p class=\"sig-intro\">As partes declaram ter recebido o presente laudo e concordam com as constatações registradas.</p>")
            append("<div class=\"sig-grid\">")
            append(signature(vistoria.locadora, "Locadora", vistoria.signatures.locadora))
            append(signature(vistoria.locatario, "Locatário(a)", vistoria.signatures.locatario))
            append(signature(vistoria.vistoriadora, "Vistoriadora", vistoria.signatures.vistoriadora))
            append("</div>")
            append("<div class=\"sig-place\">${esc(vistoria.cidade.ifBlank { "—" })}, ${esc(formatDateLong(vistoria.dataLaudo.ifBlank { hoje() }))}</div>")
            append("</section>")

            val empresa = options.empresaNome.takeIf { it.isNotBlank() }?.let { "${esc(it)} • " } ?: ""
            append("<footer class=\"doc-footer\">${empresa}Laudo gerado pelo aplicativo imobWeb Vistoria em ${esc(dataGeracao)} • Documento de caráter descritivo, sem valor de perícia judicial.</footer>")
            append("</body></html>")
        }
    }

    private fun roomSection(index: Int, room: RoomData): String = buildString {
        append("<article class=\"room\">")
        append("<div class=\"room-head\"><span class=\"room-number\">${index.toString().padStart(2, '0')}</span>")
        append("<div><h3>${esc(room.name.ifBlank { "Cômodo $index" })}</h3>")
        append("<span class=\"room-meta\">${room.photos.size} foto(s)</span></div></div>")

        val itens = mutableListOf<String>()
        if (room.furniture.isNotEmpty()) itens.add("Móveis: " + room.furniture.joinToString(", "))
        if (room.items.isNotEmpty()) itens.addAll(room.items)
        if (itens.isNotEmpty()) {
            append("<div class=\"block\"><h4>Inventário</h4><ul class=\"bullets\">")
            itens.forEach { append("<li>${esc(it)}</li>") }
            append("</ul></div>")
        }

        if (room.damages.isNotEmpty() || room.problems.isNotEmpty()) {
            append("<div class=\"block\"><h4>Não conformidades</h4><ul class=\"bullets danger\">")
            room.damages.forEach { append("<li><span class=\"tag\">Avaria</span> ${esc(it)}</li>") }
            room.problems.forEach { append("<li><span class=\"tag\">Problema</span> ${esc(it)}</li>") }
            append("</ul></div>")
        }

        val avaliados = Checklist.ITEMS.mapNotNull { item -> room.checklist[item]?.let { item to it } }
        if (avaliados.isNotEmpty()) {
            append("<div class=\"block\"><h4>Estado de conservação</h4><div class=\"cl-grid\">")
            avaliados.forEach { (item, state) ->
                append("<div class=\"cl-item\"><span>${esc(item)}</span><b class=\"cl-${esc(state)}\">${esc(Checklist.label(state))}</b></div>")
            }
            append("</div></div>")
        }

        if (room.observations.isNotBlank()) {
            append("<div class=\"block room-obs\"><h4>Observações</h4><p>${esc(room.observations).replace("\n", "<br>")}</p></div>")
        }

        if (room.photos.isNotEmpty()) {
            append("<div class=\"photo-grid\">")
            room.photos.forEachIndexed { photoIndex, photo ->
                append(photoFigure(photo, photoIndex))
            }
            append("</div>")
        } else {
            append("<p class=\"empty small\">Sem fotos registradas neste cômodo.</p>")
        }
        append("</article>")
    }

    private fun photoFigure(photo: PhotoData, index: Int): String {
        val src = safeImageSrc(photo) ?: return ""
        return buildString {
            append("<figure class=\"photo\">")
            append("<div class=\"photo-frame\">")
            append("<img src=\"$src\" alt=\"${esc(photo.name.ifBlank { "Foto ${index + 1}" })}\">")
            photo.annotations.forEachIndexed { annIndex, ann ->
                val x = ann.x.coerceIn(0.0, 100.0)
                val y = ann.y.coerceIn(0.0, 100.0)
                append("<span class=\"pin\" style=\"left:$x%;top:$y%\">${annIndex + 1}</span>")
                if (ann.label.isNotBlank()) {
                    append("<span class=\"pin-label\" style=\"left:$x%;top:$y%\">${esc(ann.label)}</span>")
                }
            }
            append("</div>")
            append("<figcaption>Fig. ${index + 1} — ${esc(photo.name.ifBlank { "Registro fotográfico" })}</figcaption>")
            append("</figure>")
        }
    }

    private fun section(title: String, content: () -> String): String =
        "<section class=\"section\"><h2>${esc(title)}</h2>${content()}</section>"

    private fun row(label: String, value: String): String =
        if (value.isBlank()) "" else "<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>"

    private fun table(rows: String): String =
        if (rows.isBlank()) "<p class=\"empty\">Não informado.</p>"
        else "<table class=\"data-table\"><tbody>$rows</tbody></table>"

    private fun chip(label: String, value: String): String =
        "<div class=\"chip\"><span>${esc(label)}</span><b>${esc(value)}</b></div>"

    private fun stat(value: String, label: String): String =
        "<div class=\"stat\"><b>${esc(value)}</b><span>${esc(label)}</span></div>"

    private val SAFE_SIG = Regex("^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$")

    private fun signature(name: String, role: String, image: String? = null): String {
        val img = image?.takeIf { SAFE_SIG.matches(it) }?.let { "<img class=\"sig-img\" src=\"$it\" alt=\"Assinatura\">" }
            ?: "<div class=\"sig-space\"></div>"
        return "<div class=\"sig\">$img<div class=\"sig-line\"></div><b>${esc(name.ifBlank { "____________________" })}</b><span>${esc(role)}</span></div>"
    }

    private fun brl(n: Double): String = java.text.NumberFormat.getCurrencyInstance(Locale("pt", "BR")).format(n)

    private val SAFE_WM = Regex("^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$")

    /**
     * Marca d'água repetida em todo o documento (fundo do body em mosaico): aparece em todas
     * as páginas do PDF, mesmo com o recorte por página feito no exportador.
     */
    private fun watermarkStyle(o: LaudoOptions): String {
        val layers = mutableListOf<String>()
        o.watermarkText?.takeIf { it.isNotBlank() }?.let { text ->
            val safe = text.take(40).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")
            val svg = "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='300'><text x='210' y='150' " +
                "text-anchor='middle' transform='rotate(-30 210 150)' font-family='Arial' font-size='28' font-weight='700' " +
                "fill='#0f172a' fill-opacity='0.07'>$safe</text></svg>"
            val b64 = java.util.Base64.getEncoder().encodeToString(svg.toByteArray(Charsets.UTF_8))
            layers += "url(\"data:image/svg+xml;base64,$b64\")"
        }
        o.watermarkImage?.takeIf { SAFE_WM.matches(it) }?.let { layers += "url(\"$it\")" }
        if (layers.isEmpty()) return ""
        val sizes = buildList {
            if (o.watermarkText?.isNotBlank() == true) add("420px 300px")
            if (o.watermarkImage != null && SAFE_WM.matches(o.watermarkImage)) add("220px auto")
        }
        // (a imagem já vem clareada de loadLaudoOptions)
        return "<style>body{background-image:${layers.joinToString(",")};background-repeat:repeat;" +
            "background-size:${sizes.joinToString(",")};background-position:center 0}</style>"
    }

    private fun fmtNum(n: Double): String =
        if (n % 1.0 == 0.0) String.format(Locale("pt", "BR"), "%,.0f", n)
        else String.format(Locale("pt", "BR"), "%,.3f", n).trimEnd('0').trimEnd(',')

    /** Leituras; numa vistoria de saída mostra também entrada e consumo. */
    private fun medidoresTable(v: Vistoria): String {
        val prev = v.medidoresEntrada?.takeIf { it.hasAnyReading() }
        val rows = Medidores.DEFS.mapNotNull { (key, label, unit) ->
            val m = v.medidores.get(key)
            val e = prev?.get(key)
            if (m.numero.isBlank() && m.leitura.isBlank() && (e == null || e.leitura.isBlank())) return@mapNotNull null
            buildString {
                append("<tr><td>${esc(label)}</td><td>${esc(m.numero.ifBlank { e?.numero ?: "" }.ifBlank { "—" })}</td>")
                if (prev != null) append("<td>${esc(e?.leitura?.ifBlank { "—" } ?: "—")}</td>")
                append("<td>${esc(m.leitura.ifBlank { "—" })}${if (m.leitura.isNotBlank()) " $unit" else ""}</td>")
                if (prev != null) {
                    val c = Medidores.consumption(e?.leitura, m.leitura)
                    append("<td>${if (c != null) esc("${fmtNum(c)} $unit") else "—"}</td>")
                }
                append("</tr>")
            }
        }
        if (rows.isEmpty()) return ""
        return buildString {
            append("<h4 class=\"sub-h\">Leitura dos medidores</h4><table class=\"data-table grid\"><thead><tr><th>Medidor</th><th>Nº</th>")
            if (prev != null) append("<th>Entrada</th><th>Saída</th><th>Consumo</th>") else append("<th>Leitura</th>")
            append("</tr></thead><tbody>")
            rows.forEach { append(it) }
            append("</tbody></table>")
        }
    }

    private fun fullAddress(v: Vistoria): String = buildString {
        append(v.endereco.ifBlank { "Endereço não informado" })
        if (v.numero.isNotBlank()) append(", ${v.numero}")
        if (v.conjApto.isNotBlank()) append(" — ${v.conjApto}")
        val cidade = listOf(v.bairro, v.cidade, v.estado).filter { it.isNotBlank() }.joinToString(" • ")
        if (cidade.isNotBlank()) append(" • $cidade")
    }

    private fun safeImageSrc(photo: PhotoData): String? {
        if (photo.dataUrl.startsWith("data:image/") && photo.dataUrl.length < 15_000_000) {
            return photo.dataUrl
        }
        val path = photo.filePath
        if (!path.isNullOrBlank()) {
            val file = java.io.File(path)
            if (file.exists()) {
                val b64 = ImageCompressor.base64FromFile(path)
                if (b64 != null) return b64
            }
        }
        return null
    }

    private fun hoje(): String =
        SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).format(Date())

    private fun formatDateLong(dateStr: String): String {
        if (dateStr.isBlank()) return ""
        val parts = dateStr.split("/")
        if (parts.size == 3) {
            val day = parts[0].toIntOrNull()
            val month = parts[1].toIntOrNull()
            var year = parts[2].toIntOrNull() ?: 0
            if (parts[2].length == 2) year += 2000
            if (day != null && month != null && day in 1..31 && month in 1..12 && year > 0) {
                return "$day de ${meses[month - 1]} de $year"
            }
        }
        return dateStr
    }

    private fun esc(value: String): String = value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;")

    private fun style(): String = """
        <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background: #ffffff; color: #172033; }
            body {
                font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 12px; line-height: 1.55; width: 794px; padding: 42px 48px;
            }
            h1, h2, h3, h4, p, ul { margin: 0; }
            .brand { display: flex; align-items: center; gap: 10px; }
            .brand-mark {
                display: inline-flex; align-items: center; justify-content: center;
                width: 34px; height: 34px; border-radius: 10px;
                background: #2563eb; color: #fff; font-weight: 800; font-size: 14px;
            }
            .brand-name { font-size: 20px; letter-spacing: -.4px; }
            .brand-name b { color: #2563eb; }
            .brand-tag { margin-left: 6px; font-size: 9px; letter-spacing: 2px; color: #64748b; font-weight: 700; }
            .cover { min-height: 1010px; display: flex; flex-direction: column; padding-bottom: 8px; }
            .cover-kicker { margin-top: 84px; font-size: 10px; letter-spacing: 4px; color: #2563eb; font-weight: 800; }
            .cover-title { margin-top: 14px; font-size: 60px; line-height: .98; letter-spacing: -2.5px; color: #0f172a; }
            .cover-rule { width: 68px; height: 5px; background: #2563eb; border-radius: 3px; margin: 26px 0; }
            .cover-property { font-size: 23px; font-weight: 700; color: #0f172a; }
            .cover-address { margin-top: 8px; font-size: 13px; color: #475569; max-width: 560px; }
            .cover-date { margin-top: 18px; font-size: 12px; color: #64748b; text-transform: capitalize; }
            .cover-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
            .chip {
                min-width: 120px; padding: 10px 14px; border-radius: 10px;
                background: #f1f5f9; border: 1px solid #e2e8f0;
            }
            .chip span { display: block; font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #64748b; }
            .chip b { display: block; margin-top: 3px; font-size: 12px; color: #0f172a; }
            .cover-stats { display: flex; gap: 12px; margin-top: 26px; }
            .stat { flex: 1; padding: 14px 16px; border-radius: 12px; background: #0f172a; color: #fff; }
            .stat b { display: block; font-size: 26px; line-height: 1; }
            .stat span { display: block; margin-top: 5px; font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color: #93c5fd; }
            .cover-footer { margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; gap: 44px; align-items: flex-end; }
            .cover-footer .label { display: block; font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #94a3b8; }
            .cover-footer b { font-size: 12px; color: #0f172a; }
            .cover-generated { margin-left: auto; font-size: 9px; color: #94a3b8; }
            .section { margin-top: 34px; }
            .section h2 {
                font-size: 17px; color: #0f172a; padding-bottom: 8px;
                border-bottom: 2px solid #e2e8f0; margin-bottom: 14px;
            }
            .section h2 span { color: #2563eb; margin-right: 6px; }
            .data-table { width: 100%; border-collapse: collapse; }
            .data-table th, .data-table td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #eef2f7; vertical-align: top; }
            .data-table th { width: 34%; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: .6px; font-weight: 600; }
            .data-table td { color: #172033; font-size: 12px; }
            .data-table thead th { background: #f8fafc; color: #475569; }
            .page-break { page-break-before: always; }
            .room { margin-top: 22px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 12px; page-break-inside: avoid; }
            .room-head { display: flex; align-items: center; gap: 12px; }
            .room-number {
                width: 36px; height: 36px; border-radius: 9px; background: #eff6ff; color: #2563eb;
                display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;
            }
            .room-head h3 { font-size: 15px; color: #0f172a; }
            .room-meta { font-size: 10px; color: #64748b; }
            .block { margin-top: 12px; }
            .block h4 { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #475569; margin-bottom: 5px; }
            .bullets { padding-left: 18px; color: #334155; }
            .bullets li { margin: 2px 0; }
            .bullets.danger li { color: #b91c1c; }
            .tag {
                display: inline-block; margin-right: 5px; padding: 1px 5px; border-radius: 4px;
                background: #fee2e2; color: #991b1b; font-size: 8px; font-weight: 700;
                letter-spacing: .5px; text-transform: uppercase;
            }
            .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
            .photo { margin: 0; }
            .photo-frame { position: relative; width: 100%; border-radius: 8px; overflow: hidden; background: #f1f5f9; border: 1px solid #e2e8f0; }
            .photo-frame img { display: block; width: 100%; height: auto; }
            .pin {
                position: absolute; transform: translate(-50%, -50%);
                width: 17px; height: 17px; border-radius: 50%;
                background: #dc2626; color: #fff; border: 1.5px solid #fff;
                font-size: 9px; font-weight: 800; text-align: center; line-height: 15px;
            }
            .pin-label {
                position: absolute; transform: translate(-50%, 10px);
                background: rgba(15, 23, 42, .92); color: #fff;
                font-size: 7px; padding: 2px 4px; border-radius: 3px;
                max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .photo figcaption { margin-top: 4px; font-size: 9px; color: #64748b; }
            .empty { padding: 12px; border-radius: 8px; background: #f8fafc; color: #94a3b8; font-size: 11px; }
            .empty.small { font-size: 10px; margin-top: 12px; }
            .considerations { font-size: 12px; color: #334155; }
            .signatures { margin-top: 48px; }
            .sig-intro { color: #64748b; font-size: 11px; margin-bottom: 26px; }
            .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
            .sig { text-align: center; padding-top: 34px; }
            .sig-line { border-top: 1px solid #94a3b8; margin-bottom: 6px; }
            .muted { color: #64748b; font-size: 10px; }
            .contest { margin-top: 10px; font-size: 11px; color: #334155; }
            .sig-img { display: block; height: 56px; max-width: 100%; margin: 0 auto 4px; object-fit: contain; }
            .sig-space { height: 60px; }
            .sig { padding-top: 0 !important; }
            .sub-h { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #475569; margin: 12px 0 6px; }
            .data-table.grid th { width: auto; }
            .cl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; }
            .cl-item { display: flex; justify-content: space-between; font-size: 11px; border-bottom: 1px dashed #e2e8f0; padding: 2px 0; }
            .cl-item b { font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }
            .cl-ok { color: #047857; } .cl-regular { color: #b45309; } .cl-ruim { color: #b91c1c; } .cl-na { color: #64748b; }
            .room-obs p { font-size: 11px; color: #334155; background: #f1f5f9; border-radius: 8px; padding: 8px 10px; }
            .sig b { display: block; font-size: 10px; color: #0f172a; }
            .sig span { display: block; margin-top: 2px; font-size: 9px; color: #64748b; }
            .sig-place { margin-top: 30px; text-align: right; font-size: 11px; color: #475569; }
            .doc-footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; }
            @media print {
                body { padding: 0; width: auto; }
                .cover { min-height: 250mm; }
            }
        </style>
    """.trimIndent()
}
