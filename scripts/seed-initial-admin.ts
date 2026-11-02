import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database...");

  // 1. Create or find Organization
  let org = await prisma.organization.findFirst({
    where: { name: "ImobWeb Matriz" },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "ImobWeb Matriz",
        email: "contato@imobweb.com.br",
        phone: "11999999999",
        status: "ATIVO",
      },
    });
    console.log("✅ Created Organization:", org.name, org.id);
  } else {
    console.log("ℹ️ Organization already exists:", org.name, org.id);
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 3. Create or update Master Admin user
  const adminEmail = "admin@imobweb.com.br";
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const adminUser = await prisma.user.create({
      data: {
        name: "Administrador Master",
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.PLATFORM_MASTER,
        status: "ATIVO",
        organizationId: org.id,
      },
    });
    console.log("✅ Created Admin User:", adminUser.email, adminUser.id);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: UserRole.PLATFORM_MASTER,
        status: "ATIVO",
      },
    });
    console.log("✅ Updated Admin User password:", adminEmail);
  }

  console.log("\n🚀 Setup Complete!");
  console.log("-----------------------------------------");
  console.log("Admin Email:    admin@imobweb.com.br");
  console.log("Admin Password: admin123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
