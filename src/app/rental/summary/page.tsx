"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRentalDraft } from "../RentalContext";
import { catalog } from "../items/catalog";
import { AppHeader } from "../../components/AppHeader";
import { formatDisplayDate, formatHebrewDateShort } from "../../../lib/formatDate";

type SavedRental = {
  id: string;
  createdAt: string;
  personal: typeof draftSample.personal;
  deposit: typeof draftSample.deposit;
  dates: typeof draftSample.dates;
  items: typeof draftSample.items;
  totals: {
    donation: number;
    depositAmount: number;
    purchaseTotal: number;
    rentalTotal: number;
    totalToPayNow: number;
    
  };
};

const draftSample = {
  personal: {
    firstName: "",
    lastName: "",
    phone1: "",
    phone2: "",
  },
  deposit: {
    option: null as "cheque" | "cash" | null,
    chequeName: "",
    chequeNumber: "",
    depositAmount: 0,
    donationAmount: 0,
  },
  dates: {
    pickupDate: "",
    returnDate: "",
  },
  items: {} as Record<string, number>,
};

const STORAGE_KEY = "event_rentals";

const EMAIL_DOMAINS = [
  "gmail.com",
  "walla.co.il",
  "yahoo.com",
  "012.net.il",
  "bezeqint.net",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

const PHONE_PREFIXES = ["050", "051", "052", "053", "054", "055", "056", "058", "059"];

export default function SummaryPage() {
  const router = useRouter();
  const { draft, resetDraft } = useRentalDraft();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [contactSendType, setContactSendType] = useState<"email" | "phone">("email");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);
  const [phonePrefix, setPhonePrefix] = useState(PHONE_PREFIXES[0]);
  const [phoneRest, setPhoneRest] = useState("");

  const donation = draft.deposit.donationAmount;
  const depositAmount = draft.deposit.depositAmount;
  const purchaseTotal = useMemo(
    () =>
      catalog
        .filter((i) => i.category === "purchase")
        .reduce((sum, item) => {
          const qty = draft.items[item.id] || 0;
          return sum + qty * item.price;
        }, 0),
    [draft.items]
  );

  const { rentalTotal, effectiveRentalTotal, chuppahCoveredByDonation } = useMemo(() => {
    const paidRentalItems = catalog.filter(
      (i) => i.category !== "purchase" && i.price > 0,
    );

    const baseRental = paidRentalItems.reduce((sum, item) => {
      const qty = draft.items[item.id] || 0;
      return sum + qty * item.price;
    }, 0);

    const chuppahItem = catalog.find((i) => i.id === "extra-chuppah-kit");
    const chuppahPrice = chuppahItem?.price ?? 0;
    const chuppahQty = draft.items["extra-chuppah-kit"] || 0;
    const chuppahTotal = chuppahQty * chuppahPrice;

    // האם קיימים פריטי השכרה נוספים בתשלום (לא קנייה) besides מזוודת חופה
    const hasOtherPaidRentals = paidRentalItems.some((item) => {
      if (item.id === "extra-chuppah-kit") return false;
      const qty = draft.items[item.id] || 0;
      return qty > 0;
    });

    // הכלל: רק אם לוקחים *רק* מזוודת חופה (בלי שום אביזר נוסף) והתרומה מכסה – לא גובים 60 ש"ח נוספים
    const chuppahOnlyRental = chuppahTotal > 0 && !hasOtherPaidRentals;
    const coveredByDonation =
      chuppahOnlyRental && draft.deposit.donationAmount >= chuppahPrice;

    return {
      rentalTotal: baseRental,
      effectiveRentalTotal: coveredByDonation ? 0 : baseRental,
      chuppahCoveredByDonation: coveredByDonation,
    };
  }, [draft.items, draft.deposit.donationAmount]);

  const totalToPayNow =
    donation +
    purchaseTotal +
    effectiveRentalTotal +
    (draft.deposit.option === "cash" ? depositAmount : 0);

  const fullName = `${draft.personal.firstName} ${draft.personal.lastName}`.trim();

  useEffect(() => {
    if (!draft.personal.firstName || !draft.personal.lastName) {
      router.replace("/rental/personal-details");
    }
  }, [draft.personal.firstName, draft.personal.lastName, router]);

  const saveRental = (): SavedRental | null => {
    try {
      const existingRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      const existing: SavedRental[] = existingRaw ? JSON.parse(existingRaw) : [];

      const numericCount = existing.filter((rental) => {
        const num = parseInt(rental.id, 10);
        return !Number.isNaN(num) && num > 0;
      }).length;

      const nextNumber = numericCount + 1;
      const id = String(nextNumber);

      const rental: SavedRental = {
        id,
        createdAt: new Date().toISOString(),
        personal: draft.personal,
        deposit: draft.deposit,
        dates: draft.dates,
        items: draft.items,
        totals: {
          donation,
          depositAmount,
          purchaseTotal,
          rentalTotal,
          totalToPayNow,
        },
      };

      existing.push(rental);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }

      setSavedId(id);
      // לא מאפסים את הטופס – נשארים בעמוד עם כל הפרטים להדפסה/שליחה
      return rental;
    } catch {
      // ignore storage errors in demo
      return null;
    }
  };

  const handleSaveAndPrint = () => {
    saveRental();
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 200);
  };

  const buildReceiptText = (rental: SavedRental) => {
    const lines: string[] = [];
    lines.push('גמ"ח אור לכלה שמחת "יום טוב"');
    lines.push("סיכום הזמנה וקבלה");
    lines.push("");
    lines.push(`מספר הזמנה: ${rental.id}`);
    lines.push(`תאריך יצירה: ${formatDisplayDate(rental.createdAt)}`);
    lines.push("");
    lines.push("פרטי לקוח:");
    lines.push(`שם: ${rental.personal.firstName} ${rental.personal.lastName}`);
    lines.push(`טלפון 1: ${rental.personal.phone1}`);
    if (rental.personal.phone2) {
      lines.push(`טלפון 2: ${rental.personal.phone2}`);
    }
    lines.push("");
    lines.push("פיקדון ותרומה:");
    lines.push(
      `סוג פיקדון: ${
        rental.deposit.option === "cheque" ? "צ'ק פיקדון + תרומה" : "פיקדון מזומן + תרומה"
      }`
    );
    lines.push(`סכום פיקדון: ${rental.deposit.depositAmount} ₪`);
    lines.push(`תרומה: ${rental.deposit.donationAmount} ₪`);
    lines.push("");
    lines.push("תאריכים:");
    const pickupHeb = formatHebrewDateShort(rental.dates.pickupDate);
    const returnHeb = formatHebrewDateShort(rental.dates.returnDate);
    lines.push(`תאריך לקיחה: ${formatDisplayDate(rental.dates.pickupDate)}${pickupHeb ? ` ${pickupHeb}` : ""}`);
    lines.push(`תאריך החזרה: ${formatDisplayDate(rental.dates.returnDate)}${returnHeb ? ` ${returnHeb}` : ""}`);
    lines.push("");
    lines.push("סכומים:");
    lines.push(`תרומה: ${rental.totals.donation} ₪`);
    if (rental.deposit.option === "cash") {
      lines.push(`פיקדון מזומן: ${rental.totals.depositAmount} ₪`);
    }
    lines.push(`סכום רכישת מוצרים: ${rental.totals.purchaseTotal} ₪`);
    if (rental.totals.rentalTotal > 0) {
      lines.push(`השכרת ציוד: ${rental.totals.rentalTotal} ₪`);
    }
    lines.push(`סה"כ לתשלום עכשיו: ${rental.totals.totalToPayNow} ₪`);
    return lines.join("\n");
  };

  const handleSaveAndEmail = () => {
    const rental = saveRental();
    if (!rental) return;
    const text = buildReceiptText(rental);
    if (typeof window === "undefined") return;

    if (contactSendType === "phone") {
      const digits = phoneRest.replace(/\D/g, "");
      const fullPhone = phonePrefix + digits;
      if (fullPhone.length >= 10) {
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/972${fullPhone.slice(1)}?text=${encodedText}`, "_blank");
        return;
      }
      alert("נא להזין מספר טלפון מלא (7 ספרות אחרי הקידומת).");
      return;
    }

    if (contactSendType === "email") {
      const local = emailLocal.trim();
      if (!local) {
        alert("נא להזין את חלק כתובת המייל לפני ה־@ (שם המשתמש).");
        return;
      }
      const fullEmail = `${local}@${emailDomain}`;
      const subject = encodeURIComponent(
        `קבלה מגמ"ח אור לכלה שמחת "יום טוב" - ${rental.id}`
      );
      const maxBodyChars = 450;
      const shortText =
        text.length > maxBodyChars
          ? text.slice(0, maxBodyChars) + "\n\n(פרטים מלאים – בהדפסת הקבלה)"
          : text;
      const body = encodeURIComponent(shortText);
      const mailto = `mailto:${encodeURIComponent(fullEmail)}?subject=${subject}&body=${body}`;
      const a = document.createElement("a");
      a.href = mailto;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      try {
        navigator.clipboard.writeText(shortText);
      } catch {
        // ignore
      }
      setTimeout(() => {
        alert("הקבלה הועתקה ללוח. אם לא נפתח חלון מייל – פתחי Gmail/Outlook והדביקי (Ctrl+V) במייל חדש.");
      }, 600);
    }
  };

  const handleFinish = () => {
    const rental = saveRental();
    if (!rental) return;
    router.push("/rental/confirmation");
  };

  const rentalItemsForDisplay = catalog.filter(
    (item) => (draft.items[item.id] || 0) > 0
  );

  return (
    <div className="app-page text-foreground">
      <div className="print:hidden">
        <AppHeader backHref="/rental/items" backLabel="לבחירת ציוד" rightSlot="סיכום הזמנה" />
      </div>

      <main className="mx-auto flex max-w-3xl flex-col items-stretch px-4 py-8">
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
            סיכום הזמנה וקבלה
          </p>

          {savedId && (
            <p className="mt-4 text-center text-sm font-medium text-brand-dark">
              ההשכרה נשמרה בהצלחה. מספר הזמנה:{" "}
              <span className="font-semibold">{savedId}</span>
            </p>
          )}

          <section className="mt-6 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm">
            <h2 className="mb-2 text-base font-semibold text-brand text-right">
              פרטי לקוח
            </h2>
          <div className="grid gap-1 text-right">
            <div>
              <span className="font-medium">שם: </span>
              {fullName}
            </div>
            <div>
              <span className="font-medium">טלפון 1: </span>
              {draft.personal.phone1}
            </div>
            <div>
              <span className="font-medium">טלפון 2: </span>
              {draft.personal.phone2}
            </div>
            <div>
              <span className="font-medium">מס&apos; הזמנה: </span>
              {savedId ?? "יופיע לאחר שמירה"}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          <h2 className="mb-2 text-base font-semibold text-brand text-right">
            פיקדון ותרומה
          </h2>
          <div className="grid gap-1 text-right">
            <div>
              <span className="font-medium">סוג פיקדון: </span>
              {draft.deposit.option === "cheque"
                ? "צ'ק פיקדון + תרומה"
                : "פיקדון מזומן + תרומה"}
            </div>
            {draft.deposit.option === "cheque" && (
              <>
                {draft.deposit.chequeName && (
                  <div>
                    <span className="font-medium">ע&quot;ש הצ&apos;ק: </span>
                    {draft.deposit.chequeName}
                  </div>
                )}
              </>
            )}
            <div>
              <span className="font-medium">פיקדון: </span>
              {draft.deposit.option === "cash"
                ? `${depositAmount} ₪ (מזומן)`
                : "צ'ק פיקדון"}
            </div>
            <div>
              <span className="font-medium">תרומה: </span>
              {donation} ₪
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm">
          <h2 className="mb-2 text-base font-semibold text-brand text-right">
            תאריכים
          </h2>
          <div className="grid gap-1 text-right">
            <div>
              <span className="font-medium">תאריך לקיחה: </span>
              {formatDisplayDate(draft.dates.pickupDate)}
              {draft.dates.pickupDate && (
                <span className="text-zinc-500 text-xs mr-1"> {formatHebrewDateShort(draft.dates.pickupDate)}</span>
              )}
            </div>
            <div>
              <span className="font-medium">תאריך החזרה: </span>
              {formatDisplayDate(draft.dates.returnDate)}
              {draft.dates.returnDate && (
                <span className="text-zinc-500 text-xs mr-1"> {formatHebrewDateShort(draft.dates.returnDate)}</span>
              )}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm">
          <h2 className="mb-2 text-base font-semibold text-brand text-right">
            ציוד שהוזמן
          </h2>
          {rentalItemsForDisplay.length === 0 ? (
            <p className="text-zinc-500 text-right">
              לא נבחר ציוד. ניתן עדיין להשלים הזמנה רק עם פיקדון ותרומה.
            </p>
          ) : (
            <table className="mt-1 w-full text-right text-xs">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-1 font-medium">פריט</th>
                  <th className="py-1 font-medium">כמות</th>
                  <th className="py-1 font-medium">סוג</th>
                  <th className="py-1 font-medium">סכום לתשלום</th>
                </tr>
              </thead>
              <tbody>
                {rentalItemsForDisplay.map((item) => {
                  const qty = draft.items[item.id] || 0;
                  const isPurchase = item.category === "purchase";
                  const lineTotal = isPurchase ? qty * item.price : null;
                  return (
                    <tr key={item.id} className="border-b border-zinc-50">
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 font-semibold">{qty}</td>
                      <td className="py-1">
                        {isPurchase ? "רכישה" : "השכרה"}
                      </td>
                      <td className="py-1 font-medium">
                        {lineTotal !== null
                          ? `${lineTotal} ₪ = ${qty} × ${item.price}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4 text-sm">
          <h2 className="mb-2 text-base font-semibold text-brand text-right">
            סכומים
          </h2>
          <div className="grid gap-1 text-right">
            <div>
              <span className="font-medium">תרומה: </span>
              {donation} ₪
            </div>
            {draft.deposit.option === "cash" && (
              <div>
                <span className="font-medium">פיקדון מזומן: </span>
                {depositAmount} ₪
              </div>
            )}
            <div>
              <span className="font-medium">סכום רכישת מוצרים: </span>
              {purchaseTotal} ₪
            </div>
            {rentalTotal > 0 && !chuppahCoveredByDonation && (
              <div>
                <span className="font-medium">השכרת ציוד (מזוודת חופה וכו׳): </span>
                {rentalTotal} ₪
              </div>
            )}
            {chuppahCoveredByDonation && (
              <div>
                <span className="font-medium">השכרת מזוודת חופה: </span>
                60 ₪ (מכוסה על ידי התרומה)
              </div>
            )}
            <div className="mt-1 border-t border-dashed border-zinc-300 pt-1 font-semibold">
              סה&quot;כ לתשלום עכשיו: {totalToPayNow} ₪
            </div>
          </div>
        </section>

        <section className="mt-6 print:hidden rounded-xl border border-brand-soft/50 bg-white p-4 text-right">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleSaveAndPrint}
              className="w-full rounded-xl border-2 border-zinc-200 bg-white py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
            >
              שמירה + הדפסה
            </button>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-zinc-600">
                שליחת קבלה במייל או ב־WhatsApp
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactSendType("email")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${contactSendType === "email" ? "bg-brand text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                >
                  מייל
                </button>
                <button
                  type="button"
                  onClick={() => setContactSendType("phone")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${contactSendType === "phone" ? "bg-brand text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                >
                  WhatsApp
                </button>
              </div>
              {contactSendType === "email" ? (
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand" dir="ltr">
                  <input
                    type="text"
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                    placeholder="שם משתמש"
                    className="flex-1 min-w-[80px] px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-400 border-0 bg-transparent text-left"
                  />
                  <span className="text-zinc-500 px-0.5">@</span>
                  <select
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    className="rounded-none border-0 bg-zinc-50 px-3 py-2.5 text-sm text-foreground border-l border-zinc-200"
                  >
                    {EMAIL_DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div dir="rtl" className="flex gap-2 rounded-xl border border-zinc-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="border-0 bg-zinc-50 px-3 py-2.5 text-sm text-foreground border-l border-zinc-200 shrink-0"
                  >
                    {PHONE_PREFIXES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneRest}
                    onChange={(e) => setPhoneRest(e.target.value.replace(/\D/g, "").slice(0, 7))}
                    placeholder="XXX-XXXX"
                    className="flex-1 min-w-0 px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-400 border-0 text-right"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleSaveAndEmail}
                className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.25)] hover:bg-brand-dark transition-colors"
              >
                שמירה + שליחת קבלה
              </button>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-xl bg-brand py-3.5 text-center text-sm font-bold text-white shadow-[0_2px_12px_rgba(200,90,108,0.35)] hover:bg-brand-dark transition-colors mt-1"
            >
              סיום ההזמנה
            </button>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

