import { digitsOnly } from "./search";

/** טלפון נייד ישראלי: 05X + 8 ספרות (סה״כ 10) */
export function isValidIsraeliMobile(value: string | null | undefined): boolean {
  const digits = digitsOnly(value);
  return /^05\d{8}$/.test(digits);
}

/** מקבל גם מקפים/רווחים; מחזיר ספרות בלבד או מחרוזת ריקה אם לא תקין */
export function normalizeIsraeliMobile(
  value: string | null | undefined,
): string | null {
  const digits = digitsOnly(value);
  return isValidIsraeliMobile(digits) ? digits : null;
}
