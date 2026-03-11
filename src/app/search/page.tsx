"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AppHeader } from "../components/AppHeader";
import { formatDisplayDate, formatHebrewDateShort } from "../../lib/formatDate";

const STORAGE_KEY = "event_rentals";

type SavedRental = {
  id: string;
  createdAt: string;
  personal: {
    firstName: string;
    lastName: string;
    phone1: string;
    phone2: string;
  };
  deposit: {
    option: "cheque" | "cash" | null;
    chequeName: string;
    chequeNumber: string;
    depositAmount: number;
    donationAmount: number;
  };
  dates: {
    pickupDate: string;
    returnDate: string;
  };
  items: Record<string, number>;
  totals: {
    donation: number;
    depositAmount: number;
    purchaseTotal: number;
    totalToPayNow: number;
  };
  // מצב החזרה – אופציונלי, נשמר בדפדפן
  returnCompleted?: boolean;
};

function loadRentals(): SavedRental[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedRental[];
    // ממיינים כך שההזמנות החדשות ביותר יופיעו ראשונות
    return [...parsed].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      if (!Number.isNaN(da) && !Number.isNaN(db)) {
        return db - da;
      }
      // גיבוי לפי מספר מזהה
      return Number(b.id) - Number(a.id);
    });
  } catch {
    return [];
  }
}

export default function SearchPage() {
  const pathname = usePathname();
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SavedRental[]>([]);

  // טעינה מחדש localStorage בכל כניסה לעמוד החיפוש (כולל אחרי סיום החזרה)
  useEffect(() => {
    if (pathname === "/search") {
      setResults(loadRentals());
    }
  }, [pathname]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    const rentals = loadRentals();
    const term = value.trim().toLowerCase();
    if (!term) {
      setResults(rentals);
      return;
    }
    const filtered = rentals.filter((rental) => {
      const fullName = `${rental.personal.firstName} ${rental.personal.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        rental.personal.phone1.toLowerCase().includes(term) ||
        rental.personal.phone2.toLowerCase().includes(term) ||
        String(rental.id).toLowerCase().includes(term)
      );
    });
    setResults(filtered);
  };

  const handleDelete = (rental: SavedRental) => {
    const fullName = `${rental.personal.firstName} ${rental.personal.lastName}`.trim();
    if (!confirm(`למחוק את ההזמנה של ${fullName} (מס׳ ${rental.id})? לא ניתן לשחזר.`)) return;
    if (typeof window === "undefined") return;
    const rentals = loadRentals().filter((r) => String(r.id).trim() !== String(rental.id).trim());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rentals));
    setResults(loadRentals());
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
            חיפוש לפי שם, טלפון או מספר הזמנה
          </p>

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
            {results.length === 0 ? (
              <p className="text-zinc-500">
                אין עדיין הזמנות שמורות, או שלא נמצאו תוצאות תואמות.
              </p>
            ) : (
              <ul className="space-y-3">
                {results.map((rental) => {
                  const fullName = `${rental.personal.firstName} ${rental.personal.lastName}`.trim();
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
                            <div className="font-semibold text-zinc-800">{fullName}</div>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                <span className="text-xs" aria-hidden>✓</span>
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
                              <span className="text-zinc-500"> {formatHebrewDateShort(rental.dates.pickupDate)}</span>
                            )}
                            {" | "}
                            החזרה: {formatDisplayDate(rental.dates.returnDate)}
                            {rental.dates.returnDate && (
                              <span className="text-zinc-500"> {formatHebrewDateShort(rental.dates.returnDate)}</span>
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
                              onClick={() => handleDelete(rental)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                              title="מחיקת ההזמנה"
                              aria-label="מחיקת ההזמנה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

