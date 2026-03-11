"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRentalDraft } from "../RentalContext";
import { AppHeader } from "../../components/AppHeader";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { draft, updatePersonal } = useRentalDraft();
  const { firstName, lastName, phone1, phone2 } = draft.personal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone1 || !phone2) {
      return;
    }
    router.push("/rental/deposit");
  };

  return (
    <div className="app-page text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-lg flex-col items-stretch px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
          <h1 className="text-2xl font-bold text-brand text-center">
            פרטים אישיים
          </h1>
          <p className="mt-2 text-center text-sm text-brand-dark">
            שם ושני מספרי טלפון – שדות חובה
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-right text-zinc-700"
              >
                שם פרטי *
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => updatePersonal({ firstName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="שם פרטי"
              />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-right text-zinc-700"
            >
              שם משפחה *
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => updatePersonal({ lastName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="שם משפחה"
            />
          </div>
          <div>
            <label
              htmlFor="phone1"
              className="block text-sm font-medium text-right text-zinc-700"
            >
              טלפון נייד 1 *
            </label>
            <input
              id="phone1"
              type="tel"
              required
              value={phone1}
              onChange={(e) => updatePersonal({ phone1: e.target.value })}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="050-0000000"
            />
          </div>
          <div>
            <label
              htmlFor="phone2"
              className="block text-sm font-medium text-right text-zinc-700"
            >
              טלפון נייד 2 *
            </label>
            <input
              id="phone2"
              type="tel"
              required
              value={phone2}
              onChange={(e) => updatePersonal({ phone2: e.target.value })}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="050-0000000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/"
              className="flex-1 rounded-xl border border-zinc-200 py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50"
            >
              ביטול
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark"
            >
              המשך לפיקדון ותרומה
            </button>
          </div>
        </form>
        </div>
      </main>
    </div>
  );
}


