"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRentalDraft } from "../RentalContext";
import { AppHeader } from "../../components/AppHeader";

export default function DepositPage() {
  const router = useRouter();
  const { draft, updateDeposit } = useRentalDraft();
  const { option, chequeName } = draft.deposit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!option) {
      return;
    }

    if (option === "cheque") {
      updateDeposit({
        depositAmount: 0, // פיקדון בצ'ק – לא נכנס לסכום לתשלום ככסף יוצא
        donationAmount: 60,
      });
    } else if (option === "cash") {
      updateDeposit({
        depositAmount: 1000,
        donationAmount: 60,
      });
    }

    router.push("/rental/dates");
  };

  const totalForDisplay =
    draft.deposit.depositAmount + draft.deposit.donationAmount;

  return (
    <div className="app-page text-foreground">
      <AppHeader backHref="/rental/personal-details" backLabel="לפרטים אישיים" rightSlot="שלב 2 מתוך 5" />

      <main className="mx-auto flex max-w-lg flex-col items-stretch px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
          <h1 className="text-2xl font-bold text-brand text-center">
            פיקדון ותרומה
          </h1>
          <p className="mt-2 text-center text-sm text-brand-dark">
            בחרו בין צ&apos;ק פיקדון לבין פיקדון מזומן
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <fieldset className="space-y-3">
              <legend className="mb-1 block text-sm font-medium text-right text-zinc-700">
                אפשרויות פיקדון:
              </legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-soft/80 bg-white p-4 text-right transition-colors hover:bg-brand-soft/30">
              <input
                type="radio"
                name="depositOption"
                checked={option === "cheque"}
                onChange={() =>
                  updateDeposit({
                    option: "cheque",
                    chequeName: draft.deposit.chequeName,
                    chequeNumber: draft.deposit.chequeNumber,
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold">
                  צ&apos;ק פיקדון + 60 ₪ תרומה
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-soft/80 bg-white p-4 text-right transition-colors hover:bg-brand-soft/30">
              <input
                type="radio"
                name="depositOption"
                checked={option === "cash"}
                onChange={() =>
                  updateDeposit({
                    option: "cash",
                    chequeName: "",
                    chequeNumber: "",
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold">
                  פיקדון מזומן 1000 ₪ + 60 ₪ תרומה
                </div>
              </div>
            </label>
          </fieldset>

          {option === "cheque" && (
            <div className="space-y-4 rounded-xl border border-brand-soft/60 bg-brand-soft/20 p-4">
              <div>
                <label
                  htmlFor="chequeName"
                  className="block text-sm font-medium text-right text-zinc-700"
                >
                  ע&quot;ש מי הצ&apos;ק (אופציונלי)
                </label>
                <input
                  id="chequeName"
                  type="text"
                  value={chequeName}
                  onChange={(e) =>
                    updateDeposit({ chequeName: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="שם המופיע על הצ'ק"
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-brand/30 bg-brand-soft/30 p-4 text-sm text-right">
            <div>תרומה קבועה: 60 ₪</div>
            {option === "cash" && <div>פיקדון מזומן: 1000 ₪</div>}
            {option === "cheque" && <div>פיקדון בצ&apos;ק (לא מחושב כסכום לתשלום במזומן).</div>}
            <div className="mt-2 font-semibold">
              סה&quot;כ משוער לתשלום עכשיו:{" "}
              {option === "cash" ? `${totalForDisplay} ₪` : "60 ₪ (תרומה)"}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/rental/personal-details"
              className="flex-1 rounded-xl border border-zinc-200 py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50"
            >
              חזרה לפרטים אישיים
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark disabled:opacity-60"
              disabled={!option}
            >
              המשך לתאריכים
            </button>
          </div>
        </form>
        </div>
      </main>
    </div>
  );
}


