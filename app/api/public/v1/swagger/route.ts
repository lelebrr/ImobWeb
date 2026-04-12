import { NextResponse } from "next/server";
import { apiV1Spec } from "@/lib/public-api/v1-spec";

/**
 * API DOCUMENTATION ENDPOINT (Swagger/OpenAPI)
 * 2026 - Padrão de integração imobWeb
 */

export async function GET() {
  return NextResponse.json(apiV1Spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
