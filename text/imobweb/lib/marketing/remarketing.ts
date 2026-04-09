import { analytics } from "@/lib/analytics/posthog";
import { sendEmail } from "./resend";
import WelcomeEmail from "./templates/WelcomeEmail"; // Placeholder for specific remarketing temp

/**
 * Behavioral Remarketing Engine for imobWeb
 * Analyzes user events and triggers targeted campaigns.
 */

interface UserBehavior {
  userId: string;
  email: string;
  viewedProperties: string[];
  lastActive: Date;
  hasConverted: boolean;
}

/**
 * Triggers a sequence if a user viewed a property but didn't convert
 */
export async function triggerRetargetingIfAbandoned(user: UserBehavior) {
  if (user.hasConverted) return;

  if (user.viewedProperties.length > 0) {
    console.log(`[Remarketing] Triggering retargeting for ${user.email} (viewed ${user.viewedProperties.length} props)`);
    
    // In a real scenario, this would choose a specific template
    await sendEmail({
      to: user.email,
      subject: "Ainda interessado naquele imóvel? 🏠",
      react: WelcomeEmail({ userName: "Interessado", loginUrl: `https://imobweb.com/imovel/${user.viewedProperties[0]}` }),
    });

    analytics.capture("remarketing_sent", {
      userId: user.userId,
      strategy: "abandoned_view",
    });
  }
}

/**
 * Segments users by cold/warm/hot leads
 */
export function segmentLead(viewCount: number, contactCount: number) {
  if (contactCount > 1) return "HOT";
  if (viewCount > 5) return "WARM";
  return "COLD";
}
