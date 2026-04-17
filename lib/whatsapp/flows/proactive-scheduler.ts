/**
 * Proactive Message Scheduler - ImobWeb 2026
 * Agenda e executa mensagens proativas para proprietários
 */

import { prisma } from "@/lib/prisma";
import { PropertyUpdateData, FlowType } from "@/types/whatsapp";
import { conversationEngine } from "@/lib/whatsapp/flows/conversation-engine";

const SCHEDULE_INTERVAL = 60 * 60 * 1000; // 1 hora

interface PropertyHealth {
  propertyId: string;
  views30Days: number;
  views45Days: number;
  daysSinceListing: number;
  daysToExpire: number;
  priceSuggestion?: number;
  marketTrend?: "up" | "down" | "stable";
  healthScore: number;
}

class ProactiveScheduler {
  private intervalId?: NodeJS.Timeout;

  start() {
    console.log("[ProactiveScheduler] Starting scheduler...");
    this.intervalId = setInterval(
      () => this.executeScheduledTasks(),
      SCHEDULE_INTERVAL,
    );
    this.executeScheduledTasks(); // Executa imediatamente
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async executeScheduledTasks() {
    console.log("[ProactiveScheduler] Checking properties...");

    try {
      await this.check30DayUpdates();
      await this.check45DayUpdates();
      await this.checkExpiringSoon();
      await this.checkLowViews();
    } catch (error) {
      console.error("[ProactiveScheduler] Error:", error);
    }
  }

  private async check30DayUpdates() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const properties = await prisma.property.findMany({
      where: {
        status: "ATIVO" as any,
        createdAt: { lte: thirtyDaysAgo },
      },
      include: { owner: true, announcements: true },
    });

    for (const property of properties) {
      if (!property.owner?.whatsapp) continue;

      const lastMessage = await this.getLastOwnerMessage(
        property.owner.whatsapp,
        "PROPERTY_UPDATE_30D",
      );
      if (lastMessage) continue;

      const health = await this.calculatePropertyHealth(property);

      console.log(
        "[ProactiveScheduler] Sending 30-day update for:",
        property.id,
      );

      await conversationEngine.startOwnerFlow(property.id, "PROPERTY_UPDATE", {
        views30Days: health.views30Days,
        healthScore: health.healthScore,
        daysToExpire: health.daysToExpire,
      });
    }
  }

  private async check45DayUpdates() {
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const properties = await prisma.property.findMany({
      where: {
        status: "ATIVO" as any,
        createdAt: { lte: fortyFiveDaysAgo },
      },
      include: { owner: true },
    });

    for (const property of properties) {
      if (!property.owner?.whatsapp) continue;

      const lastMessage = await this.getLastOwnerMessage(
        property.owner.whatsapp,
        "PROPERTY_UPDATE_45D",
      );
      if (lastMessage) continue;

      const health = await this.calculatePropertyHealth(property);

      console.log(
        "[ProactiveScheduler] Sending 45-day update for:",
        property.id,
      );

      await conversationEngine.startOwnerFlow(property.id, "PROPERTY_UPDATE", {
        views30Days: health.views30Days,
        healthScore: health.healthScore,
        daysToExpire: health.daysToExpire,
      });
    }
  }

  private async check60DayUpdates() {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const properties = await prisma.property.findMany({
      where: {
        status: "ATIVO" as any,
        createdAt: { lte: sixtyDaysAgo },
      },
      include: { owner: true },
    });

    for (const property of properties) {
      if (!property.owner?.whatsapp) continue;

      const health = await this.calculatePropertyHealth(property);

      if (health.healthScore < 70 || health.views45Days < 20) {
        console.log(
          "[ProactiveScheduler] Sending 45-day price suggestion for:",
          property.id,
        );

        await conversationEngine.startOwnerFlow(
          property.id,
          "PRICE_SUGGESTION",
          {
            views45Days: health.views45Days,
            priceSuggestion: health.priceSuggestion,
            marketTrend: health.marketTrend,
            healthScore: health.healthScore,
            daysToExpire: health.daysToExpire,
          },
        );
      }
    }
  }

  private async checkExpiringSoon() {
    const in15Days = new Date();
    in15Days.setDate(in15Days.getDate() + 15);

    const properties = await prisma.property.findMany({
      where: {
        status: "ATIVO" as any,
        announcements: {
          some: {
            expiresAt: { lte: in15Days },
          },
        },
      },
      include: { owner: true },
    });

    for (const property of properties) {
      if (!property.owner?.whatsapp) continue;

      const health = await this.calculatePropertyHealth(property);

      console.log(
        "[ProactiveScheduler] Sending expiring reminder for:",
        property.id,
      );

      await conversationEngine.startOwnerFlow(
        property.id,
        "EXPIRING_REMINDER",
        {
          isExpiringSoon: true,
          daysToExpire: health.daysToExpire,
          healthScore: health.healthScore,
        },
      );
    }
  }

  private async checkLowViews() {
    const properties = await prisma.property.findMany({
      where: { status: "ATIVO" as any },
      include: { owner: true },
    });

    for (const property of properties) {
      if (!(property as any).owner?.whatsapp) continue;

      const health = await this.calculatePropertyHealth(property as any);

      if (health.views30Days < 10 && health.daysSinceListing > 14) {
        console.log("[ProactiveScheduler] Low views alert for:", property.id);

        await conversationEngine.startOwnerFlow(property.id, "PHOTO_REQUEST", {
          views30Days: health.views30Days,
          healthScore: health.healthScore,
          photoQuality: health.views30Days < 5 ? "poor" : "needs_improvement",
        });
      }
    }
  }

  private async calculatePropertyHealth(
    property: any,
  ): Promise<PropertyHealth> {
    const now = new Date();
    const daysSinceListing = Math.floor(
      (now.getTime() - new Date(property.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const views = property.views || 0;
    const views30 = Math.floor(views * 0.7);
    const views45 = views;

    let healthScore = 50;
    if (views30 > 50) healthScore = 90;
    else if (views30 > 30) healthScore = 75;
    else if (views30 > 15) healthScore = 60;
    else healthScore = 40;

    const priceSuggestion = property.price
      ? Math.floor(Number(property.price) * 0.95)
      : undefined;

    const daysToExpire = 30 - daysSinceListing;

    return {
      propertyId: property.id,
      views30Days: views30,
      views45Days: views45,
      daysSinceListing,
      daysToExpire: Math.max(0, daysToExpire),
      priceSuggestion,
      marketTrend: "stable",
      healthScore,
    };
  }

  private async getLastOwnerMessage(
    phone: string,
    flowType: string,
  ): Promise<boolean> {
    try {
      const conv = await prisma.conversation.findFirst({
        where: {
          lead: { whatsapp: phone },
        },
        orderBy: { createdAt: "desc" },
      });
      return !!conv;
    } catch {
      return false;
    }
  }
}

export const proactiveScheduler = new ProactiveScheduler();
export default proactiveScheduler;
