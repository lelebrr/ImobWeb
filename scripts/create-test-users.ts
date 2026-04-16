import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function createTestUsers() {
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ Variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required",
    );
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
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });

      if (authError) {
        console.log(`⚠️ ${userData.email}: ${authError.message}`);
      } else {
        console.log(`✅ Created: ${userData.email}`);
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
