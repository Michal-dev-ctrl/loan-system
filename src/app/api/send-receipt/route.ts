import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getConfiguredReceiptTo,
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
    const { to, subject, text, html } = body as {
      to?: string;
      subject?: string;
      text?: string;
      html?: string;
    };

    const requested =
      typeof to === "string" && to.trim().includes("@") ? to.trim() : undefined;

    const { to: destination, customerEmail, usedCustomTo } =
      resolveReceiptDestination(requested);

    if (!destination.includes("@")) {
      return NextResponse.json(
        { error: "לא הוגדרה כתובת מייל לקבלת קבלות" },
        { status: 500 },
      );
    }

    const subjectStr =
      typeof subject === "string" && subject.trim() ? subject : "קבלה";
    let textStr = typeof text === "string" ? text : "";
    if (customerEmail && textStr && !textStr.includes(customerEmail)) {
      textStr = `מייל לקוח (לתיעוד): ${customerEmail}\n\n${textStr}`;
    }
    if (!textStr.trim()) {
      return NextResponse.json(
        { error: "חסר תוכן הקבלה לשליחה" },
        { status: 400 },
      );
    }

    const htmlStr = typeof html === "string" && html.trim() ? html : undefined;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [destination],
      subject: subjectStr,
      text: textStr,
      ...(htmlStr ? { html: htmlStr } : {}),
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
      usedCustomTo,
      defaultTo: getConfiguredReceiptTo(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "שגיאה לא צפויה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
