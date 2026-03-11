"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRentalDraft } from "../RentalContext";
import { AppHeader } from "../../components/AppHeader";
import { HebrewCalendar } from "../../components/HebrewCalendar";
import { formatHebrewDateShort } from "../../../lib/formatDate";

export default function DatesPage() {
  const router = useRouter();
  const { draft, updateDates } = useRentalDraft();
  const { pickupDate, returnDate } = draft.dates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !returnDate) return;
    if (pickupDate > returnDate) return;
    router.push("/rental/items");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="app-page text-foreground">
      <AppHeader backHref="/rental/deposit" backLabel="לפיקדון ותרומה" rightSlot="שלב 3 מתוך 5" />

      <main className="mx-auto flex max-w-5xl flex-col items-stretch px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
          <h1 className="text-2xl font-bold text-brand text-center">
            תאריכי לקיחה והחזרה
          </h1>
          <p className="mt-2 text-center text-sm text-brand-dark">
            בחרו תאריך לקיחת ציוד ותאריך החזרה – שניהם חובה
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-0 min-w-0">
              {/* תאריך לקיחה – עמודה ימין (RTL) */}
              <div className="flex flex-col min-w-0 border-l-2 border-zinc-300 pl-4 sm:pl-6">
                <label
                  htmlFor="pickupDate"
                  className="block text-xl font-bold text-right text-brand"
                >
                  תאריך לקיחה *
                </label>
                <input
                  id="pickupDate"
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => updateDates({ pickupDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {pickupDate && (
                  <p className="mt-1 text-xs text-zinc-600 text-right">
                    תאריך עברי: {formatHebrewDateShort(pickupDate)}
                  </p>
                )}
                <div className="mt-4 min-w-0">
                  <HebrewCalendar
                    label="לוח שנה עברי – תאריך לקיחה"
                    value={pickupDate}
                    onChange={(iso) => updateDates({ pickupDate: iso })}
                    min={today}
                  />
                </div>
              </div>

              {/* תאריך החזרה – עמודה שמאל (RTL) */}
              <div className="flex flex-col min-w-0 pr-4 sm:pr-6">
                <label
                  htmlFor="returnDate"
                  className="block text-xl font-bold text-right text-brand"
                >
                  תאריך החזרה *
                </label>
                <input
                  id="returnDate"
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => updateDates({ returnDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {returnDate && (
                  <p className="mt-1 text-xs text-zinc-600 text-right">
                    תאריך עברי: {formatHebrewDateShort(returnDate)}
                  </p>
                )}
                <div className="mt-4 min-w-0">
                  <HebrewCalendar
                    label="לוח שנה עברי – תאריך החזרה"
                    value={returnDate}
                    onChange={(iso) => updateDates({ returnDate: iso })}
                    min={pickupDate || today}
                  />
                </div>
              </div>
            </div>

            {pickupDate && returnDate && pickupDate > returnDate && (
              <p className="text-sm text-red-600 text-right">
                תאריך החזרה חייב להיות אחרי תאריך הלקיחה.
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Link
                href="/rental/deposit"
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50"
              >
                חזרה לפיקדון
              </Link>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark disabled:opacity-60"
                disabled={
                  !pickupDate ||
                  !returnDate ||
                  (pickupDate && returnDate && pickupDate > returnDate)
                }
              >
                המשך לבחירת ציוד
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
