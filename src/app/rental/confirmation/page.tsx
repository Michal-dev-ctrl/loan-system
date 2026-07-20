"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRentalDraft } from "../RentalContext";

export default function ConfirmationPage() {
  const router = useRouter();
  const { resetDraft } = useRentalDraft();

  useEffect(() => {
    resetDraft();
    // תמיד חוזרים למסך הראשי אחרי סיום
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        router.replace("/");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [resetDraft, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-zinc-100 px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <span className="text-3xl leading-none text-emerald-500">✓</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">
          ההזמנה נשמרה בהצלחה
        </h1>
        <p className="mt-2 text-sm text-zinc-600 mb-4">
          מעבירים אותך למסך הראשי…
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(200,90,108,0.35)] hover:bg-brand-dark transition-colors"
        >
          למסך הראשי עכשיו
        </a>
      </div>
    </div>
  );
}
