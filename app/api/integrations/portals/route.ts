import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPortalAdapter } from "@/lib/portals/adapters";
import { PortalType, PortalId } from "@/types/portals";
import { IntegrationMonitor } from "@/lib/portals/monitoring";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Get integrations settings
    const settings = user.organization.settings as any;
    const integrations = settings?.integrations || {};

    // Get portal-specific data
    const portalTypes: PortalType[] = [
      "ZAP",
      "VIVAREAL",
      "OLX",
      "IMOVELWEB",
      "CHAVES_NA_MAO",
      "MERCADO_LIVRE",
      "PROPRIETARIO_DIRETO",
      "IMOBIBRASIL",
      "LOFT",
      "QUINTO_ANDAR",
    ];

    const portalData = await Promise.all(
      portalTypes.map(async (portalType) => {
        const integrationId = portalType.toLowerCase();
        const integration = integrations[integrationId];

        // Get adapter for health check
        let health = {
          status: "unknown",
          lastCheck: null as Date | null,
          error: null as string | null,
        };
        let stats = {
          totalProperties: 0,
          activeProperties: 0,
          totalViews: 0,
          totalLeads: 0,
        };
        let syncStatus = {
          lastSync: null as Date | null,
          nextSync: null as Date | null,
          isSyncing: false,
        };

        try {
          if (integration?.status === "connected" && integration?.config) {
            const adapter = getPortalAdapter(
              portalType.toLowerCase() as PortalId,
              integration.config,
            );

            if (adapter) {
              const healthCheck = await adapter.checkHealth();
              health = {
                status: healthCheck.status,
                lastCheck: new Date(),
                error: healthCheck.message || null,
              };

              // Get basic stats
              const analytics = await adapter.getAnalytics();
              stats = {
                totalProperties: analytics.totalProperties || 0,
                activeProperties: analytics.activeProperties || 0,
                totalViews: analytics.totalViews || 0,
                totalLeads: analytics.totalLeads || 0,
              };
            }

            // Sync status from monitoring
            const monitor = new IntegrationMonitor();
            const syncEvents = await prisma.integrationEvent.findMany({
              where: {
                portalId: integrationId,
                action: { in: ["CREATE", "UPDATE", "SYNC"] },
              },
              orderBy: { timestamp: "desc" },
              take: 1,
            });

            if (syncEvents.length > 0) {
              syncStatus.lastSync = syncEvents[0].timestamp;
            }
          }
        } catch (error) {
          health.status = "error";
          health.error =
            error instanceof Error ? error.message : "Unknown error";
        }

        return {
          id: integrationId,
          name: getPortalName(portalType),
          type: portalType,
          status: integration?.status || "disconnected",
          config: integration?.config || null,
          health,
          stats,
          syncStatus,
          features: getPortalFeatures(portalType),
          documentation: getPortalDocumentation(portalType),
        };
      }),
    );

    return NextResponse.json({ portals: portalData });
  } catch (err) {
    console.error("[Portals API] GET error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portalId, action, config } = await req.json();

    if (!portalId || !action) {
      return NextResponse.json(
        { error: "Portal ID and action are required" },
        { status: 400 },
      );
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Fetch current settings
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { settings: true },
    });

    const currentSettings = (organization?.settings as any) || {};
    const currentIntegrations = currentSettings.integrations || {};

    let result;
    switch (action) {
      case "connect":
      case "update":
        // Update the specific integration
        const updatedIntegrations = {
          ...currentIntegrations,
          [portalId]: {
            ...(currentIntegrations[portalId] || {}),
            status: "connected",
            config: config || {},
          },
        };

        // Save back to organization
        await prisma.organization.update({
          where: { id: user.organizationId },
          data: {
            settings: {
              ...currentSettings,
              integrations: updatedIntegrations,
            },
          },
        });

        result = { success: true, integration: updatedIntegrations[portalId] };
        break;

      case "disconnect":
        // Remove the integration
        const { [portalId]: removed, ...remainingIntegrations } =
          currentIntegrations;

        await prisma.organization.update({
          where: { id: user.organizationId },
          data: {
            settings: {
              ...currentSettings,
              integrations: remainingIntegrations,
            },
          },
        });

        result = { success: true, integration: null };
        break;

      case "test":
        // Test the connection
        try {
          const adapter = getPortalAdapter(
            (portalId as string).toLowerCase() as PortalId,
            config || {},
          );
          if (!adapter) {
            return NextResponse.json(
              { error: "Invalid portal" },
              { status: 400 },
            );
          }
          const health = await adapter.checkHealth();
          result = { success: true, health };
        } catch (error) {
          result = {
            success: false,
            error: error instanceof Error ? error.message : "Test failed",
          };
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Portals API] POST error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function getPortalName(portalType: PortalType): string {
  const names: Record<PortalType, string> = {
    ZAP: "ZapImóveis",
    VIVAREAL: "Viva Real",
    OLX: "OLX Imóveis",
    IMOVELWEB: "ImovelWeb",
    CHAVES_NA_MAO: "Chaves na Mão",
    MERCADO_LIVRE: "Mercado Livre",
    PROPRIETARIO_DIRETO: "Proprietário Direto",
    IMOBIBRASIL: "ImobiBrasil",
    LOFT: "Loft",
    QUINTO_ANDAR: "QuintoAndar",
    VRSYNC: "VRSync",
    CUSTOM: "Personalizado",
  };
  return names[portalType] || portalType;
}

function getPortalFeatures(portalType: PortalType): string[] {
  const features: Record<PortalType, string[]> = {
    ZAP: [
      "Sincronização automática de anúncios",
      "Atualização de fotos e vídeos",
      "Integração de leads",
      "Relatórios de desempenho",
      "Destaque de anúncios",
    ],
    VIVAREAL: [
      "Publicação automática",
      "Otimização de SEO",
      "Gestão de anúncios",
      "Análise de visualizações",
      "Integração de WhatsApp",
    ],
    OLX: [
      "Postagem instantânea",
      "Renovação automática",
      "Mensagens diretas",
      "Relatórios de vendas",
      "Destaque premium",
    ],
    IMOVELWEB: [
      "XML VRSync",
      "Sincronização completa",
      "Validação automática",
      "Relatórios detalhados",
      "Suporte técnico",
    ],
    CHAVES_NA_MAO: [
      "XML personalizado",
      "Validação de dados",
      "Sincronização bidirecional",
      "Análise de tráfego",
      "Gestão de leads",
    ],
    MERCADO_LIVRE: [
      "API oficial",
      "Galeria de fotos",
      "Descrição otimizada",
      "Perguntas frequentes",
      "Envio seguro",
    ],
    PROPRIETARIO_DIRETO: [
      "XML formatado",
      "Validação de campos",
      "Atualização automática",
      "Relatórios de visitas",
      "Integração de contatos",
    ],
    IMOBIBRASIL: [
      "Sincronização completa",
      "Validação de dados",
      "Relatórios de desempenho",
      "Atualização em tempo real",
      "Suporte 24/7",
    ],
    LOFT: [
      "API moderna",
      "Metadados avançados",
      "Validação inteligente",
      "Análise de mercado",
      "Relatórios premium",
    ],
    QUINTO_ANDAR: [
      "Integração premium",
      "Validação rigorosa",
      "Sincronização automática",
      "Relatórios detalhados",
      "Suporte prioritário",
    ],
    VRSYNC: ["Padrão XML", "Sincronização básica", "Validação simples"],
    CUSTOM: [
      "Configuração personalizada",
      "Campos customizados",
      "Lógica personalizada",
    ],
  };
  return features[portalType] || [];
}

function getPortalDocumentation(portalType: PortalType): {
  url: string;
  description: string;
} {
  const docs: Record<PortalType, { url: string; description: string }> = {
    ZAP: {
      url: "https://portalzap.com.br/developers",
      description: "Documentação oficial da Zap para integração VRSync",
    },
    VIVAREAL: {
      url: "https://developers.vivareal.com.br",
      description: "API e documentação do Viva Real",
    },
    OLX: {
      url: "https://developers.olx.com.br",
      description: "Documentação da API OLX Brasil",
    },
    IMOVELWEB: {
      url: "https://www.imovelweb.com.br/api",
      description: "Documentação XML VRSync do ImovelWeb",
    },
    CHAVES_NA_MAO: {
      url: "https://www.chavesnamao.com.br/integracoes",
      description: "Documentação de integração XML",
    },
    MERCADO_LIVRE: {
      url: "https://developers.mercadolivre.com.br",
      description: "Documentação oficial da API Mercado Livre",
    },
    PROPRIETARIO_DIRETO: {
      url: "https://www.proprietariodireto.com.br/integracoes",
      description: "Documentação de integração XML",
    },
    IMOBIBRASIL: {
      url: "https://www.imobibrasil.com.br/api",
      description: "Documentação da API ImobiBrasil",
    },
    LOFT: {
      url: "https://developers.loft.com.br",
      description: "Documentação da API moderna Loft",
    },
    QUINTO_ANDAR: {
      url: "https://developers.quintoandar.com.br",
      description: "Documentação da API QuintoAndar",
    },
    VRSYNC: {
      url: "https://www.vrsync.com.br",
      description: "Padrão XML VRSync padrão",
    },
    CUSTOM: {
      url: "",
      description: "Configuração personalizada",
    },
  };
  return docs[portalType] || { url: "", description: "" };
}
