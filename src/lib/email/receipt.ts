/** כתובת ברירת מחדל לקבלת קבלות (חשבון Resend / גמ״ח) */
export const DEFAULT_RECEIPT_TO = "g025871999@gmail.com";

export function getConfiguredReceiptTo(): string {
  const fromEnv = process.env.RECEIPT_EMAIL_TO?.trim();
  if (fromEnv && fromEnv.includes("@")) return fromEnv;
  return DEFAULT_RECEIPT_TO;
}

/**
 * Resend (במיוחד עם onboarding@resend.dev) שולח בדרך כלל רק למייל של בעל החשבון.
 * לכן הקבלה תמיד נשלחת לכתובת הגמ״ח; מייל הלקוח נשמר בגוף ההודעה.
 */
export function resolveReceiptDestination(requestedTo?: string): {
  to: string;
  customerEmail: string | null;
} {
  const customer =
    typeof requestedTo === "string" && requestedTo.trim().includes("@")
      ? requestedTo.trim()
      : null;
  return {
    to: getConfiguredReceiptTo(),
    customerEmail: customer,
  };
}

export function buildReceiptEmailText(
  body: string,
  customerEmail: string | null,
): string {
  const header = customerEmail
    ? `מייל לקוח (לתיעוד): ${customerEmail}\n\n`
    : "";
  return `${header}${body}`;
}

export function missingResendKeyMessage(): string {
  return (
    "חסר מפתח API לשליחת מייל (RESEND_API_KEY). " +
    "ב־Vercel: Project Settings → Environment Variables → הוסיפי RESEND_API_KEY " +
    "מהאתר resend.com → API Keys, ואז Redeploy."
  );
}
