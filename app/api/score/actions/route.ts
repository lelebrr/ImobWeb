import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId é obrigatório" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { propertyId, action, data } = body;

    switch (action) {
      case "refresh": {
        const result = await prisma.property.update({
          where: { id: propertyId },
          data: { updatedAt: new Date() },
        });
        return NextResponse.json({ success: true, property: result });
      }

      case "unblock": {
        const result = await prisma.property.update({
          where: { id: propertyId },
          data: { status: "DISPONIVEL" },
        });
        return NextResponse.json({ success: true, property: result });
      }

      case "applyRecommendation": {
        const { recommendationType, value } = data;

        let updateData: any = { updatedAt: new Date() };

        switch (recommendationType) {
          case "adjust_price":
            updateData.price = parseFloat(value);
            break;
          case "update_description":
            updateData.description = value;
            break;
        }

        const result = await prisma.property.update({
          where: { id: propertyId },
          data: updateData,
        });

        return NextResponse.json({ success: true, property: result });
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Score Actions] Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
