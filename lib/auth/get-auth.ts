import { NextRequest } from "next/server";
import { verifyToken, UserTokenPayload } from "./jwt";

export async function getAuthFromRequest(
  request: NextRequest
): Promise<UserTokenPayload | null> {
  // 1. Tentar ler do cookie
  let token = request.cookies.get("imobweb_token")?.value;

  // 2. Se não estiver no cookie, tentar ler do Header Authorization: Bearer <token>
  if (!token) {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}
