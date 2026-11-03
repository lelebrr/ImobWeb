package com.imobweb.app.util

import com.imobweb.app.model.Checklist
import com.imobweb.app.model.Medidores
import com.imobweb.app.model.RoomData
import com.imobweb.app.model.Vistoria
import java.text.Normalizer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Comparativo entre a vistoria de ENTRADA e a de SAÍDA (mesma regra do sistema web,
 * `_lib/compare.ts`): cômodos casados pelo nome, avarias novas/resolvidas, móveis
 * não encontrados, piora no checklist, além de consumo dos medidores e chaves.
 */
object CompareBuilder {

    data class ChecklistChange(
        val item: String,
        val before: String?,
        val after: String?,
        val worsened: Boolean,
        val improved: Boolean
    )

    enum class Status(val label: String) {
        SEM_ALTERACAO("Sem alterações"),
        ALTERADO("Alterações menores"),
        PIOROU("Deterioração identificada"),
        SEM_SAIDA("Sem registro de saída"),
        NOVO("Cômodo novo na saída")
    }

    data class RoomComparison(
        val name: String,
        val entrada: RoomData?,
        val saida: RoomData?,
        val newDamages: List<String>,
        val resolvedDamages: List<String>,
        val missingFurniture: List<String>,
        val newFurniture: List<String>,
        val checklist: List<ChecklistChange>,
        val worsened: Int,
        val status: Status
    )

    data class MeterRow(val label: String, val unit: String, val entrada: String, val saida: String, val consumo: Double?)
    data class KeyRow(val descricao: String, val entrada: Int, val saida: Int)

    data class Totals(
        val newDamages: Int,
        val worsened: Int,
        val missingFurniture: Int,
        val roomsWithIssues: Int,
        val roomsMissingExit: Int
    )

    data class Comparison(
        val rooms: List<RoomComparison>,
        val totals: Totals,
        val meters: List<MeterRow>,
        val keys: List<KeyRow>
    ) {
        val missingKeys: Int get() = keys.sumOf { (it.entrada - it.saida).coerceAtLeast(0) }
    }

    fun normalizeName(s: String): String =
        Normalizer.normalize(s, Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .replace(Regex("[^a-zA-Z0-9]+"), " ")
            .trim()
            .lowercase()

    private fun diff(a: List<String>, b: List<String>): List<String> {
        val nb = b.map { normalizeName(it) }.toSet()
        return a.filter { normalizeName(it) !in nb }
    }

    fun compare(entrada: Vistoria, saida: Vistoria): Comparison {
        data class Pair2(val name: String, var e: RoomData? = null, var s: RoomData? = null)
        val map = LinkedHashMap<String, Pair2>()
        entrada.rooms.forEach { map[normalizeName(it.name)] = Pair2(it.name, e = it) }
        saida.rooms.forEach { r ->
            val k = normalizeName(r.name)
            val cur = map[k]
            if (cur != null) cur.s = r else map[k] = Pair2(r.name, s = r)
        }

        val rooms = map.values.map { (name, e, s) ->
            val newDamages = if (s != null) diff(s.damages + s.problems, (e?.damages ?: emptyList()) + (e?.problems ?: emptyList())) else emptyList()
            val resolvedDamages = if (e != null && s != null) diff(e.damages + e.problems, s.damages + s.problems) else emptyList()
            val missingFurniture = if (e != null && s != null) diff(e.furniture, s.furniture) else emptyList()
            val newFurniture = if (e != null && s != null) diff(s.furniture, e.furniture) else emptyList()
            val checklist = mutableListOf<ChecklistChange>()
            if (e != null && s != null) {
                for (item in Checklist.ITEMS) {
                    val before = e.checklist[item]
                    val after = s.checklist[item]
                    if (before == null && after == null) continue
                    val rb = Checklist.rank(before)
                    val ra = Checklist.rank(after)
                    val worsened = before != null && after != null && rb >= 0 && ra > rb
                    val improved = before != null && after != null && rb >= 0 && ra >= 0 && ra < rb
                    if (before != after) checklist += ChecklistChange(item, before, after, worsened, improved)
                }
            }
            val worsened = checklist.count { it.worsened }
            val status = when {
                s == null -> Status.SEM_SAIDA
                e == null -> Status.NOVO
                newDamages.isNotEmpty() || worsened > 0 || missingFurniture.isNotEmpty() -> Status.PIOROU
                resolvedDamages.isNotEmpty() || newFurniture.isNotEmpty() || checklist.isNotEmpty() -> Status.ALTERADO
                else -> Status.SEM_ALTERACAO
            }
            RoomComparison(name, e, s, newDamages, resolvedDamages, missingFurniture, newFurniture, checklist, worsened, status)
        }

        val entradaMed = saida.medidoresEntrada ?: entrada.medidores
        val meters = Medidores.DEFS.mapNotNull { (key, label, unit) ->
            val a = entradaMed.get(key).leitura
            val b = saida.medidores.get(key).leitura
            if (a.isBlank() && b.isBlank()) null else MeterRow(label, unit, a, b, Medidores.consumption(a, b))
        }

        val keyMap = LinkedHashMap<String, KeyRow>()
        entrada.chaves.filter { it.descricao.isNotBlank() }.forEach {
            val k = normalizeName(it.descricao)
            val cur = keyMap[k]
            keyMap[k] = KeyRow(it.descricao, (cur?.entrada ?: 0) + it.quantidade, cur?.saida ?: 0)
        }
        saida.chaves.filter { it.descricao.isNotBlank() }.forEach {
            val k = normalizeName(it.descricao)
            val cur = keyMap[k]
            keyMap[k] = KeyRow(cur?.descricao ?: it.descricao, cur?.entrada ?: 0, (cur?.saida ?: 0) + it.quantidade)
        }

        return Comparison(
            rooms = rooms,
            totals = Totals(
                newDamages = rooms.sumOf { it.newDamages.size },
                worsened = rooms.sumOf { it.worsened },
                missingFurniture = rooms.sumOf { it.missingFurniture.size },
                roomsWithIssues = rooms.count { it.status == Status.PIOROU },
                roomsMissingExit = rooms.count { it.status == Status.SEM_SAIDA }
            ),
            meters = meters,
            keys = keyMap.values.toList()
        )
    }

    // ------------------------------------------------------------------ relatório

    private fun esc(v: String?): String = (v ?: "")
        .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace("\"", "&quot;").replace("'", "&#39;")

    private val SAFE_IMG = Regex("^data:image/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$")

    private fun photos(r: RoomData?): String = (r?.photos ?: emptyList()).asSequence()
        .mapNotNull { PhotoStore.toDataUrl(it) }
        .filter { SAFE_IMG.matches(it) }
        .take(4)
        .joinToString("") { "<img src=\"$it\" alt=\"\">" }

    private fun list(title: String, items: List<String>, cls: String): String =
        if (items.isEmpty()) "" else "<div class=\"box $cls\"><b>${esc(title)}</b><ul>${items.joinToString("") { "<li>${esc(it)}</li>" }}</ul></div>"

    private fun fmt(n: Double): String =
        if (n % 1.0 == 0.0) String.format(Locale("pt", "BR"), "%,.0f", n)
        else String.format(Locale("pt", "BR"), "%,.3f", n).trimEnd('0').trimEnd(',')

    /** Relatório HTML autocontido (mesmo visual do web). Todo texto é escapado. */
    fun buildHtml(entrada: Vistoria, saida: Vistoria, cmp: Comparison): String {
        val statusCls = mapOf(
            Status.PIOROU to "piorou", Status.ALTERADO to "alterado", Status.SEM_ALTERACAO to "sem-alteracao",
            Status.SEM_SAIDA to "sem-saida", Status.NOVO to "novo"
        )
        val rows = cmp.rooms.joinToString("") { r ->
            buildString {
                append("<section class=\"room\"><h2>${esc(r.name)} <span class=\"st st-${statusCls[r.status]}\">${esc(r.status.label)}</span></h2>")
                append("<div class=\"cols\"><div><h3>Entrada</h3><div class=\"ph\">${photos(r.entrada).ifEmpty { "<i>sem fotos</i>" }}</div></div>")
                append("<div><h3>Saída</h3><div class=\"ph\">${photos(r.saida).ifEmpty { "<i>sem fotos</i>" }}</div></div></div>")
                append(list("Novas avarias na saída", r.newDamages, "bad"))
                append(list("Móveis/equipamentos da entrada não encontrados na saída", r.missingFurniture, "bad"))
                append(list("Avarias resolvidas", r.resolvedDamages, "good"))
                if (r.checklist.isNotEmpty()) {
                    append("<table><tr><th>Elemento</th><th>Entrada</th><th>Saída</th></tr>")
                    r.checklist.forEach { c ->
                        val cls = if (c.worsened) "w" else if (c.improved) "i" else ""
                        append("<tr class=\"$cls\"><td>${esc(c.item)}</td><td>${esc(Checklist.label(c.before))}</td><td>${esc(Checklist.label(c.after))}</td></tr>")
                    }
                    append("</table>")
                }
                if (!r.saida?.observations.isNullOrBlank()) {
                    append("<p class=\"obs\"><b>Obs. da saída:</b> ${esc(r.saida?.observations)}</p>")
                }
                append("</section>")
            }
        }

        val meters = if (cmp.meters.isEmpty()) "" else buildString {
            append("<section class=\"room\"><h2>Medidores</h2><table><tr><th>Medidor</th><th>Entrada</th><th>Saída</th><th>Consumo</th></tr>")
            cmp.meters.forEach { m ->
                val consumo = m.consumo?.let { "${fmt(it)} ${m.unit}" } ?: if (m.entrada.isNotBlank() && m.saida.isNotBlank()) "conferir" else "—"
                append("<tr><td>${esc(m.label)}</td><td>${esc(m.entrada.ifBlank { "—" })}</td><td>${esc(m.saida.ifBlank { "—" })}</td><td>${esc(consumo)}</td></tr>")
            }
            append("</table></section>")
        }

        val keys = if (cmp.keys.isEmpty()) "" else buildString {
            append("<section class=\"room\"><h2>Chaves, controles e acessos</h2><table><tr><th>Item</th><th>Entregue (entrada)</th><th>Devolvido (saída)</th></tr>")
            cmp.keys.forEach { k ->
                val cls = if (k.saida < k.entrada) "w" else ""
                append("<tr class=\"$cls\"><td>${esc(k.descricao)}</td><td>${k.entrada}</td><td>${k.saida}</td></tr>")
            }
            append("</table></section>")
        }

        val geradoEm = SimpleDateFormat("dd/MM/yyyy 'às' HH:mm", Locale("pt", "BR")).format(Date())
        val endereco = listOf(entrada.endereco, entrada.numero, entrada.conjApto).filter { it.isNotBlank() }.joinToString(" ")
        val local = listOf(entrada.bairro, listOf(entrada.cidade, entrada.estado).filter { it.isNotBlank() }.joinToString("/")).filter { it.isNotBlank() }.joinToString(", ")

        return """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Comparativo entrada x saída</title>
<style>
body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;max-width:794px;margin:auto;background:#fff}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:0 0 8px;display:flex;justify-content:space-between;gap:8px}h3{font-size:12px;text-transform:uppercase;color:#64748b;margin:0 0 4px}
.sub{color:#64748b;font-size:12px;margin-bottom:16px}.kpis{display:flex;gap:8px;margin:12px 0 20px;flex-wrap:wrap}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;min-width:120px;font-size:12px}.kpi b{display:block;font-size:22px}
.room{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px;break-inside:avoid}.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ph{display:grid;grid-template-columns:1fr 1fr;gap:4px}.ph img{width:100%;height:110px;object-fit:cover;border-radius:6px}.ph i{color:#94a3b8;font-size:12px}
.box{border-radius:8px;padding:8px 12px;margin-top:8px;font-size:13px}.box ul{margin:4px 0 0;padding-left:18px}.bad{background:#fef2f2;border:1px solid #fecaca}.good{background:#f0fdf4;border:1px solid #bbf7d0}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}th,td{border:1px solid #e2e8f0;padding:5px 8px;text-align:left}tr.w td{background:#fef2f2}tr.i td{background:#f0fdf4}
.st{font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px;background:#f1f5f9}.st-piorou{background:#fee2e2;color:#991b1b}.st-alterado{background:#fef3c7;color:#92400e}.st-sem-alteracao{background:#dcfce7;color:#166534}
.obs{font-size:12px;color:#475569}
</style></head><body>
<h1>Comparativo de vistorias — Entrada x Saída</h1>
<div class="sub">${esc(entrada.condominio.ifBlank { entrada.endereco })} · ${esc(endereco)} · ${esc(local)}<br>Entrada: ${esc(entrada.dataLaudo)} · Saída: ${esc(saida.dataLaudo)} · Locatário(a): ${esc(entrada.locatario)}</div>
<div class="kpis">
<div class="kpi"><b>${cmp.totals.newDamages}</b>novas avarias</div>
<div class="kpi"><b>${cmp.totals.worsened}</b>itens que pioraram</div>
<div class="kpi"><b>${cmp.totals.missingFurniture}</b>itens não encontrados</div>
<div class="kpi"><b>${cmp.totals.roomsWithIssues}</b>cômodos com deterioração</div>
${if (cmp.keys.isNotEmpty()) "<div class=\"kpi\"><b>${cmp.missingKeys}</b>chaves/controles não devolvidos</div>" else ""}
</div>$meters$keys$rows
<p style="font-size:11px;color:#94a3b8;margin-top:24px">Gerado por imobWeb Vistoria em ${esc(geradoEm)}. Este comparativo é auxiliar e não substitui a análise dos laudos originais.</p>
</body></html>"""
    }
}
