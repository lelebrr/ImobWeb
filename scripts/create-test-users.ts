import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function createTestUsers() {
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ Variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required",
    );
    console.log("ENV file loaded:", process.env.ENV_LOADED);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const users = [
    {
      email: "admin@imobweb.com.br",
      password: "admin",
      name: "Administrador Master",
      role: "PLATFORM_MASTER",
    },
    {
      email: "imobiliaria@imobweb.com.br",
      password: "imobiliaria",
      name: "Imobiliária Demo",
      role: "AGENCY_MASTER",
    },
  ];

  for (const userData of users) {
    try {
      // Check if user exists
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users.find(u => u.email === userData.email);

      if (existingUser) {
        const { data: authUser, error: authError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: userData.password }
        );

        if (authError) {
          console.log(`⚠️ ${userData.email} (update): ${authError.message}`);
        } else {
          console.log(`✅ Updated password for: ${userData.email}`);
        }
      } else {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });

        if (authError) {
          console.log(`⚠️ ${userData.email} (create): ${authError.message}`);
        } else {
          console.log(`✅ Created: ${userData.email}`);
        }
      }
    } catch (err: any) {
      console.log(`⚠️ ${userData.email}: ${err.message}`);
    }
  }

  console.log("\n📧 Test accounts ready!");
  console.log("   admin@imobweb.com.br / admin");
  console.log("   imobiliaria@imobweb.com.br / imobiliaria");
}

createTestUsers();
