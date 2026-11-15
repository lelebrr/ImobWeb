package com.imobweb.app.util

import android.content.Context
import com.google.gson.Gson

/** Configuração completa de layout, identidade visual e seções incluídas no PDF do laudo. */
data class PdfTemplateConfig(
    val id: String = "t1_executivo",
    val number: Int = 1,
    val name: String = "Executivo ImobWeb",
    val subtitle: String = "Capa moderna azul royal, termo completo, fotos 3x linha",
    val accentHex: String = "#2563eb",
    val secondaryHex: String = "#0f172a",
    /** "sans", "serif", "mono" */
    val fontFamily: String = "sans",
    /** "modern", "judicial", "luxury", "minimal", "none" */
    val coverStyle: String = "modern",
    /** Remove quebras de página forçadas para gerar menos páginas. */
    val compactFlow: Boolean = false,
    // Seções do documento
    val showCover: Boolean = true,
    val showLegalPreamble: Boolean = true,
    val showCriteriaBox: Boolean = true,
    val showPropertyTable: Boolean = true,
    val showPartiesTable: Boolean = true,
    val showMetersKeys: Boolean = true,
    val showMasterChecklistOverview: Boolean = false,
    val showRoomChecklist: Boolean = true,
    val showFurnitureTable: Boolean = true,
    val showSimpleInventory: Boolean = true,
    val showRoomDamages: Boolean = true,
    val showRoomObservations: Boolean = true,
    val showPhotos: Boolean = true,
    /** 2, 3 ou 4 fotos por linha */
    val photosPerRow: Int = 3,
    val showPhotoFurnitureTag: Boolean = true,
    val showPhotoTimestamp: Boolean = true,
    val showPhotoAnnotations: Boolean = true,
    val showConsolidatedDamages: Boolean = true,
    val showRepairsEstimate: Boolean = true,
    val showConsiderations: Boolean = true,
    val showSignatures: Boolean = true,
    val showWitnesses: Boolean = false,
    val customHeaderTitle: String = "",
    val customFooterText: String = ""
)

object PdfTemplateCatalog {
    private val gson = Gson()
    private const val PREFS = "pdf_templates_prefs"
    private const val KEY_DEFAULT = "default_template_json"
    private const val KEY_CUSTOM = "custom_template_json"
    private const val KEY_VISTORIA_PREFIX = "vistoria_template_"
    private val SAFE_HEX = Regex("^#[0-9a-fA-F]{6}$")

    /** 8 templates pré-definidos com identidades visuais e estruturas distintas. */
    val presets: List<PdfTemplateConfig> = listOf(
        PdfTemplateConfig(
            id = "t1_executivo",
            number = 1,
            name = "Executivo ImobWeb (Padrão Moderno)",
            subtitle = "Capa moderna azul royal, termo completo, tabelas detalhadas e 3 fotos/linha",
            accentHex = "#2563eb",
            secondaryHex = "#0f172a",
            fontFamily = "sans",
            coverStyle = "modern",
            compactFlow = false
        ),
        PdfTemplateConfig(
            id = "t2_cartorial",
            number = 2,
            name = "Cartorial & Jurídico Clássico",
            subtitle = "Tipografia serifada clássica, bronze solene, cláusulas formais e 2 testemunhas",
            accentHex = "#b45309",
            secondaryHex = "#1c1917",
            fontFamily = "serif",
            coverStyle = "judicial",
            compactFlow = false,
            showWitnesses = true
        ),
        PdfTemplateConfig(
            id = "t3_mobiliado",
            number = 3,
            name = "Especial Imóvel Mobiliado & Alto Padrão",
            subtitle = "Esmeralda Luxury, foco em inventário detalhado de móveis/eletros e quadro geral",
            accentHex = "#059669",
            secondaryHex = "#064e3b",
            fontFamily = "sans",
            coverStyle = "luxury",
            compactFlow = false,
            showMasterChecklistOverview = true,
            showFurnitureTable = true
        ),
        PdfTemplateConfig(
            id = "t4_compacto",
            number = 4,
            name = "Compacto & Econômico (Sem Capa)",
            subtitle = "Fluxo contínuo sem capa nem quebras extras para vistorias rápidas e objetivas",
            accentHex = "#4f46e5",
            secondaryHex = "#1e293b",
            fontFamily = "sans",
            coverStyle = "none",
            compactFlow = true,
            showCover = false,
            showCriteriaBox = false
        ),
        PdfTemplateConfig(
            id = "t5_engenharia",
            number = 5,
            name = "Técnico de Engenharia & Manutenção",
            subtitle = "Âmbar industrial, fonte técnica mono, quadro geral, avarias e estimativa de reparos",
            accentHex = "#d97706",
            secondaryHex = "#0f172a",
            fontFamily = "mono",
            coverStyle = "modern",
            compactFlow = false,
            showMasterChecklistOverview = true,
            showConsolidatedDamages = true,
            showRepairsEstimate = true
        ),
        PdfTemplateConfig(
            id = "t6_fotografico",
            number = 6,
            name = "Relatório Fotográfico em Destaque",
            subtitle = "Bordô visual com foco nas fotografias, etiquetas de móveis, horários e marcações",
            accentHex = "#be123c",
            secondaryHex = "#0f172a",
            fontFamily = "sans",
            coverStyle = "modern",
            compactFlow = false,
            showCriteriaBox = false,
            photosPerRow = 3,
            showPhotoFurnitureTag = true,
            showPhotoTimestamp = true,
            showPhotoAnnotations = true
        ),
        PdfTemplateConfig(
            id = "t7_comparativo",
            number = 7,
            name = "Quadro Comparativo & Checklist Geral",
            subtitle = "Teal corporativo com painel mestre comparando todos os cômodos logo no início",
            accentHex = "#0d9488",
            secondaryHex = "#134e4a",
            fontFamily = "sans",
            coverStyle = "modern",
            compactFlow = false,
            showMasterChecklistOverview = true
        ),
        PdfTemplateConfig(
            id = "t8_minimalista",
            number = 8,
            name = "Minimalista P&B (Impressão Econômica)",
            subtitle = "Alto contraste monocromático sem blocos pesados, ideal para impressão e economia de tinta",
            accentHex = "#111827",
            secondaryHex = "#374151",
            fontFamily = "sans",
            coverStyle = "minimal",
            compactFlow = true,
            showCriteriaBox = false
        )
    )

    val defaultTemplate: PdfTemplateConfig
        get() = presets.first()

    fun defaultCustomTemplate(): PdfTemplateConfig = defaultTemplate.copy(
        id = "t9_custom",
        number = 9,
        name = "Template Personalizado",
        subtitle = "Personalizado com suas cores, fonte, capa e seções selecionadas"
    )

    fun sanitize(cfg: PdfTemplateConfig): PdfTemplateConfig = cfg.copy(
        id = cfg.id.ifBlank { "t1_executivo" },
        name = cfg.name.ifBlank { "Template ${cfg.number}" },
        accentHex = if (SAFE_HEX.matches(cfg.accentHex)) cfg.accentHex else "#2563eb",
        secondaryHex = if (SAFE_HEX.matches(cfg.secondaryHex)) cfg.secondaryHex else "#0f172a",
        fontFamily = if (cfg.fontFamily in listOf("sans", "serif", "mono")) cfg.fontFamily else "sans",
        coverStyle = if (cfg.coverStyle in listOf("modern", "judicial", "luxury", "minimal", "none")) cfg.coverStyle else "modern",
        photosPerRow = cfg.photosPerRow.coerceIn(1, 4)
    )

    fun byId(id: String): PdfTemplateConfig? = presets.firstOrNull { it.id == id }

    fun saveDefaultTemplate(context: Context, config: PdfTemplateConfig) {
        val clean = sanitize(config)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_DEFAULT, gson.toJson(clean))
            .apply()
    }

    fun loadDefaultTemplate(context: Context): PdfTemplateConfig {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_DEFAULT, null)
            ?: return defaultTemplate
        return runCatching { sanitize(gson.fromJson(raw, PdfTemplateConfig::class.java)) }.getOrDefault(defaultTemplate)
    }

    fun saveCustomTemplate(context: Context, config: PdfTemplateConfig) {
        val clean = sanitize(config.copy(id = "t9_custom", number = 9))
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_CUSTOM, gson.toJson(clean))
            .apply()
    }

    fun loadCustomTemplate(context: Context): PdfTemplateConfig {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_CUSTOM, null)
            ?: return defaultCustomTemplate()
        return runCatching { sanitize(gson.fromJson(raw, PdfTemplateConfig::class.java)) }.getOrDefault(defaultCustomTemplate())
    }

    fun saveForVistoria(context: Context, vistoriaId: Long, config: PdfTemplateConfig) {
        if (vistoriaId <= 0L) return
        val clean = sanitize(config)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString("$KEY_VISTORIA_PREFIX$vistoriaId", gson.toJson(clean))
            .apply()
    }

    fun loadForVistoria(context: Context, vistoriaId: Long): PdfTemplateConfig {
        if (vistoriaId > 0L) {
            val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString("$KEY_VISTORIA_PREFIX$vistoriaId", null)
            if (!raw.isNullOrBlank()) {
                val parsed = runCatching { sanitize(gson.fromJson(raw, PdfTemplateConfig::class.java)) }.getOrNull()
                if (parsed != null) return parsed
            }
        }
        return loadDefaultTemplate(context)
    }
}
