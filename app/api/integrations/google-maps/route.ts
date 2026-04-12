import { NextRequest, NextResponse } from "next/server";

/**
 * Google Maps / Places API Proxy for imobWeb
 * Securely fetches address data from Google without exposing the API Key.
 * GET /api/integrations/google-maps?query=...
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Google Maps API] Proxy error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
