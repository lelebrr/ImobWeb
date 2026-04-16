import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash("admin", 10);
  const hashedImob = await bcrypt.hash("imobiliaria", 10);

  const org = await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: {
      id: "default-org",
      name: "ImobWeb Demo",
      subDomain: "demo",
      planType: "PREMIUM",
      status: "ATIVO",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@imobweb.com.br" },
    update: {},
    create: {
      name: "Administrador Master",
      email: "admin@imobweb.com.br",
      password: hashedAdmin,
      role: "PLATFORM_MASTER",
      status: "ATIVO",
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "imobiliaria@imobweb.com.br" },
    update: {},
    create: {
      name: "Imobiliária Demo",
      email: "imobiliaria@imobweb.com.br",
      password: hashedImob,
      role: "AGENCY_MASTER",
      status: "ATIVO",
      organizationId: org.id,
    },
  });

  console.log("✅ Contas criadas com sucesso!");
  console.log("📧 admin@imobweb.com.br | senha: admin");
  console.log("📧 imobiliaria@imobweb.com.br | senha: imobiliaria");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
