package com.imobweb.app.util

import com.imobweb.app.model.Checklist
import com.imobweb.app.model.FurnitureDetail
import com.imobweb.app.model.Medidores
import com.imobweb.app.model.PartyListHelper
import com.imobweb.app.model.PartyPerson
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.TipoVistoria
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Identidade visual e template estrutural do laudo. */
data class LaudoOptions(
    val empresaNome: String = "",
    val watermarkText: String? = null,
    /** data URL da imagem (logo) usada como marca d'água */
    val watermarkImage: String? = null,
    val template: PdfTemplateConfig = PdfTemplateCatalog.defaultTemplate
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
        val t = PdfTemplateCatalog.sanitize(options.template)
        val agora = Date()
        val dataGeracao = SimpleDateFormat("dd/MM/yyyy 'às' HH:mm", Locale("pt", "BR")).format(agora)
        val totalFotos = vistoria.rooms.sumOf { it.photos.size }
        val totalMoveis = vistoria.rooms.sumOf { r -> maxOf(r.furnitureDetails.size, r.furniture.size) }
        val totalNaoConformidades = vistoria.rooms.sumOf { it.damages.size + it.problems.size }
        val pageBreakCls = if (t.compactFlow) "" else " page-break"
        val customTitle = t.customHeaderTitle.takeIf { it.isNotBlank() }

        return buildString {
            append("<!DOCTYPE html><html lang=\"pt-BR\"><head>")
            append("<meta charset=\"utf-8\">")
            append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">")
            append("<title>${esc(customTitle ?: "Laudo de Vistoria")} - ${esc(vistoria.condominio.ifBlank { vistoria.endereco })}</title>")
            append(style(t))
            append(watermarkStyle(options))
            append("</head><body>")

            val coverTitleHtml = customTitle?.let { esc(it).replace("\n", "<br>") } ?: "Laudo de<br>Vistoria"
            val locadoresList = PartyListHelper.parseNonBlank(vistoria.locadora, vistoria.locadoraCpf)
            val locatariosList = PartyListHelper.parseNonBlank(vistoria.locatario, vistoria.locatarioCpf)
            val locadorTitle = (vistoria.locadorTipo.ifBlank {
                if (locadoresList.size > 1) "Locadores" else "Locador"
            }).uppercase()
            val locatarioTitle = (vistoria.locatarioTipo.ifBlank {
                if (locatariosList.size > 1) "Locatários" else "Locatário"
            }).uppercase()
            val condoHeader = if (vistoria.condominio.isNotBlank()) " no CONDOMÍNIO ${vistoria.condominio.uppercase()}" else ""
            val fotoDate = vistoria.dataFotografia.ifBlank { vistoria.dataLaudo.ifBlank { hoje() } }

            // ---------- CAPA OU CABEÇALHO COMPACTO ----------
            if (t.showCover && t.coverStyle != "none") {
                val coverModifier = when (t.coverStyle) {
                    "judicial" -> " cover-judicial"
                    "minimal" -> " cover-minimal"
                    "luxury" -> " cover-luxury"
                    else -> ""
                }
                val brandTagText = when (t.coverStyle) {
                    "judicial" -> "DOCUMENTO OFICIAL DE VISTORIA"
                    "luxury" -> "VISTORIA ALTO PADRÃO & MOBILIADO"
                    else -> "VISTORIA"
                }
                append("<section class=\"cover$coverModifier\">")
                append("<div class=\"brand\"><span class=\"brand-mark\">iW</span><span class=\"brand-name\">imob<b>Web</b></span><span class=\"brand-tag\">$brandTagText</span></div>")
                append("<div class=\"cover-kicker\">TERMO DE VISTORIA DE ${esc(TipoVistoria.label(vistoria.tipoVistoria).uppercase())}</div>")
                append("<h1 class=\"cover-title\">$coverTitleHtml</h1>")
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
                if (t.coverStyle == "luxury" || totalMoveis > 0) {
                    append(stat(totalMoveis.toString(), "Móveis / Itens"))
                }
                append(stat(totalFotos.toString(), "Fotos"))
                append(stat(totalNaoConformidades.toString(), "Não conformidades"))
                append("</div>")

                append("<div class=\"cover-footer\">")
                append("<div><span class=\"label\">Autor(a) / Vistoriadora</span><b>${esc(vistoria.vistoriadora.ifBlank { "—" })}</b></div>")
                append("<div><span class=\"label\">Fotografado em</span><b>${esc(fotoDate)}</b></div>")
                append("<div><span class=\"label\">Solicitante</span><b>${esc(vistoria.solicitante.ifBlank { "—" })}</b></div>")
                append("<div class=\"cover-generated\">Gerado em ${esc(dataGeracao)}</div>")
                append("</div>")
                append("</section>")
            } else {
                append("<div class=\"compact-banner\">")
                append("<div><div class=\"compact-kicker\">${esc(customTitle ?: "LAUDO DE VISTORIA DE ${TipoVistoria.label(vistoria.tipoVistoria).uppercase()}")}</div>")
                append("<b>${esc(vistoria.condominio.ifBlank { vistoria.tipoImovel.ifBlank { "Imóvel" } })}</b> — ${esc(fullAddress(vistoria))}</div>")
                append("<div class=\"compact-meta\">${esc(vistoria.dataLaudo.ifBlank { hoje() })}<br>${vistoria.rooms.size} cômodo(s) • $totalFotos foto(s)</div>")
                append("</div>")
            }

            // ---------- TERMO DE VISTORIA & CRITÉRIOS ----------
            if (t.showLegalPreamble || t.showCriteriaBox) {
                val preambleBreak = if (!t.showCover || t.coverStyle == "none" || t.compactFlow) "" else " page-break"
                append("<section class=\"section$preambleBreak preamble-section\">")
                if (t.showLegalPreamble) {
                    val locadorPreamble = PartyListHelper.formatPreambleHtml(locadoresList, ::esc)
                    val locatarioPreamble = PartyListHelper.formatPreambleHtml(locatariosList, ::esc)
                    append("<h2 class=\"preamble-title\">Termo de vistoria de ${esc(TipoVistoria.label(vistoria.tipoVistoria).lowercase())}</h2>")
                    append("<p class=\"preamble-text\">")
                    append("O presente anexo faz parte integrante do “Contrato de Locação” do imóvel${esc(condoHeader)} situado na ${esc(fullAddress(vistoria))}, datado de ${esc(vistoria.dataLaudo.ifBlank { hoje() })}, tendo como partes:<br><br>")
                    append("De um lado, na qualidade de <b>${esc(locadorTitle)}</b>: $locadorPreamble.<br>")
                    append("De outro lado, na condição de <b>${esc(locatarioTitle)}</b>: $locatarioPreamble.")
                    append("</p>")

                    append("<p class=\"preamble-legal\">")
                    append("Este laudo de vistoria tem por objetivo retratar o estado de conservação e funcionamento do imóvel na data de sua realização, em atendimento ao disposto no art. 22, inciso V e art. 23, inciso III, ambos da Lei nº 8.245/91 (Lei do Inquilinato). A presente Vistoria foi realizada por observância estética da construção e acabamentos, não se atendo a aspectos estruturais de solidez, fundações e vícios ocultos.")
                    append("</p>")

                    append("<div class=\"property-summary-box\">")
                    append("<div><b>Tipo de imóvel:</b> ${esc(vistoria.tipoImovel.ifBlank { "—" })}</div>")
                    append("<div><b>Finalidade:</b> ${esc(vistoria.finalidade.ifBlank { "—" })}</div>")
                    append("<div><b>Metragem:</b> ${esc(vistoria.metragem.ifBlank { "—" })}</div>")
                    append("<div><b>Mobiliado:</b> ${esc(vistoria.mobiliado.ifBlank { "NÃO" })}</div>")
                    append("<div><b>Fotos:</b> $totalFotos</div>")
                    append("<div><b>Solicitante:</b> ${esc(vistoria.solicitante.ifBlank { "—" })}</div>")
                    append("</div>")
                }

                if (t.showCriteriaBox) {
                    append("<div class=\"criteria-box\">")
                    append("<h3>Critérios de avaliação do estado de conservação do imóvel (aspecto visual):</h3>")
                    append("<ul>")
                    append("<li><b>- Novo estado:</b> primeiro uso.</li>")
                    append("<li><b>- Ótimo estado:</b> semi novo, sem avarias.</li>")
                    append("<li><b>- Bom estado:</b> com uso, podendo conter: leves manchas, riscos, trincas, desgaste e furos.</li>")
                    append("<li><b>- Estado regular:</b> podendo conter: gotejamento, trincas, manchas e desgastes em grandes proporções.</li>")
                    append("<li><b>- Estado ruim:</b> danos graves, podendo conter: infiltração, rachaduras, danificações, pragas e vazamento.</li>")
                    append("</ul>")
                    append("</div>")
                }
                append("</section>")
            }

            // ---------- SUMÁRIO CLICÁVEL ----------
            if (vistoria.rooms.isNotEmpty()) {
                append("<section class=\"section toc-section\">")
                append("<h2>Sumário <span class=\"toc-hint\">(clique no cômodo desejado)</span></h2>")
                append("<ul class=\"toc-list\">")
                vistoria.rooms.forEachIndexed { idx, room ->
                    val rName = room.name.ifBlank { "Cômodo ${idx + 1}" }
                    val meta = buildString {
                        append("${room.photos.size} foto(s)")
                        val mc = maxOf(room.furnitureDetails.size, room.furniture.size)
                        if (mc > 0) append(" • $mc item(ns)")
                    }
                    append("<li><a href=\"#room-${idx + 1}\"><span class=\"toc-label\">${idx + 1} - ${esc(rName)}</span><span class=\"toc-dots\"></span><span class=\"toc-meta\">$meta</span></a></li>")
                }
                if (t.showConsiderations) {
                    append("<li><a href=\"#consideracoes-finais\"><span class=\"toc-label\">Considerações finais e Contestação</span><span class=\"toc-dots\"></span><span class=\"toc-meta\">Termo</span></a></li>")
                }
                append("</ul>")
                append("</section>")
            }

            var n = 0
            fun next(title: String) = "${++n}. $title"

            // ---------- DADOS DO IMÓVEL ----------
            if (t.showPropertyTable) {
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
            }

            // ---------- PARTES ----------
            if (t.showPartiesTable) {
                append(section(next("Partes envolvidas")) {
                    table(
                        row(vistoria.locadorTipo.ifBlank { "Locador" }, PartyListHelper.displayNames(vistoria.locadora)) +
                        row("CPF/CNPJ do(a) " + vistoria.locadorTipo.ifBlank { "Locador" }.lowercase(), vistoria.locadoraCpf.replace(" | ", " • ")) +
                        row("Telefone do(a) " + vistoria.locadorTipo.ifBlank { "Locador" }.lowercase(), vistoria.locadoraTelefone) +
                        row(vistoria.locatarioTipo.ifBlank { "Locatário" }, PartyListHelper.displayNames(vistoria.locatario)) +
                        row("CPF/CNPJ do(a) " + vistoria.locatarioTipo.ifBlank { "Locatário" }.lowercase(), vistoria.locatarioCpf.replace(" | ", " • ")) +
                        row("Telefone do(a) " + vistoria.locatarioTipo.ifBlank { "Locatário" }.lowercase(), vistoria.locatarioTelefone) +
                        row("Vistoriadora", vistoria.vistoriadora) +
                        row("Solicitante", vistoria.solicitante) +
                        row("Fotografado em", vistoria.dataFotografia) +
                        row("Tipo de vistoria", TipoVistoria.label(vistoria.tipoVistoria)) +
                        row("Data da vistoria", vistoria.dataLaudo.ifBlank { hoje() })
                    )
                })
            }

            // ---------- MEDIDORES E CHAVES ----------
            if (t.showMetersKeys) {
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
            }

            // ---------- QUADRO GERAL DE CONSERVAÇÃO ----------
            if (t.showMasterChecklistOverview && vistoria.rooms.isNotEmpty()) {
                append(section(next("Quadro geral de conservação por cômodo")) {
                    masterOverviewTable(vistoria)
                })
            }

            // ---------- CÔMODOS ----------
            append("<section class=\"section$pageBreakCls\">")
            append("<h2>${esc(next("Cômodos e constatações"))}</h2>")
            if (vistoria.rooms.isEmpty()) {
                append("<p class=\"empty\">Nenhum cômodo registrado nesta vistoria.</p>")
            } else {
                append("<p class=\"section-subkicker\">INDICAÇÃO DO ESTADO DO IMÓVEL, ACESSÓRIOS, SUAS PARTES E COMPONENTES:</p>")
                vistoria.rooms.forEachIndexed { index, room ->
                    append(roomSection(index + 1, room, t))
                }
            }
            append("</section>")

            // ---------- NÃO CONFORMIDADES CONSOLIDADAS ----------
            if (t.showConsolidatedDamages) {
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
            }

            // ---------- ESTIMATIVA DE REPAROS ----------
            if (t.showRepairsEstimate) {
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
            }

            // ---------- CONSIDERAÇÕES & CONTESTAÇÃO ----------
            if (t.showConsiderations) {
                append("<section id=\"consideracoes-finais\" class=\"section\"><h2>${esc(next("Considerações finais"))}</h2>")
                if (vistoria.consideracoes.isBlank()) {
                    append("<p class=\"empty\">Sem considerações adicionais.</p>")
                } else {
                    append("<p class=\"considerations\">${esc(vistoria.consideracoes).replace("\n", "<br>")}</p>")
                }
                if (vistoria.rooms.isNotEmpty() || vistoria.consideracoes.isNotBlank() || vistoria.emailContestacao.isNotBlank()) {
                    append("<div class=\"legal-closing\">")
                    append("<p><u>As fotos poderão ser utilizadas como forma de comprovação do real estado do imóvel se caso o laudo escrito não o relate.</u></p>")
                    append("<p><b>${esc(locatarioTitle)}</b> responsabiliza(m)-se pela conservação do imóvel, comprometendo-se a restituí-lo a(o)(s) <b>${esc(locadorTitle)}</b> nas mesmas condições declaradas acima.</p>")
                    append("<p>Este laudo retrata o estado do imóvel no momento da vistoria. Caso algo não esteja relatado na forma de texto, mas visível nas fotos, as mesmas poderão ser utilizadas para efeitos de comprovação das características e estado de conservação.</p>")
                    append("<p>Em caso de necessidade de manutenção, troca, conserto, reparo ou retirada de itens do imóvel, tratar diretamente entre as partes ou entre a administradora e o proprietário para que seja oficializado via e-mail. Alterações serão feitas no laudo desde que estejam dentro do prazo de contestação.</p>")
                    append("<p><b>${esc(locatarioTitle)}</b> e <b>${esc(locadorTitle)}</b> terão até <b>10 (dez) dias</b> corridos a contar da data do recebimento para contestar algum item da vistoria para possível verificação, alteração ou reparo, caso haja.</p>")
                    append("</div>")
                    append("<div class=\"contest-box\">")
                    append("<h4>CONTESTAÇÃO</h4>")
                    append("<p>Caso identifique divergência entre o relatório e o estado atual do imóvel, poderá contestar observando os seguintes pré-requisitos:</p>")
                    append("<ol>")
                    append("<li>Verifique o prazo de contestação da vistoria. Serão aceitas contestações apenas dentro do prazo previsto (10 dias corridos);</li>")
                    append("<li>Verifique no registro textual e no arquivo de fotos deste relatório se as divergências já estão identificadas;</li>")
                    append("<li>Caso não estejam, formalize sua contestação via e-mail, apresentando a descrição dos problemas e as fotos para comprovar cada divergência.</li>")
                    append("</ol>")
                    append("<p class=\"contest\">Toda a vistoria está acompanhada de arquivo de fotos enviado por e-mail ou WhatsApp às partes.")
                    if (vistoria.emailContestacao.isNotBlank()) {
                        append("<br><b>Caso haja alguma divergência no relatório, favor enviar para o e-mail ${esc(vistoria.emailContestacao)} para que sejam feitas as devidas alterações.</b>")
                    }
                    append("</p></div>")
                }
                append("</section>")
            }

            // ---------- ASSINATURAS ----------
            if (t.showSignatures) {
                append("<section class=\"section signatures$pageBreakCls\">")
                append("<h2>${esc(next("Assinaturas"))}</h2>")
                append("<p class=\"sig-agreement\">E, assim, por estarem justos e contratados, <b>${esc(locadorTitle)}</b> e <b>${esc(locatarioTitle)}</b>, declaram terem vistoriado o imóvel, firmando o presente instrumento, acompanhado de fotografias, fazendo-o juntamente, para todos os fins e efeitos de direito.</p>")
                append("<div class=\"sig-place\">${esc(vistoria.cidade.ifBlank { "São Paulo" })}, ${esc(formatDateLong(vistoria.dataLaudo.ifBlank { hoje() }))}.</div>")
                append("<div class=\"sig-grid\">")
                if (locadoresList.size <= 1) {
                    append(signature(locadoresList.firstOrNull()?.name ?: vistoria.locadora, locadorTitle, vistoria.signatures.locadora))
                } else {
                    append("<div class=\"sig-group\"><div class=\"sig-group-title\">${esc(locadorTitle)}:</div>")
                    locadoresList.forEachIndexed { idx, p ->
                        append(signature(p.name, locadorTitle, if (idx == 0) vistoria.signatures.locadora else null))
                    }
                    append("</div>")
                }
                if (locatariosList.size <= 1) {
                    append(signature(locatariosList.firstOrNull()?.name ?: vistoria.locatario, locatarioTitle, vistoria.signatures.locatario))
                } else {
                    append("<div class=\"sig-group\"><div class=\"sig-group-title\">${esc(locatarioTitle)}:</div>")
                    locatariosList.forEachIndexed { idx, p ->
                        append(signature(p.name, locatarioTitle, if (idx == 0) vistoria.signatures.locatario else null))
                    }
                    append("</div>")
                }
                if (vistoria.vistoriadora.isNotBlank() || vistoria.signatures.vistoriadora != null) {
                    append(signature(vistoria.vistoriadora, "VISTORIADORA", vistoria.signatures.vistoriadora))
                }
                append("</div>")
                if (t.showWitnesses) {
                    append("<div class=\"sig-grid witnesses\">")
                    append(signature("", "TESTEMUNHA 1 (Nome / CPF)"))
                    append(signature("", "TESTEMUNHA 2 (Nome / CPF)"))
                    append("<div></div>")
                    append("</div>")
                }
                append("</section>")
            }

            val empresa = options.empresaNome.takeIf { it.isNotBlank() }?.let { "${esc(it)} • " } ?: ""
            val footerLead = if (t.customFooterText.isNotBlank()) "${esc(t.customFooterText)} • " else empresa
            append("<footer class=\"doc-footer\">${footerLead}Laudo gerado pelo aplicativo imobWeb Vistoria em ${esc(dataGeracao)} (${esc(t.name)}) • Documento de caráter descritivo, sem valor de perícia judicial.</footer>")
            append("</body></html>")
        }
    }

    private fun masterOverviewTable(vistoria: Vistoria): String = buildString {
        append("<table class=\"furn-table\"><thead><tr>")
        append("<th>Cômodo</th><th>Móveis/Itens</th><th>Fotos</th><th>Avarias</th><th>Itens Avaliados</th><th>Alertas (Regular/Ruim)</th>")
        append("</tr></thead><tbody>")
        vistoria.rooms.forEachIndexed { i, room ->
            val moveisCount = maxOf(room.furnitureDetails.size, room.furniture.size)
            val alerts = room.checklist.filterValues { it == "regular" || it == "ruim" }
                .entries.joinToString(", ") { (k, v) -> "$k (${Checklist.label(v)})" }
                .ifBlank { "Nenhum" }
            append("<tr>")
            append("<td><b>${esc(room.name.ifBlank { "Cômodo ${i + 1}" })}</b></td>")
            append("<td>$moveisCount</td>")
            append("<td>${room.photos.size}</td>")
            append("<td>${room.damages.size + room.problems.size}</td>")
            append("<td>${room.checklist.size}/${Checklist.ITEMS.size}</td>")
            append("<td>${esc(alerts)}</td>")
            append("</tr>")
        }
        append("</tbody></table>")
    }

    private fun roomSection(index: Int, room: RoomData, t: PdfTemplateConfig): String = buildString {
        append("<article id=\"room-$index\" class=\"room\">")
        append("<div class=\"room-head\"><span class=\"room-number\">${index.toString().padStart(2, '0')}</span>")
        append("<div><h3>$index - ${esc(room.name.ifBlank { "Cômodo $index" })}</h3>")
        append("<span class=\"room-meta\">${room.photos.size} foto(s)</span></div></div>")

        if (t.showFurnitureTable && room.furnitureDetails.isNotEmpty()) {
            append("<div class=\"block\"><h4>Mobília, Eletros e Equipamentos Detalhados (${room.furnitureDetails.size})</h4>")
            append("<table class=\"furn-table\"><thead><tr><th>Item</th><th>Qtd</th><th>Marca / Modelo / Descrição</th><th>Estado</th><th>Func.</th><th>Obs. / Avarias</th></tr></thead><tbody>")
            room.furnitureDetails.forEach { d ->
                val obsParts = buildList {
                    if (d.notes.isNotBlank()) add(esc(d.notes))
                    if (d.damages.isNotEmpty()) add("<b>Avarias:</b> ${d.damages.joinToString(", ") { esc(it) }}")
                }
                append("<tr>")
                val catHtml = if (d.category.isNotBlank()) "<br><span class=\"furn-cat\">${esc(d.category)}</span>" else ""
                append("<td><b>${esc(d.name)}</b>$catHtml</td>")
                append("<td>${d.quantity}x</td>")
                append("<td>${esc(d.brandModel).ifBlank { "—" }}</td>")
                append("<td><b class=\"cl-${esc(d.condition)}\">${esc(FurnitureDetail.conditionLabel(d.condition))}</b></td>")
                append("<td>${esc(FurnitureDetail.workingLabel(d.working))}</td>")
                append("<td>${obsParts.joinToString("<br>").ifBlank { "—" }}</td>")
                append("</tr>")
            }
            append("</tbody></table></div>")
        }

        if (t.showSimpleInventory) {
            val extraFurniture = if (t.showFurnitureTable) {
                room.furniture.filter { fn -> room.furnitureDetails.none { it.name.equals(fn, ignoreCase = true) } }
            } else room.furniture
            val itens = mutableListOf<String>()
            if (extraFurniture.isNotEmpty()) itens.add("Móveis/Itens: " + extraFurniture.joinToString(", "))
            if (room.items.isNotEmpty()) itens.addAll(room.items)
            if (itens.isNotEmpty()) {
                append("<div class=\"block\"><h4>Inventário e Descrição</h4><ul class=\"bullets check-bullets\">")
                itens.forEach { append("<li>${esc(it)}</li>") }
                append("</ul></div>")
            }
        }

        if (t.showRoomDamages && (room.damages.isNotEmpty() || room.problems.isNotEmpty())) {
            append("<div class=\"block\"><h4>Não conformidades</h4><ul class=\"bullets danger\">")
            room.damages.forEach { append("<li><span class=\"tag\">Avaria</span> ${esc(it)}</li>") }
            room.problems.forEach { append("<li><span class=\"tag\">Problema</span> ${esc(it)}</li>") }
            append("</ul></div>")
        }

        if (t.showRoomChecklist) {
            val avaliados = Checklist.ITEMS.mapNotNull { item -> room.checklist[item]?.let { item to it } }
            if (avaliados.isNotEmpty()) {
                append("<div class=\"block\"><h4>Estado de conservação</h4><div class=\"cl-grid\">")
                avaliados.forEach { (item, state) ->
                    append("<div class=\"cl-item\"><span>${esc(item)}</span><b class=\"cl-${esc(state)}\">${esc(Checklist.label(state))}</b></div>")
                }
                append("</div></div>")
            }
        }

        if (t.showRoomObservations && room.observations.isNotBlank()) {
            append("<div class=\"block room-obs\"><h4>Observações</h4><p>${esc(room.observations).replace("\n", "<br>")}</p></div>")
        }

        if (t.showPhotos) {
            if (room.photos.isNotEmpty()) {
                append("<div class=\"photo-grid\">")
                room.photos.forEachIndexed { photoIndex, photo ->
                    append(photoFigure(photo, photoIndex, t))
                }
                append("</div>")
            } else {
                append("<p class=\"empty small\">Sem fotos registradas neste cômodo.</p>")
            }
        }
        append("</article>")
    }

    private fun photoFigure(photo: PhotoData, index: Int, t: PdfTemplateConfig): String {
        val src = safeImageSrc(photo) ?: return ""
        return buildString {
            append("<figure class=\"photo\">")
            append("<div class=\"photo-frame\">")
            append("<img src=\"$src\" alt=\"${esc(photo.name.ifBlank { "Foto ${index + 1}" })}\">")
            if (t.showPhotoAnnotations) {
                photo.annotations.forEachIndexed { annIndex, ann ->
                    val x = ann.x.coerceIn(0.0, 100.0)
                    val y = ann.y.coerceIn(0.0, 100.0)
                    append("<span class=\"pin\" style=\"left:$x%;top:$y%\">${annIndex + 1}</span>")
                    if (ann.label.isNotBlank()) {
                        append("<span class=\"pin-label\" style=\"left:$x%;top:$y%\">${esc(ann.label)}</span>")
                    }
                }
            }
            append("</div>")
            val capText = buildString {
                append("Fig. ${index + 1}")
                if (t.showPhotoFurnitureTag && photo.furnitureTag.isNotBlank()) {
                    append(" — [${esc(photo.furnitureTag)}]")
                }
                when {
                    photo.caption.isNotBlank() -> append(" ${esc(photo.caption)}")
                    photo.name.isNotBlank() && !photo.name.equals(photo.furnitureTag, ignoreCase = true) ->
                        append(" — ${esc(photo.name)}")
                    !t.showPhotoFurnitureTag || photo.furnitureTag.isBlank() -> append(" — Registro fotográfico")
                }
                if (t.showPhotoTimestamp && photo.timestamp.isNotBlank()) {
                    append("<br><span class=\"photo-ts\">🕒 ${esc(photo.timestamp)}</span>")
                }
            }
            append("<figcaption>$capText</figcaption>")
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

    private fun style(t: PdfTemplateConfig): String {
        val fontCss = when (t.fontFamily) {
            "serif" -> "Georgia, \"Times New Roman\", Times, serif"
            "mono" -> "\"Courier New\", Consolas, monospace"
            else -> "-apple-system, \"Segoe UI\", Roboto, Arial, sans-serif"
        }
        val accent = t.accentHex
        val secondary = t.secondaryHex
        val cols = t.photosPerRow.coerceIn(1, 4)
        val roomMargin = if (t.compactFlow) "12px" else "22px"
        val roomPad = if (t.compactFlow) "13px" else "18px"
        val secMargin = if (t.compactFlow) "20px" else "34px"
        return """
        <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background: #ffffff; color: #172033; }
            body {
                font-family: $fontCss;
                font-size: 12px; line-height: 1.55; width: 794px; padding: 42px 48px;
            }
            h1, h2, h3, h4, p, ul { margin: 0; }
            .brand { display: flex; align-items: center; gap: 10px; }
            .brand-mark {
                display: inline-flex; align-items: center; justify-content: center;
                width: 34px; height: 34px; border-radius: 10px;
                background: $accent; color: #fff; font-weight: 800; font-size: 14px;
            }
            .brand-name { font-size: 20px; letter-spacing: -.4px; }
            .brand-name b { color: $accent; }
            .brand-tag { margin-left: 6px; font-size: 9px; letter-spacing: 2px; color: #64748b; font-weight: 700; }
            .cover { min-height: 1010px; display: flex; flex-direction: column; padding-bottom: 8px; }
            .cover-judicial { border: 3px double $accent; padding: 34px; border-radius: 4px; }
            .cover-luxury { border-left: 8px solid $accent; padding-left: 24px; }
            .cover-minimal .stat { background: #f8fafc; color: #0f172a; border: 1.5px solid $accent; }
            .cover-minimal .stat span { color: #475569; }
            .cover-kicker { margin-top: 84px; font-size: 10px; letter-spacing: 4px; color: $accent; font-weight: 800; }
            .cover-title { margin-top: 14px; font-size: 60px; line-height: .98; letter-spacing: -2.5px; color: $secondary; }
            .cover-rule { width: 68px; height: 5px; background: $accent; border-radius: 3px; margin: 26px 0; }
            .cover-property { font-size: 23px; font-weight: 700; color: $secondary; }
            .cover-address { margin-top: 8px; font-size: 13px; color: #475569; max-width: 560px; }
            .cover-date { margin-top: 18px; font-size: 12px; color: #64748b; text-transform: capitalize; }
            .cover-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
            .chip {
                min-width: 120px; padding: 10px 14px; border-radius: 10px;
                background: #f1f5f9; border: 1px solid #e2e8f0;
            }
            .chip span { display: block; font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #64748b; }
            .chip b { display: block; margin-top: 3px; font-size: 12px; color: $secondary; }
            .cover-stats { display: flex; gap: 12px; margin-top: 26px; }
            .stat { flex: 1; padding: 14px 16px; border-radius: 12px; background: $secondary; color: #fff; }
            .stat b { display: block; font-size: 26px; line-height: 1; }
            .stat span { display: block; margin-top: 5px; font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color: #cbd5e1; }
            .cover-footer { margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; gap: 44px; align-items: flex-end; }
            .cover-footer .label { display: block; font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #94a3b8; }
            .cover-footer b { font-size: 12px; color: $secondary; }
            .cover-generated { margin-left: auto; font-size: 9px; color: #94a3b8; }
            .compact-banner {
                display: flex; justify-content: space-between; align-items: center; gap: 16px;
                border-bottom: 3px solid $accent; padding-bottom: 12px; margin-bottom: 16px;
            }
            .compact-kicker { font-size: 9px; letter-spacing: 2px; color: $accent; font-weight: 800; }
            .compact-meta { text-align: right; font-size: 10px; color: #475569; white-space: nowrap; }
            .section { margin-top: $secMargin; }
            .section h2 {
                font-size: 17px; color: $secondary; padding-bottom: 8px;
                border-bottom: 2px solid #e2e8f0; margin-bottom: 14px;
            }
            .section h2 span { color: $accent; margin-right: 6px; }
            .data-table { width: 100%; border-collapse: collapse; }
            .data-table th, .data-table td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #eef2f7; vertical-align: top; }
            .data-table th { width: 34%; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: .6px; font-weight: 600; }
            .data-table td { color: #172033; font-size: 12px; }
            .data-table thead th { background: #f8fafc; color: #475569; }
            .furn-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10px; }
            .furn-table th, .furn-table td { text-align: left; padding: 5px 7px; border: 1px solid #e2e8f0; vertical-align: top; }
            .furn-table thead th { background: #f1f5f9; color: #334155; font-size: 9px; text-transform: uppercase; letter-spacing: .4px; font-weight: 700; }
            .furn-cat { font-size: 8.5px; color: #64748b; }
            .photo-ts { font-size: 7.5px; color: #64748b; }
            .page-break { page-break-before: always; }
            .room { margin-top: $roomMargin; padding: $roomPad; border: 1px solid #e2e8f0; border-radius: 12px; page-break-inside: avoid; }
            .room-head { display: flex; align-items: center; gap: 12px; }
            .room-number {
                width: 36px; height: 36px; border-radius: 9px; background: #f1f5f9; color: $accent;
                display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;
            }
            .room-head h3 { font-size: 15px; color: $secondary; }
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
            .photo-grid { display: grid; grid-template-columns: repeat($cols, 1fr); gap: 8px; margin-top: 10px; }
            .witnesses { margin-top: 28px; }
            .photo { margin: 0; }
            .photo-frame { position: relative; width: 100%; border-radius: 6px; overflow: hidden; background: #f1f5f9; border: 1px solid #cbd5e1; }
            .photo-frame img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; }
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
            .photo figcaption { margin-top: 3px; font-size: 8px; color: #475569; text-align: center; }
            .empty { padding: 12px; border-radius: 8px; background: #f8fafc; color: #94a3b8; font-size: 11px; }
            .empty.small { font-size: 10px; margin-top: 12px; }
            .considerations { font-size: 12px; color: #334155; }
            .preamble-section { margin-top: 20px; }
            .preamble-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .preamble-text { font-size: 12px; line-height: 1.6; color: #1e293b; margin-bottom: 12px; text-align: justify; }
            .preamble-legal { font-size: 11px; line-height: 1.5; color: #475569; margin-bottom: 14px; text-align: justify; }
            .property-summary-box {
                display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px;
                background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;
                font-size: 11px; color: #1e293b; margin-bottom: 16px;
            }
            .criteria-box {
                background: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0;
                padding: 12px 14px; margin-bottom: 20px;
            }
            .criteria-box h3 { font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.4px; }
            .criteria-box ul { list-style: none; padding: 0; margin: 0; font-size: 10.5px; line-height: 1.5; color: #334155; }
            .criteria-box li { margin-bottom: 3px; }
            .sig-agreement { font-size: 11.5px; line-height: 1.6; color: #1e293b; margin-bottom: 16px; text-align: justify; }
            .signatures { margin-top: 36px; }
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
            .cl-novo { color: #0284c7; } .cl-otimo { color: #059669; } .cl-ok { color: #047857; } .cl-regular { color: #b45309; } .cl-ruim { color: #b91c1c; } .cl-na { color: #64748b; }
            .room-obs p { font-size: 11px; color: #334155; background: #f1f5f9; border-radius: 8px; padding: 8px 10px; }
            .sig b { display: block; font-size: 10px; color: #0f172a; }
            .sig span { display: block; margin-top: 2px; font-size: 9px; color: #64748b; }
            .sig-place { margin-top: 30px; text-align: right; font-size: 11px; color: #475569; }
            .sig-group { display: flex; flex-direction: column; gap: 14px; }
            .sig-group-title { font-size: 10px; font-weight: 800; color: $secondary; letter-spacing: .8px; text-align: center; }
            .toc-hint { font-size: 11px; font-weight: 400; color: $accent; font-style: italic; }
            .toc-list { list-style: none; padding: 0; margin: 6px 0 0; }
            .toc-list li { margin: 5px 0; }
            .toc-list a { display: flex; align-items: baseline; gap: 6px; text-decoration: none; color: #1e293b; font-size: 11.5px; }
            .toc-label { font-weight: 600; color: $secondary; }
            .toc-dots { flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 4px; }
            .toc-meta { font-size: 10px; color: #64748b; white-space: nowrap; }
            .section-subkicker { font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: $secondary; margin: 4px 0 10px; }
            .check-bullets { list-style: none; padding-left: 4px; }
            .check-bullets li::before { content: "✓ "; font-weight: 700; color: $accent; margin-right: 4px; }
            .legal-closing { margin-top: 12px; font-size: 11px; line-height: 1.55; color: #334155; display: flex; flex-direction: column; gap: 8px; text-align: justify; }
            .contest-box { margin-top: 14px; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-size: 11px; line-height: 1.5; color: #1e293b; }
            .contest-box h4 { font-size: 11px; font-weight: 800; letter-spacing: .8px; text-decoration: underline; margin-bottom: 6px; color: $secondary; }
            .contest-box ol { margin: 6px 0 8px 18px; padding: 0; }
            .doc-footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; }
            @media print {
                body { padding: 0; width: auto; }
                .cover { min-height: 250mm; }
            }
        </style>
    """.trimIndent()
    }
}
