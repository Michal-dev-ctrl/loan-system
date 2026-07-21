/**
 * בלי דומיין מאומת, Resend מאפשר שליחה רק למייל של בעל החשבון.
 * אצלך זה ms0556771200@gmail.com (כפי שמופיע בהודעת השגיאה של Resend).
 * אפשר לשנות ב־Vercel עם RECEIPT_EMAIL_TO אחרי שאימות דומיין יאפשר כתובות אחרות.
 */
export const DEFAULT_RECEIPT_TO = "ms0556771200@gmail.com";

export function getConfiguredReceiptTo(): string {
  const fromEnv = process.env.RECEIPT_EMAIL_TO?.trim();
  if (fromEnv && fromEnv.includes("@")) return fromEnv;
  return DEFAULT_RECEIPT_TO;
}

/** כשמופעל (אחרי דומיין מאומת) – אפשר לשלוח לכתובת שהמשתמשת הזינה */
export function allowCustomReceiptTo(): boolean {
  const raw = process.env.RECEIPT_ALLOW_CUSTOM_TO?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

/**
 * כרגע הקבלה נשלחת למייל הגמ״ח הקבוע.
 * אם RECEIPT_ALLOW_CUSTOM_TO=true וניתנה כתובת תקינה – שולחים אליה.
 * אחרת כתובת הלקוח נשמרת רק בגוף המייל לתיעוד.
 */
export function resolveReceiptDestination(requestedTo?: string): {
  to: string;
  customerEmail: string | null;
  usedCustomTo: boolean;
} {
  const customer =
    typeof requestedTo === "string" && requestedTo.trim().includes("@")
      ? requestedTo.trim()
      : null;

  if (allowCustomReceiptTo() && customer) {
    return { to: customer, customerEmail: customer, usedCustomTo: true };
  }

  return {
    to: getConfiguredReceiptTo(),
    customerEmail: customer,
    usedCustomTo: false,
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
