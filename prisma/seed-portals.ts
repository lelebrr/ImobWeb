import { PrismaClient, PortalType, PortalIntegrationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando integrações com portais...');

  // 1. Garantir que existe uma organização
  const org = await prisma.organization.upsert({
    where: { id: 'org_default' },
    update: {},
    create: {
      id: 'org_default',
      name: 'Imobiliária Modelo',
      email: 'comercial@modelo.com',
      status: 'ATIVO'
    }
  });

  // 2. Criar integrações de teste
  const portalData = [
    {
      name: 'Zap Imóveis',
      type: PortalType.ZAP,
      apiKey: 'zap-key-123',
      status: PortalIntegrationStatus.ATIVO,
      settings: {
        feedUrl: 'https://imobweb.com.br/api/portals/feed/zap',
        syncFrequency: '2min'
      }
    },
    {
      name: 'Viva Real',
      type: PortalType.VIVAREAL,
      apiKey: 'viva-key-456',
      status: PortalIntegrationStatus.ATIVO,
      settings: {
        highlights: 10,
        superHighlights: 2
      }
    },
    {
      name: 'OLX',
      type: PortalType.OLX,
      apiKey: 'olx-key-789',
      status: PortalIntegrationStatus.ERRO,
      settings: {
        error: 'Token expirado'
      }
    }
  ];

  for (const data of portalData) {
    await prisma.portalIntegration.upsert({
      where: { apiKey_type: { apiKey: data.apiKey, type: data.type } },
      update: {
        name: data.name,
        apiKey: data.apiKey,
        type: data.type,
        status: data.status,
        settings: data.settings as any,
        organizationId: org.id
      },
      create: {
        name: data.name,
        apiKey: data.apiKey,
        type: data.type,
        status: data.status,
        settings: data.settings as any,
        organizationId: org.id
      }
    });
  }

  console.log('✅ Integrações semeadas com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
