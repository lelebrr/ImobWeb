package com.imobweb.app.util

import com.imobweb.app.model.*
import java.text.Normalizer

/**
 * Regras das sugestões da IA (mesmas do sistema web, `_lib/inspection.ts`):
 * o que a IA detecta vira sugestão; só entra no laudo o que o usuário aceitar.
 */
object Inspection {
    const val MIN_CONFIDENCE = 0.55 // abaixo disso nem é sugerido
    const val SURE_CONFIDENCE = 0.75 // abaixo disso vira "Possível …" e vem desmarcado

    private fun norm(s: String): String =
        Normalizer.normalize(s, Normalizer.Form.NFD).replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .lowercase().replace(Regex("[^a-z0-9]+"), " ").trim()

    /** O item já está na lista (igual ou contido num texto existente)? */
    fun hasSimilar(list: List<String>, text: String): Boolean {
        val n = norm(text)
        if (n.isEmpty()) return true
        return list.any { val m = norm(it); m == n || m.contains(n) || n.contains(m) }
    }

    fun isPreselected(p: Proposal) = p.confidence >= SURE_CONFIDENCE

    fun defectText(d: DetectedDefect): String {
        val possible = d.confidence < SURE_CONFIDENCE
        val label = DefectTypes.label(d.type)
        val body = "${if (possible) label.replaceFirstChar { it.lowercase() } else label}: ${d.description}"
        return "${if (possible) "Possível " else ""}$body${if (d.severity == "leve") "" else " (${d.severity})"}"
    }

    fun defectShort(d: DetectedDefect): String {
        val t = DefectTypes.label(d.type) + (d.`object`?.let { " - $it" } ?: "")
        return if (t.length > 30) t.take(29) + "…" else t
    }

    fun proposalsFromInspection(room: RoomData, photoId: String, insp: PhotoInspection, withMarks: Boolean = true): List<Proposal> {
        // itens comparam com itens e avarias com avarias: "Risco no tampo da mesa" não é o mesmo que "Mesa"
        val knownItems = room.furniture + room.proposals.filter { it.kind == "furniture" }.map { it.text }
        val knownDamages = room.damages + room.problems + room.proposals.filter { it.kind == "damage" }.map { it.text }
        val out = mutableListOf<Proposal>()
        for (o in insp.objects) {
            if (o.confidence < MIN_CONFIDENCE || o.category == "estrutura") continue
            if (hasSimilar(knownItems + out.filter { it.kind == "furniture" }.map { it.text }, o.name)) continue
            out += Proposal(kind = "furniture", text = o.name, confidence = o.confidence, source = "inspecao", photoId = photoId)
        }
        for (d in insp.defects) {
            if (d.confidence < MIN_CONFIDENCE) continue
            val text = defectText(d)
            if (hasSimilar(knownDamages + out.filter { it.kind == "damage" }.map { it.text }, text)) continue
            val mark = d.box?.takeIf { withMarks }?.let {
                PhotoAnnotation(Math.round(it.x + it.w / 2).toDouble(), Math.round(it.y + it.h / 2).toDouble(), defectShort(d))
            }
            out += Proposal(kind = "damage", text = text, confidence = d.confidence, source = "inspecao", photoId = photoId, mark = mark)
        }
        return out
    }

    /**
     * Aplica as sugestões ACEITAS (com o texto já editado) ao cômodo e tira da fila as decididas.
     * [applyMark]: ids de sugestões cuja marcação deve ir para a foto.
     */
    fun accept(room: RoomData, accepted: List<Proposal>, applyMark: Set<String>, decidedIds: Set<String>): RoomData {
        val furniture = room.furniture.toMutableList()
        val damages = room.damages.toMutableList()
        val photos = room.photos.map { it.copy(annotations = it.annotations.toMutableList()) }.toMutableList()
        for (a in accepted) {
            val text = a.text.trim()
            if (text.isEmpty()) continue
            if (a.kind == "furniture") {
                if (!hasSimilar(furniture, text)) furniture += text
                continue
            }
            if (damages.none { norm(it) == norm(text) }) damages += text
            val mark = a.mark
            if (mark != null && a.id in applyMark && a.photoId != null) {
                val idx = photos.indexOfFirst { it.id == a.photoId }
                if (idx >= 0) {
                    val ph = photos[idx]
                    if (ph.annotations.none { Math.hypot(it.x - mark.x, it.y - mark.y) < 8 }) {
                        photos[idx] = ph.copy(annotations = ph.annotations + mark)
                    }
                }
            }
        }
        return room.copy(
            furniture = furniture,
            damages = damages,
            photos = photos,
            proposals = room.proposals.filter { it.id !in decidedIds }
        )
    }

    /** Normaliza a resposta da IA quando o app chama o Gemini direto (como o servidor faz). */
    fun normalize(json: com.google.gson.JsonObject, nPhotos: Int): List<PhotoInspection> {
        val out = MutableList(nPhotos) { PhotoInspection() }
        val photos = json.getAsJsonArray("photos") ?: return out
        fun box(arr: com.google.gson.JsonArray?): DetectedBox? {
            if (arr == null || arr.size() != 4) return null
            val v = arr.map { runCatching { it.asDouble.coerceIn(0.0, 1000.0) }.getOrNull() ?: return null }
            val (y0, x0, y1, x1) = v
            val w = Math.abs(x1 - x0) / 10; val h = Math.abs(y1 - y0) / 10
            if (w < 1 || h < 1) return null
            return DetectedBox(minOf(x0, x1) / 10, minOf(y0, y1) / 10, w, h)
        }
        for (el in photos) {
            val p = runCatching { el.asJsonObject }.getOrNull() ?: continue
            val idx = runCatching { p.get("photo").asInt }.getOrNull() ?: continue
            if (idx !in 0 until nPhotos) continue
            val objects = p.getAsJsonArray("objects")?.mapNotNull { o ->
                runCatching {
                    val ob = o.asJsonObject
                    val name = ob.get("name").asString.trim().take(60)
                    if (name.isEmpty()) null else DetectedObject(
                        name = name,
                        category = ob.get("category")?.asString ?: "outro",
                        condition = ob.get("condition")?.asString ?: "bom",
                        confidence = (ob.get("confidence")?.asDouble ?: 0.5).coerceIn(0.0, 1.0),
                        box = box(ob.getAsJsonArray("box_2d"))
                    )
                }.getOrNull()
            }.orEmpty().distinctBy { norm(it.name) }.take(14)
            val defects = p.getAsJsonArray("defects")?.mapNotNull { d ->
                runCatching {
                    val ob = d.asJsonObject
                    val desc = ob.get("description").asString.trim().take(120)
                    val conf = (ob.get("confidence")?.asDouble ?: 0.5).coerceIn(0.0, 1.0)
                    val type = ob.get("type")?.asString?.lowercase()?.takeIf { it in DefectTypes.LABELS } ?: "outro"
                    val sev = ob.get("severity")?.asString?.lowercase()?.takeIf { it in listOf("leve", "moderada", "grave") } ?: "leve"
                    if (desc.isEmpty() || conf < 0.4) null else DetectedDefect(type, sev, desc, ob.get("object")?.asString, conf, box(ob.getAsJsonArray("box_2d")))
                }.getOrNull()
            }.orEmpty().distinctBy { it.type + "|" + norm(it.description) }.take(10)
            out[idx] = PhotoInspection(objects, defects, p.get("imageQuality")?.asString)
        }
        return out
    }
}
