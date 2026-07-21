"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRentalDraft } from "../RentalContext";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetDraft } = useRentalDraft();
  const orderId = (searchParams.get("id") || "").trim();

  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        router.replace("/");
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="app-page flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-[0_8px_28px_rgba(16,185,129,0.45)]"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-16 w-16"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          הזמנתך נקלטה בהצלחה
        </h1>

        {orderId ? (
          <p className="mt-4 text-lg text-zinc-700">
            מספר הזמנה:{" "}
            <span className="font-bold text-brand" dir="ltr">
              {orderId}
            </span>
          </p>
        ) : (
          <p className="mt-4 text-base text-zinc-600">ההזמנה נשמרה במערכת</p>
        )}

        <p className="mt-3 text-sm text-zinc-500">
          הקבלה נשלחה למייל הגמ״ח
        </p>

        <p className="mt-6 text-sm text-zinc-500">
          מעבירים אותך לתפריט הראשי…
        </p>

        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(200,90,108,0.35)] hover:bg-brand-dark transition-colors"
        >
          לתפריט הראשי עכשיו
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="app-page flex min-h-[50vh] items-center justify-center text-zinc-500">
          טוען…
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
