/**
 * INITIALIZATION SCRIPT - RBAC ELITE
 * ImobWeb 2026
 *
 * Sets up the first Platform Master and initializes organization quotas.
 */

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando inicialização do RBAC Elite...");

  // 1. Identificar ou Criar a Organização da Plataforma (ImobWeb)
  let imobWebOrg = await prisma.organization.findFirst({
    where: { isPlatform: true },
  });

  if (!imobWebOrg) {
    imobWebOrg = await prisma.organization.create({
      data: {
        name: "ImobWeb Team",
        isPlatform: true,
        email: "contato@imobweb.com.br",
        status: "ATIVO",
        roleQuotas: {
          PLATFORM_MASTER: 999,
          PLATFORM_MARKETING: 999,
          PLATFORM_FINANCE: 999,
          PLATFORM_SUPPORT: 999,
        },
      },
    });
    console.log("✅ Organização ImobWeb criada.");
  }

  // 2. Criar/Atualizar o Administrador Master (God Mode)
  const masterAdmin = await prisma.user.upsert({
    where: { email: "admin@imobweb.com.br" },
    update: {
      role: "PLATFORM_MASTER",
      organizationId: imobWebOrg.id,
    },
    create: {
      name: "Admin Master",
      email: "admin@imobweb.com.br",
      password: "mudar-depois-seguro", // Em produção isso viria de uma var de ambiente
      role: "PLATFORM_MASTER",
      organizationId: imobWebOrg.id,
      status: "ATIVO",
    },
  });
  console.log(`✅ Administrador Master configurado: ${masterAdmin.email}`);

  // 3. Inicializar Cotas Padrão para Imobiliárias Existentes
  const organizations = await prisma.organization.findMany({
    where: { isPlatform: false },
  });

  for (const org of organizations) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        roleQuotas: {
          AGENCY_MASTER: 1,
          AGENCY_SALES: 5,
          AGENCY_HR: 1,
          AGENCY_MARKETING: 1,
          AGENCY_FINANCE: 1,
          AGENCY_SUPPORT: 2,
        },
      },
    });
  }
  console.log(
    `✅ Cotas iniciais aplicadas a ${organizations.length} imobiliárias.`,
  );

  console.log("✨ Inicialização concluída com sucesso!");
}

async function run() {
  try {
    await main();
  } catch (e) {
    console.error("❌ Erro durante a inicialização:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
