import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM =
  process.env.RESEND_FROM ?? "גמ״ח אור לכלה <onboarding@resend.dev>";

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "חסר מפתח API לשליחת מייל (RESEND_API_KEY)" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { to, subject, text } = body as { to?: string; subject?: string; text?: string };

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { error: "נא להזין כתובת מייל תקינה" },
        { status: 400 }
      );
    }

    const subjectStr = typeof subject === "string" && subject.trim() ? subject : "קבלה";
    const textStr = typeof text === "string" ? text : "";

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to.trim()],
      subject: subjectStr,
      text: textStr,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "שליחת המייל נכשלה" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "שגיאה לא צפויה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
