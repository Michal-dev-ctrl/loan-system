"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "../../components/AppHeader";
import { catalog } from "../../rental/items/catalog";
import { formatDisplayDate, formatHebrewDateShort } from "../../../lib/formatDate";

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

type CatalogEntry = {
  id: string;
  name: string;
  kind: "rental" | "purchase";
  damagePrice: number;
};

const STORAGE_KEY = "event_rentals";

// רשימת פריטים להשכרה – חייבת להתאים ל-id-ים מעמוד בחירת הציוד
const DAMAGE_CATALOG: CatalogEntry[] = [
  { id: "basic-table", name: "מצנח", kind: "rental", damagePrice: 1000 },
  { id: "basic-tablecloth-1", name: "סלסלאות שושבניות", kind: "rental", damagePrice: 40 },
  { id: "basic-tablecloth-2", name: "סלסלאות רגיל", kind: "rental", damagePrice: 80 },
  { id: "basic-arch-flowers", name: "קשתות פרחים", kind: "rental", damagePrice: 70 },
  { id: "basic-arch-tol", name: "קשתות בד", kind: "rental", damagePrice: 40 },
  { id: "basic-arch-orchid", name: "קשתות סחלב", kind: "rental", damagePrice: 100 },
  { id: "happy-instruments-1", name: "דרבוקות", kind: "rental", damagePrice: 70 },
  { id: "happy-instruments-2", name: "גיטרה", kind: "rental", damagePrice: 50 },
  { id: "happy-instruments-3", name: "תוף מרים", kind: "rental", damagePrice: 20 },
  { id: "happy-instruments-4", name: "קשקשנים", kind: "rental", damagePrice: 7 },
  { id: "happy-shirts", name: "חולצות מזל טוב", kind: "rental", damagePrice: 100 },
  { id: "happy-hats-1", name: "כובעים גדולים", kind: "rental", damagePrice: 25 },
  { id: "happy-hats-2", name: "כובעים קטנים", kind: "rental", damagePrice: 4 },
  { id: "happy-hearts-1", name: "לבבות גדולים", kind: "rental", damagePrice: 20 },
  { id: "happy-hearts-2", name: "לבבות קטנים", kind: "rental", damagePrice: 15 },
  { id: "happy-balloon-stick", name: "מקל בלונים", kind: "rental", damagePrice: 12 },
  { id: "happy-fans-1", name: "מניפות גדולות", kind: "rental", damagePrice: 20 },
  { id: "happy-fans-2", name: "מניפות קטנות", kind: "rental", damagePrice: 10 },
  { id: "happy-fans-3", name: "מניפות פרווה", kind: "rental", damagePrice: 15 },
  { id: "happy-umbrella", name: "מטריה", kind: "rental", damagePrice: 40 },
  { id: "happy-sticks-threads-1", name: "מקלות צבעי אש", kind: "rental", damagePrice: 17 },
  { id: "happy-sticks-threads-2", name: "סרט לב אדום", kind: "rental", damagePrice: 10 },
  { id: "happy-sticks-threads-3", name: "סרט לב ורוד", kind: "rental", damagePrice: 10 },
  { id: "happy-sticks-threads-4", name: "מקלות צבעים סגול לבן", kind: "rental", damagePrice: 7 },
  { id: "happy-moeddot", name: "מועדדות", kind: "rental", damagePrice: 5 },
  { id: "happy-flower-circles", name: "עיגולי פרחים", kind: "rental", damagePrice: 35 },
  { id: "happy-flower-chains-1", name: "שרשראות פרחים – פשוט", kind: "rental", damagePrice: 4 },
  { id: "happy-flower-chains-2", name: "שרשראות פרחים – יקר", kind: "rental", damagePrice: 15 },
  { id: "happy-hoop-threads", name: "חישוק צבעוני עם חוטים", kind: "rental", damagePrice: 10 },
  { id: "extra-chuppah-kit", name: "מזוודת חופה", kind: "rental", damagePrice: 60 },
];

// פריטים פנימיים מתוך מזוודת חופה – לנזקים / חוסרים (פריט אחד מכל סוג)
const CHUPPAH_INNER_ITEMS: { id: string; name: string; price: number }[] = [
  { id: "chuppah-tefila-kala", name: "תפילת כלה", price: 50 },
  { id: "chuppah-tefila-em-hatan", name: "תפילת אם החתן", price: 15 },
  { id: "chuppah-tefila-em-kala", name: "תפילת אם הכלה", price: 15 },
  { id: "chuppah-ashiiyot", name: "עשישיות", price: 50 },
  { id: "chuppah-lighter", name: "מצית", price: 10 },
  { id: "chuppah-goblet", name: "גביע", price: 10 },
  { id: "chuppah-seven-berachot", name: "שבע ברכות חופה", price: 50 },
  { id: "chuppah-first-aid", name: "ערכת עזרה ראשונה", price: 20 },
  { id: "chuppah-stationery", name: "ערכת מכשירי כתיבה", price: 20 },
  { id: "chuppah-sewing", name: "ערכת תפירה", price: 15 },
];

function loadRentals(): SavedRental[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedRental[];
  } catch {
    return [];
  }
}

export default function ReturnPage() {
  const router = useRouter();
  const params = useParams();
  const rentalId = params?.id ? decodeURIComponent(String(params.id)) : "";
  const [rental, setRental] = useState<SavedRental | null>(null);
  const [saving, setSaving] = useState(false);
  const [returnedQuantities, setReturnedQuantities] = useState<Record<string, number>>({});
  const [damageTotal, setDamageTotal] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [chuppahReturned, setChuppahReturned] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const rentals = loadRentals();
    const normalizedId = rentalId.trim();
    let found =
      rentals.find((r) => String(r.id).trim() === normalizedId) || null;

    // ניסיון התאמה נוסף לפי מספר (למקרה של שונות בין טיפוס מספר/מחרוזת או נתונים ישנים)
    if (!found) {
      const numericId = parseInt(normalizedId, 10);
      if (!Number.isNaN(numericId)) {
        found =
          rentals.find(
            (r) =>
              !Number.isNaN(parseInt(String(r.id), 10)) &&
              parseInt(String(r.id), 10) === numericId,
          ) ||
          rentals[numericId - 1] ||
          null;
      }
    }

    // אם עדיין לא נמצא – נ fallback להזמנה האחרונה ברשימה, כדי שהעמוד תמיד יציג משהו
    if (!found && rentals.length > 0) {
      found = rentals[rentals.length - 1];
    }

    setRental(found);
  }, [rentalId]);

  const orderedItems = useMemo(() => {
    if (!rental) return [];
    return catalog.filter((item) => (rental.items[item.id] || 0) > 0);
  }, [rental]);

  const itemsForReturn = useMemo(() => {
    if (!rental) return [];
    return DAMAGE_CATALOG.filter(
      (entry) => (rental.items[entry.id] || 0) > 0 && entry.kind === "rental",
    ).map((entry) => ({
      ...entry,
      quantity: rental.items[entry.id] || 0,
    }));
  }, [rental]);

  // אתחול כמויות מוחזרות – ברירת מחדל: הכול הוחזר
  useEffect(() => {
    if (!rental) return;
    const initial: Record<string, number> = {};
    itemsForReturn.forEach((item) => {
      initial[item.id] = item.quantity;
    });
    setReturnedQuantities(initial);
  }, [rental, itemsForReturn]);

  const allStatusesFilled = itemsForReturn.length > 0;

  const setReturnedQuantity = (itemId: string, value: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, value));
    setReturnedQuantities((prev) => ({
      ...prev,
      [itemId]: clamped,
    }));
  };

  // אתחול ברירת מחדל: כל פריט במזוודה נחשב שהוחזר, אלא אם סימנו אחרת
  useEffect(() => {
    if (!rental || !rental.items["extra-chuppah-kit"] || rental.items["extra-chuppah-kit"] <= 0) {
      return;
    }
    setChuppahReturned((prev) => {
      const next = { ...prev };
      CHUPPAH_INNER_ITEMS.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = true;
        }
      });
      return next;
    });
  }, [rental]);

  useEffect(() => {
    const rentalDamage = itemsForReturn.reduce((sum, item) => {
      const ordered = item.quantity;
      const returned = Math.min(
        ordered,
        returnedQuantities[item.id] ?? ordered,
      );
      const missing = Math.max(0, ordered - returned);
      // אובדן מזוודת חופה שלמה – חיוב 300 ₪ לכל מזוודה
      if (item.id === "extra-chuppah-kit" && missing === ordered && missing > 0) {
        return sum + missing * 300;
      }
      return sum + missing * item.damagePrice;
    }, 0);
    const innerDamage = CHUPPAH_INNER_ITEMS.reduce((sum, item) => {
      const isReturned = chuppahReturned[item.id] ?? true;
      const missing = isReturned ? 0 : 1;
      return sum + missing * item.price;
    }, 0);
    setDamageTotal(rentalDamage + innerDamage);
  }, [itemsForReturn, returnedQuantities, chuppahReturned]);

  const damageBreakdown = useMemo(() => {
    const mainItems = itemsForReturn
      .map((item) => {
        const ordered = item.quantity;
        const returned = Math.min(
          ordered,
          returnedQuantities[item.id] ?? ordered,
        );
        const missing = Math.max(0, ordered - returned);
        let unitPrice = item.damagePrice;
        let lineName = item.name;

        // אובדן מזוודת חופה שלמה – חיוב 300 ₪ לכל מזוודה
        if (item.id === "extra-chuppah-kit" && missing === ordered && missing > 0) {
          unitPrice = 300;
          lineName = `${item.name} (אובדן מזוודה)`;
        }

        const lineTotal = missing * unitPrice;
        return {
          id: item.id,
          name: lineName,
          missing,
          price: unitPrice,
          lineTotal,
        };
      })
      .filter((line) => line.missing > 0 && line.lineTotal > 0);

    const chuppahInner = CHUPPAH_INNER_ITEMS.map((item) => {
      const isReturned = chuppahReturned[item.id] ?? true;
      const missing = isReturned ? 0 : 1;
      const lineTotal = missing * item.price;
      return {
        id: `inner-${item.id}`,
        name: `${item.name} (מתוך מזוודה)`,
        missing,
        price: item.price,
        lineTotal,
      };
    }).filter((line) => line.missing > 0 && line.lineTotal > 0);

    return [...mainItems, ...chuppahInner];
  }, [itemsForReturn, returnedQuantities, chuppahReturned]);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rental || !allStatusesFilled || saving) return;
    setSaving(true);
    setCompleted(true);

    // סימון ההחזרה כהושלמה – שומרים לפי ההזמנה המוצגת (rental.id) כדי שלא יהיה אי-התאמה
    const idToMark = String(rental.id).trim();
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const rentals: SavedRental[] = raw ? JSON.parse(raw) : [];
      const updated = rentals.map((r) => {
        const rid = String(r.id).trim();
        const numR = parseInt(rid, 10);
        const numM = parseInt(idToMark, 10);
        const match = rid === idToMark || (!Number.isNaN(numR) && !Number.isNaN(numM) && numR === numM);
        return match ? { ...r, returnCompleted: true } : r;
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    // מעבר רק אחרי שהשמירה הושלמה + זמן לדפדפן לכתוב
    setTimeout(() => router.push("/search"), 350);
  };

  if (!rental) {
    return (
      <div className="app-page text-foreground">
        <AppHeader backHref="/search" backLabel="לחיפוש" />
        <main className="mx-auto max-w-xl px-4 py-10 text-right">
          <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
            <h1 className="text-2xl font-bold text-brand">החזרה לא נמצאה</h1>
            <p className="mt-2 text-sm text-zinc-600">
              לא נמצאה השכרה עם מספר הזמנה הזה. חזרו לעמוד החיפוש
              ונסו שוב.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const depositPaid = rental.deposit.depositAmount || rental.totals.depositAmount || 0;

  return (
    <div className="app-page text-foreground">
      <AppHeader backHref="/search" backLabel="לחיפוש" />

      <main className="mx-auto flex max-w-4xl flex-col items-stretch px-4 py-8">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)] print-receipt">
          <div className="flex justify-center mb-4 print:mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="גמ״ח אור לכלה שמחת יום טוב"
              className="h-20 w-auto object-contain print:h-14 print:max-w-[200px]"
            />
          </div>
          <h1 className="text-2xl font-bold text-brand-green text-center">
            גמ"ח אור לכלה שמחת ״יום טוב״
          </h1>
          <p className="mt-1 text-lg font-semibold text-zinc-700 text-center">
            החזרת ציוד וחיוב נזקים
          </p>
          <p className="mt-2 text-center text-sm text-brand-dark" />

          <section className="mt-6 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm text-right">
            <h2 className="mb-2 text-base font-semibold text-brand">
              פרטי לקוח והשכרה
            </h2>
          <div className="grid gap-1 text-xs">
            <div>
              <span className="font-medium">שם: </span>
              {rental.personal.firstName} {rental.personal.lastName}
            </div>
            <div>
              <span className="font-medium">טלפון 1: </span>
              {rental.personal.phone1}
            </div>
            <div>
              <span className="font-medium">טלפון 2: </span>
              {rental.personal.phone2}
            </div>
            <div>
              <span className="font-medium">מס&apos; הזמנה: </span>
              {rental.id}
            </div>
            <div>
              <span className="font-medium">תאריכים: </span>
              {formatDisplayDate(rental.dates.pickupDate)}
              {rental.dates.pickupDate && (
                <span className="text-zinc-500"> {formatHebrewDateShort(rental.dates.pickupDate)}</span>
              )}
              {" – "}
              {formatDisplayDate(rental.dates.returnDate)}
              {rental.dates.returnDate && (
                <span className="text-zinc-500"> {formatHebrewDateShort(rental.dates.returnDate)}</span>
              )}
            </div>
            <div>
              <span className="font-medium">פיקדון: </span>
              {rental.deposit.option === "cash"
                ? `${rental.deposit.depositAmount} ₪ (מזומן)`
                : "צ'ק פיקדון"}
              , <span className="font-medium">תרומה: </span>
              {rental.deposit.donationAmount} ₪
            </div>
          </div>
        </section>

        {orderedItems.length > 0 && (
          <section className="mt-4 rounded-xl border border-brand-soft/60 bg-white p-4 text-xs text-right">
            <h2 className="mb-2 text-sm font-semibold text-brand">
              פרטי ההזמנה – ציוד שנלקח
            </h2>
            <table className="mt-1 w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-1 font-medium">פריט</th>
                  <th className="py-1 font-medium">כמות</th>
                  <th className="py-1 font-medium">סוג</th>
                </tr>
              </thead>
              <tbody>
                {orderedItems.map((item) => {
                  const qty = rental.items[item.id] || 0;
                  const isPurchase = item.category === "purchase";
                  return (
                    <tr key={item.id} className="border-b border-zinc-50">
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 font-semibold">{qty}</td>
                      <td className="py-1">
                        {isPurchase ? "רכישה" : "השכרה"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        <form
          onSubmit={handleComplete}
          className="mt-4 space-y-4 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm text-right"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-800">
              בדיקת תקינות ציוד (חובה לכל פריט)
            </h2>
            {itemsForReturn.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">
                לא נמצאו פריטים להשכרה בהזמנה זו (ייתכן שהיו רק מוצרי רכישה).
              </p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs">
                {itemsForReturn.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        חיוב לנזק/חוסר:{" "}
                        {item.damagePrice.toLocaleString("he-IL")} ₪ ליחידה
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-zinc-600">
                          כמה הוחזר תקין:
                        </span>
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 bg-white text-[11px]"
                          onClick={() =>
                            setReturnedQuantity(
                              item.id,
                              (returnedQuantities[item.id] ?? item.quantity) - 1,
                              item.quantity,
                            )
                          }
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={returnedQuantities[item.id] ?? item.quantity}
                          onChange={(e) =>
                            setReturnedQuantity(
                              item.id,
                              Number.isNaN(parseInt(e.target.value, 10))
                                ? 0
                                : parseInt(e.target.value, 10),
                              item.quantity,
                            )
                          }
                          className="h-7 w-12 rounded-md border border-zinc-300 bg-white text-center text-[11px] font-semibold"
                        />
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 bg-white text-[11px]"
                          onClick={() =>
                            setReturnedQuantity(
                              item.id,
                              (returnedQuantities[item.id] ?? item.quantity) + 1,
                              item.quantity,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        הוחזרו{" "}
                        <span className="font-semibold">
                          {returnedQuantities[item.id] ?? item.quantity}
                        </span>{" "}
                        מתוך {item.quantity} • חסרים לתשלום:{" "}
                        <span className="font-semibold">
                          {Math.max(
                            0,
                            item.quantity -
                              (returnedQuantities[item.id] ?? item.quantity),
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {rental.items["extra-chuppah-kit"] && rental.items["extra-chuppah-kit"] > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
              <h3 className="text-sm font-semibold text-amber-800">
                פריטים מתוך מזוודת חופה (אובדן / חוסר)
              </h3>
              <p className="mt-1 text-[11px] text-amber-800">
                סמני וי ליד כל פריט שהוחזר תקין. פריט שלא מסומן – יחויב לפי המחיר שלו.
              </p>
              <ul className="mt-2 space-y-1 text-[11px]">
                {CHUPPAH_INNER_ITEMS.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 border-b border-amber-100 pb-1 last:border-b-0"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={chuppahReturned[item.id] ?? true}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setChuppahReturned((prev) => ({
                            ...prev,
                            [item.id]: checked,
                          }));
                        }}
                        className="h-3 w-3 rounded border-amber-400 text-amber-600"
                      />
                      <span>{item.name}</span>
                    </label>
                    <span className="text-[11px] text-amber-800">
                      {item.price.toLocaleString("he-IL")} ₪ אם לא חזר
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-dashed border-zinc-200 pt-3 text-xs">
            <div>
              <span className="font-medium">סה&quot;כ נזקים / חוסרים: </span>
              {damageTotal.toLocaleString("he-IL")} ₪
            </div>
            {damageBreakdown.length > 0 && (
              <ul className="mt-1 space-y-1 text-[11px] text-zinc-600">
                {damageBreakdown.map((line) => (
                  <li key={line.id}>
                    {line.name}: <span className="font-medium">
                      {line.lineTotal.toLocaleString("he-IL")} ₪
                    </span>{" "}
                    = {line.missing} × {line.price.toLocaleString("he-IL")}
                  </li>
                ))}
              </ul>
            )}
            <div>
              <span className="font-medium">פיקדון שהופקד: </span>
              {depositPaid.toLocaleString("he-IL")} ₪
            </div>
            <div className="mt-1 font-semibold text-brand-dark">
              {damageTotal <= depositPaid ? (
                <>
                  להחזיר ללקוח:{" "}
                  {(depositPaid - damageTotal).toLocaleString("he-IL")} ₪
                </>
              ) : (
                <>
                  הלקוח צריך לשלם בנוסף:{" "}
                  {(damageTotal - depositPaid).toLocaleString("he-IL")} ₪
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={itemsForReturn.length === 0 || saving}
              className="flex-1 rounded-xl bg-brand py-2.5 text-center text-xs font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "שומר… מעביר להחזרות" : "סיום ושמירת החזרה"}
            </button>
            <button
              type="button"
              disabled={itemsForReturn.length === 0}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              הדפסת קבלה מעודכנת
            </button>
          </div>

          {completed && (
            <p className="text-xs font-medium text-brand-dark">
              ההחזרה עודכנה (במצב הדגמה – המידע נשמר בדפדפן בלבד).
            </p>
          )}
        </form>
        </div>
      </main>
    </div>
  );
}

