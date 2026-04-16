import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { backupEngine } from "@/lib/backup/backup-engine";

export const dynamic = "force-dynamic";

/**
 * UNIFIED MAINTENANCE CRON
 * Consolidates multiple tasks into a single entry to comply with Vercel Hobby limits (1 cron/day).
 */
export async function GET(request: Request) {
  // 1. Verify Vercel Cron Header (Security)
  // Note: Vercel sends a specific header, but for now we trust the path if it's hitting this.
  // In production, you might check for CRON_SECRET if configured.
  
  const results = {
    health: "pending",
    backup: "pending",
    timestamp: new Date().toISOString()
  };

  try {
    // A. Health check logic
    await prisma.$queryRaw`SELECT 1`;
    results.health = "healthy";

    // B. Backup logic (calling engine directly as the API route was POST-only)
    // We only run this if the environment is ready
    if (process.env.BACKUP_CRON_SECRET) {
      const backupResult = await backupEngine.runFullBackup();
      results.backup = `success (ID: ${backupResult.backupId})`;
    } else {
      results.backup = "skipped (missing configuration)";
    }

    return NextResponse.json({
      status: "success",
      ...results
    });

  } catch (error: any) {
    console.error("[CRON_MAINTENANCE_ERROR]", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      ...results
    }, { status: 500 });
  }
}
