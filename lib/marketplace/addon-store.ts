import { Addon } from "../../types/partner";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * MOTOR DO MARKETPLACE DE EXTENSÕES - imobWeb 2026
 * Gestão de Catálogo, Licenciamento e Billing Usage-Based.
 */

const ADDON_CATALOG: Addon[] = [
  {
    id: "addon_photo_ai_pro",
    name: "IA - Otimização de Fotos",
    description: "Algoritmos avançados para tratamento de luz, remoção de objetos e upscaling 4K de fotos de imóveis.",
    category: "ia",
    price: 49.90,
    billingType: "monthly",
    icon: "camera",
    developer: "imobWeb Core Labs",
  },
  {
    id: "addon_whatsapp_automation_ultra",
    name: "Automação WhatsApp Ultra",
    description: "Robôs de triagem inicial e agendamento de visitas integrados diretamente com o CRM.",
    category: "marketing",
    price: 89.90,
    billingType: "monthly",
    icon: "message-square",
    developer: "Bots & Sale",
  },
  {
    id: "addon_tour_virtual_360",
    name: "Tour Virtual 360º",
    description: "Transforme fotos panorâmicas em tours interativos e imersivos para seus clientes.",
    category: "ia",
    price: 129.00,
    billingType: "usage",
    icon: "move",
    developer: "Spatial AI",
  },
  {
    id: "addon_global_portal_bridge",
    name: "Global Portal Bridge",
    description: "Publicação automática em portais internacionais (Idealista, Zillow, Properstar).",
    category: "portals",
    price: 199.00,
    billingType: "monthly",
    icon: "globe",
    developer: "imobWeb Engineering",
  },
  {
    id: "addon_bi_premium_reports",
    name: "BI & Relatórios Premium",
    description: "Dashboards avançados de ROI por canal e produtividade de equipe por m2.",
    category: "reports",
    price: 39.90,
    billingType: "monthly",
    icon: "bar-chart-3",
    developer: "DataBrokers",
  },
];

export class AddonStore {
  /**
   * Recupera todos os addons, marcando os já instalados pelo tenant.
   */
  static async getCatalog(tenantId: string): Promise<Addon[]> {
    const org = await prisma.organization.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });

    const settings = (org?.settings as any) || {};
    const installedIds = settings.addons?.installed || [];

    return ADDON_CATALOG.map(addon => ({
      ...addon,
      isInstalled: installedIds.includes(addon.id)
    }));
  }

  /**
   * Instalação One-Click com provisionamento de Gateway (Stripe).
   */
  static async installAddon(tenantId: string, addonId: string): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
    const addon = ADDON_CATALOG.find(a => a.id === addonId);
    if (!addon) return { success: false, error: "Add-on não mapeado no catálogo atual." };

    try {
      // 1. Verificar se já está instalado
      const org = await prisma.organization.findUnique({ where: { id: tenantId } });
      const currentSettings = (org?.settings as any) || {};
      const installedAddons = currentSettings.addons?.installed || [];

      if (installedAddons.includes(addonId)) {
        return { success: false, error: "Este add-on já está ativo nesta conta." };
      }

      // 2. Integração com Stripe (Fluxo 2026 - Instant Provisioning)
      // Em produção, isso criaria uma 'SubscriptionItem' adicional no Stripe Connect do tenant
      console.log(`[STRIPE] Criando cobrança recorrente para ${addonId} (R$ ${addon.price}) para Tenant ${tenantId}`);

      // 3. Atualizar Prisma para ativar as funcionalidades (Feature Flipping)
      await prisma.organization.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...currentSettings,
            addons: {
              ...currentSettings.addons,
              installed: [...installedAddons, addonId],
              billingStatus: {
                ...(currentSettings.addons?.billingStatus || {}),
                [addonId]: 'active'
              }
            },
            features: {
              ...(currentSettings.features || {}),
              [`HAS_${addonId.toUpperCase()}`]: true
            }
          }
        }
      });

      return { success: true };
    } catch (e) {
      console.error("[ADDON_STORE_ERROR]", e);
      return { success: false, error: "Houve um erro no provisionamento. Tente novamente em instantes." };
    }
  }

  /**
   * Desativação e Cleanup de Add-on
   */
  static async uninstallAddon(tenantId: string, addonId: string): Promise<boolean> {
    try {
      const org = await prisma.organization.findUnique({ where: { id: tenantId } });
      const currentSettings = (org?.settings as any) || {};
      const installedAddons = currentSettings.addons?.installed || [];

      await prisma.organization.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...currentSettings,
            addons: {
              ...currentSettings.addons,
              installed: installedAddons.filter((id: string) => id !== addonId)
            },
            features: {
              ...(currentSettings.features || {}),
              [`HAS_${addonId.toUpperCase()}`]: false
            }
          }
        }
      });

      return true;
    } catch (e) {
      console.error("[ADDON_UNINSTALL_ERROR]", e);
      return false;
    }
  }
}
