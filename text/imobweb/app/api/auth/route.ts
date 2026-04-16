import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

const MOCK_USERS = [
  {
    id: "1",
    name: "Admin",
    email: "admin@imobweb.com",
    password: "admin123",
    phone: "11999999999",
    role: "admin",
  },
  {
    id: "2",
    name: "Corretor",
    email: "corretor@imobweb.com",
    password: "corretor123",
    phone: "11888888888",
    role: "agent",
  },
  {
    id: "3",
    name: "João Silva",
    email: "joao@email.com",
    password: "joao12345",
    phone: "11777777777",
    role: "agent",
  },
];

const MOCK_RESET_TOKENS = new Map<string, { email: string; expires: Date }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "login") {
      const { email, password } = loginSchema.parse(body);

      const user = MOCK_USERS.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) {
        return NextResponse.json(
          { error: "E-mail ou senha incorretos" },
          { status: 401 },
        );
      }

      const token = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (action === "register") {
      const { name, email, phone, password } = registerSchema.parse(body);

      const existingUser = MOCK_USERS.find((u) => u.email === email);
      if (existingUser) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado" },
          { status: 400 },
        );
      }

      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        password,
        phone,
        role: "agent",
      };

      const token = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      return NextResponse.json(
        {
          success: true,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
          token,
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        { status: 201 },
      );
    }

    if (action === "forgot-password") {
      const { email } = forgotPasswordSchema.parse(body);

      const user = MOCK_USERS.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json(
          { error: "E-mail não encontrado" },
          { status: 404 },
        );
      }

      const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      MOCK_RESET_TOKENS.set(resetToken, { email, expires });

      console.log(
        `[Auth] Password reset link: /reset-password?token=${resetToken}`,
      );

      return NextResponse.json({
        success: true,
        message: "Link de recuperação enviado para o e-mail",
      });
    }

    if (action === "reset-password") {
      const { token, password } = resetPasswordSchema.parse(body);

      const resetData = MOCK_RESET_TOKENS.get(token);
      if (!resetData) {
        return NextResponse.json(
          { error: "Token inválido ou expirado" },
          { status: 400 },
        );
      }

      if (resetData.expires < new Date()) {
        MOCK_RESET_TOKENS.delete(token);
        return NextResponse.json({ error: "Token expirado" }, { status: 400 });
      }

      console.log(`[Auth] Password reset for ${resetData.email}`);

      MOCK_RESET_TOKENS.delete(token);

      return NextResponse.json({
        success: true,
        message: "Senha redefinida com sucesso",
      });
    }

    if (action === "verify-token") {
      const { token } = z.object({ token: z.string() }).parse(body);

      const resetData = MOCK_RESET_TOKENS.get(token);
      if (!resetData || resetData.expires < new Date()) {
        return NextResponse.json({ valid: false }, { status: 400 });
      }

      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 },
      );
    }
    console.error("[Auth] Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "me") {
    return NextResponse.json({
      user: {
        id: "1",
        name: "Admin",
        email: "admin@imobweb.com",
        role: "admin",
      },
    });
  }

  return NextResponse.json({ message: "Auth API" });
}
