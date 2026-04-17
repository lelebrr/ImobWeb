import { PrismaClient } from "@prisma/client";
import { PortalId, PortalIntegrationStatus } from "@/types/portals";

const prisma = new PrismaClient();

/**
 * Representa um evento de integração
 */
export interface IntegrationEvent {
  id: string;
  organizationId?: string;
  portalId: PortalId;
  propertyId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "SYNC" | "ERROR";
  status: "SUCCESS" | "FAILED" | "PENDING";
  timestamp: Date;
  details?: Record<string, unknown>;
  error?: string;
  responseTime?: number;
}

/**
 * Representa métricas de saúde de integração
 */
export interface IntegrationHealthMetrics {
  portalId: PortalId;
  totalEvents: number;
  successRate: number; // 0-100
  averageResponseTime: number;
  errorRate: number; // 0-100
  lastSync: Date | null;
  uptime: number; // percentage
}

/**
 * Configuração de monitoramento
 */
export interface MonitoringConfig {
  checkInterval: number; // in minutes
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // milliseconds
    uptime: number; // percentage
  };
  notifications: {
    email: boolean;
    webhook?: string;
    slack?: string;
  };
}

/**
 * Sistema de monitoramento e logs de integração
 */
export class IntegrationMonitor {
  protected config: MonitoringConfig;
  private isRunning: boolean = false;
  private checkIntervalId?: NodeJS.Timeout;

  constructor(
    config: MonitoringConfig = {
      checkInterval: 5,
      alertThresholds: {
        errorRate: 10,
        responseTime: 5000,
        uptime: 95,
      },
      notifications: {
        email: true,
      },
    },
  ) {
    this.config = config;
  }

  /**
   * Inicia o monitoramento
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[IntegrationMonitor] Monitor is already running");
      return;
    }

    this.isRunning = true;
    console.log("[IntegrationMonitor] Starting monitoring...");

    // Executa imediatamente e depois em intervalos
    this.checkIntegrations();
    this.checkIntervalId = setInterval(
      () => this.checkIntegrations(),
      this.config.checkInterval * 60 * 1000,
    );

    // Também agenda verificações de saúde
    this.scheduleHealthChecks();
  }

  /**
   * Para o monitoramento
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    console.log("[IntegrationMonitor] Monitoring stopped");
  }

  /**
   * Registra um evento de integração
   */
  async logEvent(event: {
    organizationId?: string;
    portalId: string;
    propertyId?: string;
    action: string;
    status: string;
    timestamp: Date;
    error?: string;
    details?: Record<string, any>;
    responseTime?: number;
  }): Promise<string> {
    try {
      const eventData: any = {
        organizationId: event.organizationId,
        portalId: event.portalId,
        action: event.action,
        status: event.status,
        timestamp: event.timestamp,
        message: event.error || undefined,
      };

      if (event.propertyId) {
        eventData.propertyId = event.propertyId;
      }

      if (event.details) {
        eventData.metadata = JSON.stringify({
          ...event.details,
          responseTime: event.responseTime,
        });
      }

      const createdEvent = await prisma.integrationEvent.create({
        data: eventData,
      });

      // Verificar se precisa enviar alerta
      if (event.status === "FAILED") {
        await this.handleAlert(event as IntegrationEvent);
      }

      return createdEvent.id;
    } catch (error) {
      console.error("[IntegrationMonitor] Failed to log event:", error);
      throw error;
    }
  }

  /**
   * Obtém eventos de integração
   */
  async getEvents(
    filters: {
      portalId?: PortalId;
      propertyId?: string;
      action?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<IntegrationEvent[]> {
    const where: any = {};

    if (filters.portalId) {
      where.portalId = filters.portalId;
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const events = await prisma.integrationEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    return events.map((event) => ({
      id: event.id,
      portalId: event.portalId as PortalId,
      propertyId: event.propertyId || "",
      action: event.action as IntegrationEvent["action"],
      status: event.status as IntegrationEvent["status"],
      timestamp: event.timestamp,
      details: event.metadata as Record<string, unknown> | undefined,
      error: event.message || undefined,
    }));
  }

  /**
   * Obtém métricas de saúde para um portal
   */
  async getHealthMetrics(
    portalId: PortalId,
  ): Promise<IntegrationHealthMetrics> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Buscar eventos das últimas 24 horas
    const events = await prisma.integrationEvent.findMany({
      where: {
        portalId,
        timestamp: { gte: last24Hours },
      },
    });

    const totalEvents = events.length;
    const successEvents = events.filter((e) => e.status === "SUCCESS").length;
    const failedEvents = events.filter((e) => e.status === "FAILED").length;

    const totalResponseTime = events.reduce((sum, e) => {
      const metadata = e.metadata as { responseTime?: number } | null;
      return sum + (metadata?.responseTime || 0);
    }, 0);
    const averageResponseTime =
      totalEvents > 0 ? totalResponseTime / totalEvents : 0;

    const successRate =
      totalEvents > 0 ? (successEvents / totalEvents) * 100 : 0;
    const errorRate = totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0;

    // Obter último sync
    const lastSync = await prisma.portalIntegration.findFirst({
      where: { id: portalId },
      select: { lastSync: true },
    });

    // Calcular uptime (baseado em eventos bem-sucedidos vs totais)
    const uptime = totalEvents > 0 ? successRate : 100;

    return {
      portalId,
      totalEvents,
      successRate,
      averageResponseTime,
      errorRate,
      lastSync: lastSync?.lastSync || null,
      uptime,
    };
  }

  /**
   * Obtém todas as métricas de saúde
   */
  async getAllHealthMetrics(): Promise<IntegrationHealthMetrics[]> {
    const integrations = await prisma.portalIntegration.findMany({
      where: { status: "ATIVO" as any },
    });

    const metrics = await Promise.all(
      integrations.map((int) => this.getHealthMetrics(int.id as PortalId)),
    );

    return metrics;
  }

  /**
   * Verifica integridade de todas as integrações
   */
  private async checkIntegrations(): Promise<void> {
    console.log("[IntegrationMonitor] Checking integrations...");

    try {
      const integrations = await prisma.portalIntegration.findMany({
        where: { status: "ATIVO" as any },
      });

      for (const integration of integrations) {
        await this.checkIntegrationHealth(integration.id as PortalId);
      }
    } catch (error) {
      console.error("[IntegrationMonitor] Error checking integrations:", error);
    }
  }

  /**
   * Verifica saúde de uma integração específica
   */
  private async checkIntegrationHealth(portalId: PortalId): Promise<void> {
    try {
      const metrics = await this.getHealthMetrics(portalId);

      // Verificar thresholds
      const alerts: string[] = [];

      if (metrics.errorRate > this.config.alertThresholds.errorRate) {
        alerts.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
      }

      if (
        metrics.averageResponseTime > this.config.alertThresholds.responseTime
      ) {
        alerts.push(
          `High response time: ${metrics.averageResponseTime.toFixed(2)}ms`,
        );
      }

      if (metrics.uptime < this.config.alertThresholds.uptime) {
        alerts.push(`Low uptime: ${metrics.uptime.toFixed(2)}%`);
      }

      if (alerts.length > 0) {
        await this.sendAlert(
          portalId,
          "Health check failed",
          alerts.join(", "),
        );
      }

      // Registrar evento de verificação
      await this.logEvent({
        portalId,
        propertyId: "system",
        action: "SYNC",
        status: "SUCCESS",
        timestamp: new Date(),
        details: { metrics },
      });
    } catch (error) {
      console.error(
        `[IntegrationMonitor] Error checking health for ${portalId}:`,
        error,
      );

      await this.logEvent({
        portalId,
        propertyId: "system",
        action: "SYNC",
        status: "FAILED",
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Agenda verificações de saúde adicionais
   */
  private scheduleHealthChecks(): void {
    // Verificar a cada hora
    setInterval(
      () => {
        this.checkIntegrations();
      },
      60 * 60 * 1000,
    );

    // Gerar relatório diário
    setInterval(
      () => {
        this.generateDailyReport();
      },
      24 * 60 * 60 * 1000,
    );
  }

  /**
   * Envia alerta
   */
  private async handleAlert(event: IntegrationEvent): Promise<void> {
    const alertMessage = `Integration alert for ${event.portalId}: ${event.action} ${event.status}`;

    if (this.config.notifications.email) {
      await this.sendEmailAlert(alertMessage, event);
    }

    if (this.config.notifications.webhook) {
      await this.sendWebhookAlert(alertMessage, event);
    }

    if (this.config.notifications.slack) {
      await this.sendSlackAlert(alertMessage, event);
    }
  }

  /**
   * Envia alerta genérico
   */
  private async sendAlert(
    portalId: PortalId,
    title: string,
    message: string,
  ): Promise<void> {
    const alertMessage = `[${portalId}] ${title}: ${message}`;

    if (this.config.notifications.email) {
      await this.sendEmailAlert(alertMessage);
    }

    if (this.config.notifications.webhook) {
      await this.sendWebhookAlert(alertMessage);
    }

    if (this.config.notifications.slack) {
      await this.sendSlackAlert(alertMessage);
    }
  }

  /**
   * Envia alerta por email
   */
  private async sendEmailAlert(
    message: string,
    event?: IntegrationEvent,
  ): Promise<void> {
    // Implementar envio de email
    console.log(`[IntegrationMonitor] Email alert: ${message}`);
    // Aqui você integraria com um serviço de email como SendGrid, AWS SES, etc.
  }

  /**
   * Envia alerta por webhook
   */
  private async sendWebhookAlert(
    message: string,
    event?: IntegrationEvent,
  ): Promise<void> {
    if (!this.config.notifications.webhook) return;

    try {
      await fetch(this.config.notifications.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          event,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error(
        "[IntegrationMonitor] Failed to send webhook alert:",
        error,
      );
    }
  }

  /**
   * Envia alerta para Slack
   */
  private async sendSlackAlert(
    message: string,
    event?: IntegrationEvent,
  ): Promise<void> {
    if (!this.config.notifications.slack) return;

    try {
      await fetch(this.config.notifications.slack, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          attachments: event
            ? [
                {
                  color: "danger",
                  fields: [
                    { title: "Portal", value: event.portalId, short: true },
                    { title: "Action", value: event.action, short: true },
                    { title: "Status", value: event.status, short: true },
                    {
                      title: "Timestamp",
                      value: event.timestamp.toISOString(),
                      short: false,
                    },
                  ],
                },
              ]
            : [],
        }),
      });
    } catch (error) {
      console.error("[IntegrationMonitor] Failed to send Slack alert:", error);
    }
  }

  /**
   * Gera relatório diário
   */
  private async generateDailyReport(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    try {
      const events = await this.getEvents({
        startDate: yesterday,
        endDate: today,
      });

      const metrics = await this.getAllHealthMetrics();

      const report = {
        date: today.toISOString().split("T")[0],
        totalEvents: events.length,
        successEvents: events.filter((e) => e.status === "SUCCESS").length,
        failedEvents: events.filter((e) => e.status === "FAILED").length,
        averageResponseTime:
          events.reduce((sum, e) => sum + (e.responseTime || 0), 0) /
            events.length || 0,
        portals: metrics.map((m) => ({
          id: m.portalId,
          successRate: m.successRate,
          errorRate: m.errorRate,
          averageResponseTime: m.averageResponseTime,
          uptime: m.uptime,
        })),
      };

      console.log("[IntegrationMonitor] Daily report generated:", report);

      // Salvar relatório no banco de dados
      await prisma.dailyReport.create({
        data: {
          date: today,
          report: report,
        },
      });
    } catch (error) {
      console.error(
        "[IntegrationMonitor] Failed to generate daily report:",
        error,
      );
    }
  }

  /**
   * Obtém relatório diário
   */
  async getDailyReport(date?: Date): Promise<any> {
    const targetDate = date || new Date();
    const report = await prisma.dailyReport.findFirst({
      where: {
        date: {
          gte: new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
          ),
          lt: new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate() + 1,
          ),
        },
      },
    });

    return report?.report || null;
  }
}

/**
 * Instância global do monitoramento
 */
export const integrationMonitor = new IntegrationMonitor();

/**
 * Função utilitária para iniciar monitoramento
 */
export function startMonitoring(config?: MonitoringConfig): void {
  integrationMonitor.start();
}

/**
 * Função utilitária para parar monitoramento
 */
export function stopMonitoring(): void {
  integrationMonitor.stop();
}

/**
 * Função utilitária para registrar evento
 */
export async function logIntegrationEvent(
  event: Omit<IntegrationEvent, "id">,
): Promise<string> {
  return integrationMonitor.logEvent(event);
}
