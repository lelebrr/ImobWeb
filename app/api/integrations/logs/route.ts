import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const portalId = searchParams.get("portalId");
    const action = searchParams.get("action");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: user.organization.id,
    };

    if (portalId) {
      where.portalId = portalId;
    }

    if (action) {
      where.action = action;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      prisma.integrationEvent.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: offset,
        take: limit,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              type: true,
              price: true,
            },
          },
        },
      }),
      prisma.integrationEvent.count({ where }),
    ]);

    // Get unique portal IDs for filtering
    const uniquePortals = await prisma.integrationEvent.findMany({
      where: { organizationId: user.organization.id },
      select: { portalId: true },
      distinct: ["portalId"],
    });

    // Get unique actions for filtering
    const uniqueActions = await prisma.integrationEvent.findMany({
      where: { organizationId: user.organization.id },
      select: { action: true },
      distinct: ["action"],
    });

    // Get unique statuses for filtering
    const uniqueStatuses = await prisma.integrationEvent.findMany({
      where: { organizationId: user.organization.id },
      select: { status: true },
      distinct: ["status"],
    });

    // Calculate stats
    const stats = {
      totalEvents: totalCount,
      successEvents: await prisma.integrationEvent.count({
        where: { ...where, status: "SUCCESS" },
      }),
      errorEvents: await prisma.integrationEvent.count({
        where: { ...where, status: "ERROR" },
      }),
      todayEvents: await prisma.integrationEvent.count({
        where: {
          ...where,
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    };

    return NextResponse.json({
      logs: logs.map((log: any) => ({
        ...log,
        property: log.property
          ? {
              id: log.property.id,
              title: log.property.title,
              type: log.property.propertyType,
              price: log.property.price,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      filters: {
        portals: uniquePortals.map((p: any) => p.portalId),
        actions: uniqueActions.map((a: any) => a.action),
        statuses: uniqueStatuses.map((s: any) => s.status),
      },
      stats,
    });
  } catch (err) {
    console.error("[Logs API] GET error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portalId, action, status, message, metadata, propertyId } =
      await req.json();

    if (!portalId || !action) {
      return NextResponse.json(
        { error: "Portal ID and action are required" },
        { status: 400 },
      );
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Create the log entry
    const log = await prisma.integrationEvent.create({
      data: {
        organizationId: user.organizationId,
        portalId,
        action,
        status: status || "PENDING",
        message,
        metadata: metadata || {},
        propertyId,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (err) {
    console.error("[Logs API] POST error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
