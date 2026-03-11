"use client";

import Link from "next/link";
import { useState } from "react";
import { useRentalDraft } from "../../RentalContext";
import { AppHeader } from "../../../components/AppHeader";

const HATS_SUB_IDS = ["happy-hats-1", "happy-hats-2"] as const;

const HATS_SUB_ITEMS: { id: (typeof HATS_SUB_IDS)[number]; name: string }[] = [
  { id: "happy-hats-1", name: "כובעים גדולים" },
  { id: "happy-hats-2", name: "כובעים קטנים" },
];

const IMAGE_EXTENSIONS = [".png", ".PNG", ".jpg", ".jpeg", ".JPG", ".JPEG", ".webp", ".WEBP"];

function HatImage({ itemId, name }: { itemId: string; name: string }) {
  const [error, setError] = useState(false);
  const [extIndex, setExtIndex] = useState(0);
  const ext = IMAGE_EXTENSIONS[extIndex];
  const src = `/images/items/${itemId}${ext}`;

  const handleError = () => {
    if (extIndex < IMAGE_EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="flex w-full aspect-square items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 text-xs">
        אין תמונה
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-zinc-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </div>
  );
}

export default function HatsPage() {
  const { draft, setItemQuantity } = useRentalDraft();

  const hatsTotal = HATS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);

  const setHatsQuantity = (id: (typeof HATS_SUB_IDS)[number], value: number) => {
    setItemQuantity(id, Math.max(0, Math.min(99, value)));
  };

  const cardBase =
    "flex flex-col rounded-2xl border border-brand-soft/80 bg-white p-3 shadow-[0_2px_8px_rgba(200,90,108,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(200,90,108,0.12)] hover:border-brand/20 min-w-0 relative";
  const cardSelected = " border-green-500 bg-green-50/90 ring-2 ring-green-400/50";
  const qtyBtn =
    "flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 text-sm leading-none transition-colors hover:bg-zinc-50 hover:border-zinc-300";
  const qtyBtnDisabled = "disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="app-page text-foreground">
      <AppHeader
        backHref="/rental/items?category=happy"
        backLabel="לבחירת ציוד"
        rightSlot={`סה״כ ${hatsTotal}`}
      />

      <main className="mx-auto flex max-w-4xl flex-col items-stretch px-4 py-8">
        <div className="rounded-2xl border border-brand-soft/60 bg-white p-6 shadow-[0_4px_20px_rgba(200,90,108,0.08)]">
          <h1 className="text-2xl font-bold text-brand text-center">
            כובעים
          </h1>
          <p className="mt-2 text-center text-sm text-brand-dark">
            בחרו כמות לכל סוג.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HATS_SUB_ITEMS.map(({ id, name }) => {
              const qty = draft.items[id] ?? 0;
              return (
                <div key={id} className={cardBase + (qty > 0 ? cardSelected : "")}>
                  {qty > 0 && (
                    <span className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold shadow-md" aria-hidden>✓</span>
                  )}
                  <HatImage itemId={id} name={name} />
                  <div className="mt-1.5 text-right">
                    <div className="font-medium text-sm text-zinc-800 break-words leading-tight">{name}</div>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <button
                        type="button"
                        className={qtyBtn}
                        onClick={() => setHatsQuantity(id, qty - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!Number.isNaN(v)) setHatsQuantity(id, v);
                        }}
                        className="h-8 w-12 rounded-lg border-2 border-zinc-300 bg-white text-center text-base font-bold text-zinc-800"
                      />
                      <button
                        type="button"
                        className={`${qtyBtn} ${qtyBtnDisabled}`}
                        onClick={() => setHatsQuantity(id, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/rental/items?category=happy"
              className="rounded-xl bg-brand px-8 py-3 font-semibold text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark"
            >
              חזרה לבחירת ציוד
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
