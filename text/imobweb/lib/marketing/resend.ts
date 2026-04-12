import { Resend } from "resend";

/**
 * Resend Integration for imobWeb
 * Centralized service for transactional emails and sequences.
 */

if (!process.env.RESEND_API_KEY) {
  console.warn("[Marketing] RESEND_API_KEY is missing. Emails will not be sent.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_fallback_key");

interface SendEmailProps {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  text?: string;
}

export async function sendEmail({ to, subject, react, text }: SendEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "imobWeb <no-reply@imobweb.com>",
      to,
      subject,
      react,
      text: text || "",
    });

    if (error) {
      console.error("[Marketing] Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Marketing] Unexpected error in sendEmail:", err);
    return { success: false, error: err };
  }
}
