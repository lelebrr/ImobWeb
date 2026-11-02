import { NextRequest } from "next/server";
import { verifyToken, UserTokenPayload } from "./jwt";

export async function getAuthFromRequest(
  request: NextRequest
): Promise<UserTokenPayload | null> {
  const token = request.cookies.get("imobweb_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}
