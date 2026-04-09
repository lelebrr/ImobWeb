import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/marketing/resend";
import WelcomeEmail from "@/lib/marketing/templates/WelcomeEmail";

/**
 * Trigger Route for Welcome Sequence
 * POST /api/marketing/sequences/welcome
 */

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Disparo do e-mail de boas-vindas
    const result = await sendEmail({
      to: email,
      subject: "Bem-vindo ao imobWeb! 🚀",
      react: WelcomeEmail({ userName: name || "Parceiro", loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login` }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (err) {
    console.error("[Marketing API] Error in welcome sequence:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
