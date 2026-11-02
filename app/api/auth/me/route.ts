import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("imobweb_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      user_metadata: {
        role: payload.role,
        organizationId: payload.organizationId,
        name: payload.name,
      },
    },
    role: payload.role,
    organizationId: payload.organizationId,
  });
}
