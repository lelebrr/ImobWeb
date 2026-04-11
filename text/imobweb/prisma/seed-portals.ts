import { PrismaClient } from '@prisma/client';

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
      type: 'ZAP',
      apiKey: 'zap-key-123',
      status: 'ATIVO',
      settings: {
        feedUrl: 'https://imobweb.com.br/api/portals/feed/zap',
        syncFrequency: '2min'
      }
    },
    {
      name: 'Viva Real',
      type: 'VIVAREAL',
      apiKey: 'viva-key-456',
      status: 'ATIVO',
      settings: {
        highlights: 10,
        superHighlights: 2
      }
    },
    {
      name: 'OLX',
      type: 'OLX',
      apiKey: 'olx-key-789',
      status: 'ERRO',
      settings: {
        error: 'Token expirado'
      }
    }
  ];

  for (const data of portalData) {
    await prisma.portalIntegration.upsert({
      where: { apiKey_type: { apiKey: data.apiKey, type: data.type as any } },
      update: {
        ...data,
        organizationId: org.id
      },
      create: {
        ...data,
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
