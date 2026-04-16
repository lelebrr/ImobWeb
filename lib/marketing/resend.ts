import { Resend } from "resend";

/**
 * Resend Integration for imobWeb
 * Centralized service for transactional emails and sequences.
 * Uses lazy initialization to prevent build-time crashes when
 * RESEND_API_KEY is not available.
 */

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Marketing] RESEND_API_KEY is missing. Emails will not be sent.");
      // Return a dummy instance that will fail gracefully at runtime
      _resend = new Resend("re_placeholder_key");
    } else {
      _resend = new Resend(apiKey);
    }
  }
  return _resend;
}

interface SendEmailProps {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  text?: string;
}

export async function sendEmail({ to, subject, react, text }: SendEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Marketing] Skipping email send — RESEND_API_KEY not configured.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const resend = getResend();
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
