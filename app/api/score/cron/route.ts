import { NextRequest, NextResponse } from "next/server";
import { scoreEngine } from "@/lib/score/score-engine";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await scoreEngine.runScheduledCalculation();

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API Cron] Erro no cálculo agendado:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
