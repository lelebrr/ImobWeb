/**
 * SERVIÇO DE BRANDING & WHITE LABEL - imobWeb
 * 2026 - Customização completa por Organização
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface OrganizationBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl?: string;
  customDomain?: string;
  fontFamily?: string;
}

/**
 * Recupera as configurações de branding de uma organização.
 */
export async function getOrganizationBranding(organizationId: string): Promise<OrganizationBranding | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        logoUrl: true,
        settings: true,
      }
    });

    if (!org) return null;

    const settings = (org.settings as any) || {};

    return {
      primaryColor: org.primaryColor || "#3b82f6",
      secondaryColor: org.secondaryColor || "#1e293b",
      logoUrl: org.logoUrl || "/logo-default.png",
      faviconUrl: settings.faviconUrl,
      customDomain: settings.customDomain,
      fontFamily: settings.fontFamily || "Inter, sans-serif",
    };
  } catch (error) {
    console.error(`[BRANDING_ERROR] Org: ${organizationId}`, error);
    return null;
  }
}

/**
 * Gera as variáveis CSS customizadas para o tema da organização.
 */
export function generateThemeStyle(branding: OrganizationBranding) {
  return `
    :root {
      --primary: ${branding.primaryColor};
      --secondary: ${branding.secondaryColor};
      --font-family: ${branding.fontFamily};
    }
  `;
}
