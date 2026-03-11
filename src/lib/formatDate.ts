import { HDate, gematriya } from "@hebcal/core";

const HEBREW_MONTH_NAMES: Record<number, string> = {
  1: "ניסן",
  2: "אייר",
  3: "סיון",
  4: "תמוז",
  5: "אב",
  6: "אלול",
  7: "תשרי",
  8: "חשון",
  9: "כסלו",
  10: "טבת",
  11: "שבט",
  12: "אדר",
  13: "אדר ב׳",
};

const WEEKDAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/**
 * Format ISO date (YYYY-MM-DD) as DD-MM-YY.
 */
export function formatDisplayDate(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  const yy = y.length === 4 ? y.slice(-2) : y;
  return `${d}-${m}-${yy}`;
}

/**
 * Format ISO date as short Hebrew date: "יום חמישי, כ״ג אדר" (weekday, day in gematriya, month).
 */
export function formatHebrewDateShort(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
  const greg = new Date(y, m - 1, day);
  const weekday = WEEKDAY_NAMES[greg.getDay()];
  const hd = new HDate(greg);
  const hebrewDay = gematriya(hd.getDay());
  const monthName = HEBREW_MONTH_NAMES[hd.getMonth()] ?? "";
  return `${weekday}, ${hebrewDay} ${monthName}`;
}
