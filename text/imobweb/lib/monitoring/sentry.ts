import * as Sentry from "@sentry/nextjs";

/**
 * Advanced Sentry Configuration for imobWeb.
 * Focuses on business-critical performance tracing and breadcrumbs.
 */

export const initReporting = () => {
  // Sentry is automatically initialized by @sentry/nextjs in sentry.client.config.ts etc.
  // This helper adds custom tags and context.
  
  Sentry.setTag("app_version", process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0");
};

/**
 * Capture a business logic error with custom context.
 */
export const captureBusinessError = (message: string, context: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setLevel("error");
    scope.setContext("business_context", context);
    Sentry.captureMessage(`Business Error: ${message}`);
  });
};

/**
 * Trace the performance of critical business logic (e.g., IA generation, WhatsApp webhook processing).
 */
export const traceBusinessLogic = async <T>(
  opName: string,
  description: string,
  callback: () => Promise<T>
): Promise<T> => {
  return Sentry.startSpan(
    {
      name: opName,
      op: "business.logic",
      attributes: {
        description,
      },
    },
    async () => {
      try {
        return await callback();
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    }
  );
};

/**
 * Add breadcrumb for business events (e.g., "User clicked publish", "WhatsApp message received").
 */
export const addBusinessBreadcrumb = (category: string, message: string, data?: any) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
    type: "business",
  });
};
