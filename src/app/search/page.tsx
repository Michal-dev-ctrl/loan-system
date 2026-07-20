"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { formatDisplayDate, formatHebrewDateShort } from "../../lib/formatDate";
import {
  clearLocalRentals,
  deleteRentalApi,
  fetchRentals,
  LOCAL_STORAGE_KEY,
  migrateLocalRentals,
  readLocalRentals,
} from "../../lib/rentals/client";
import type { SavedRental } from "../../lib/rentals/types";

export default function SearchPage() {
  const pathname = usePathname();
  const [searchText, setSearchText] = useState("");
  const [allRentals, setAllRentals] = useState<SavedRental[]>([]);
  const [results, setResults] = useState<SavedRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPending, setLocalPending] = useState<SavedRental[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [needsBlobSetup, setNeedsBlobSetup] = useState(false);

  const applyFilter = useCallback((rentals: SavedRental[], termRaw: string) => {
    const term = termRaw.trim().toLowerCase();
    if (!term) return rentals;
    return rentals.filter((rental) => {
      const fullName =
        `${rental.personal.firstName} ${rental.personal.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        rental.personal.phone1.toLowerCase().includes(term) ||
        rental.personal.phone2.toLowerCase().includes(term) ||
        String(rental.id).toLowerCase().includes(term)
      );
    });
  }, []);

  const loadFromServer = useCallback(async (term = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRentals();
      setAllRentals(data.rentals);
      setResults(applyFilter(data.rentals, term));
      setNeedsBlobSetup(Boolean(data.store?.needsBlobSetup));
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הזמנות");
      setAllRentals([]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [applyFilter]);

  useEffect(() => {
    if (pathname === "/search") {
      void loadFromServer(searchText);
      setLocalPending(readLocalRentals());
    }
    // נטען מחדש רק בכניסה לעמוד, לא בכל הקלדה בחיפוש
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loadFromServer]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setResults(applyFilter(allRentals, value));
  };

  const handleDelete = async (rental: SavedRental) => {
    const fullName =
      `${rental.personal.firstName} ${rental.personal.lastName}`.trim();
    if (
      !confirm(
        `למחוק את ההזמנה של ${fullName} (מס׳ ${rental.id})? לא ניתן לשחזר.`,
      )
    ) {
      return;
    }
    try {
      await deleteRentalApi(rental.id);
      const next = allRentals.filter(
        (r) => String(r.id).trim() !== String(rental.id).trim(),
      );
      setAllRentals(next);
      setResults(applyFilter(next, searchText));
    } catch (err) {
      alert(err instanceof Error ? err.message : "מחיקה נכשלה");
    }
  };

  const handleMigrateLocal = async () => {
    if (localPending.length === 0) return;
    setMigrating(true);
    try {
      const result = await migrateLocalRentals(localPending);
      clearLocalRentals();
      setLocalPending([]);
      await loadFromServer(searchText);
      alert(
        `הועברו ${result.imported} הזמנות לשרת` +
          (result.skipped ? ` (דולגו ${result.skipped} שכבר קיימות)` : ""),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "העברה נכשלה");
    } finally {
      setMigrating(false);
    }
  };

  const dismissLocal = () => {
    if (
      confirm(
        "להסתיר את ההתראה? הנתונים הישנים יישארו בדפדפן עד שתעבירי אותם או תמחקי את נתוני האתר.",
      )
    ) {
      setLocalPending([]);
    }
  };

  return (
    <div className="app-page text-foreground">
      <AppHeader />

      <main className="mx-auto flex max-w-3xl flex-col items-stretch px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
          <h1 className="text-2xl font-bold text-brand text-center">
            חיפוש והשבת ציוד
          </h1>
          <p className="mt-2 text-center text-sm text-brand-dark">
            חיפוש לפי שם, טלפון או מספר הזמנה · הנתונים נשמרים בשרת לכל המחשבים
          </p>

          {needsBlobSetup && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-right text-sm text-amber-950">
              <p className="font-semibold">לחיבור מלא בין מחשבים בענן</p>
              <p className="mt-1 text-xs leading-relaxed">
                כרגע השמירה עובדת במחשב הזה. כדי שכל המחשבים יראו את אותן הזמנות
                ב־Vercel: Storage → Create → Blob Store → Connect לפרויקט{" "}
                <span className="font-semibold">loan-system-gmach-or</span> → ואז
                Redeploy.
              </p>
            </div>
          )}

          {localPending.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-right text-sm text-amber-900">
              <p className="font-semibold">
                נמצאו {localPending.length} הזמנות ישנות במחשב הזה בלבד
              </p>
              <p className="mt-1 text-xs">
                בעבר ההזמנות נשמרו רק בדפדפן. אפשר להעביר אותן עכשיו לשרת כדי
                שיופיעו גם במחשבים אחרים.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleMigrateLocal}
                  disabled={migrating}
                  className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
                >
                  {migrating ? "מעביר…" : "העברה לשרת"}
                </button>
                <button
                  type="button"
                  onClick={dismissLocal}
                  className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
                >
                  אחר כך
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("למחוק את הנתונים הישנים מהדפדפן בלבד?")) {
                      clearLocalRentals();
                      setLocalPending([]);
                    }
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  מחיקה מהדפדפן
                </button>
              </div>
              <p className="mt-2 text-[11px] text-amber-800/80">
                מפתח ישן בדפדפן: {LOCAL_STORAGE_KEY}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="searchText"
                className="block text-sm font-medium text-right text-zinc-700"
              >
                חיפוש
              </label>
              <input
                id="searchText"
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="הקלד שם, טלפון או מספר הזמנה..."
              />
            </div>

            <div className="rounded-xl border border-brand-soft/60 bg-brand-soft/20 px-4 py-4 text-sm text-right">
              {loading ? (
                <p className="text-zinc-500">טוען הזמנות מהשרת…</p>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadFromServer(searchText)}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium border border-zinc-200"
                  >
                    נסי שוב
                  </button>
                </div>
              ) : results.length === 0 ? (
                <p className="text-zinc-500">
                  אין עדיין הזמנות שמורות, או שלא נמצאו תוצאות תואמות.
                </p>
              ) : (
                <ul className="space-y-3">
                  {results.map((rental) => {
                    const fullName =
                      `${rental.personal.firstName} ${rental.personal.lastName}`.trim();
                    const isCompleted = rental.returnCompleted === true;
                    return (
                      <li
                        key={rental.id}
                        className={`rounded-xl p-3 shadow-sm border ${
                          isCompleted
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-brand-soft/80 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-zinc-800">
                                {fullName}
                              </div>
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  <span className="text-xs" aria-hidden>
                                    ✓
                                  </span>
                                  הוחזר
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-600">
                              טלפון: {rental.personal.phone1}
                            </div>
                            <div className="text-xs text-zinc-600">
                              מספר הזמנה: {rental.id}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
                            <div className="text-zinc-600">
                              לקיחה: {formatDisplayDate(rental.dates.pickupDate)}
                              {rental.dates.pickupDate && (
                                <span className="text-zinc-500">
                                  {" "}
                                  {formatHebrewDateShort(
                                    rental.dates.pickupDate,
                                  )}
                                </span>
                              )}
                              {" | "}
                              החזרה:{" "}
                              {formatDisplayDate(rental.dates.returnDate)}
                              {rental.dates.returnDate && (
                                <span className="text-zinc-500">
                                  {" "}
                                  {formatHebrewDateShort(
                                    rental.dates.returnDate,
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/return/${encodeURIComponent(rental.id)}`}
                                className="mt-1 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(200,90,108,0.3)] hover:bg-brand-dark"
                              >
                                פתיחת החזרה ובדיקת ציוד
                              </Link>
                              <button
                                type="button"
                                onClick={() => void handleDelete(rental)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                                title="מחיקת ההזמנה"
                                aria-label="מחיקת ההזמנה"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
