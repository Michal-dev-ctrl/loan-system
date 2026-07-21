import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildReceiptEmailText,
  missingResendKeyMessage,
  resolveReceiptDestination,
} from "../../../lib/email/receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

const FROM =
  process.env.RESEND_FROM?.trim() ||
  "גמ״ח אור לכלה <onboarding@resend.dev>";

export async function POST(request: Request) {
  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json(
      { error: missingResendKeyMessage() },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { to, subject, text } = body as {
      to?: string;
      subject?: string;
      text?: string;
    };

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { error: "נא להזין כתובת מייל תקינה" },
        { status: 400 },
      );
    }

    const { to: destination, customerEmail } = resolveReceiptDestination(to);
    const subjectStr =
      typeof subject === "string" && subject.trim() ? subject : "קבלה";
    const textStr = buildReceiptEmailText(
      typeof text === "string" ? text : "",
      customerEmail,
    );

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [destination],
      subject: subjectStr,
      text: textStr,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "שליחת המייל נכשלה" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      sentTo: destination,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "שגיאה לא צפויה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
