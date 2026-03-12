"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRentalDraft } from "../RentalContext";

const IMAGE_EXTENSIONS = [".png", ".PNG", ".jpg", ".jpeg", ".JPG", ".JPEG", ".webp", ".WEBP"];

function ItemImage({
  itemId,
  imageUrl,
  name,
  square = true,
}: {
  itemId: string;
  imageUrl?: string;
  name: string;
  /** תמונה ריבועית (ברירת מחדל) */
  square?: boolean;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [extIndex, setExtIndex] = useState(0);
  const ext = imageUrl ? "" : IMAGE_EXTENSIONS[extIndex];
  const src = imageUrl ?? `/images/items/${itemId}${ext}`;

  const handleError = () => {
    if (imageUrl) {
      setError(true);
      return;
    }
    if (extIndex < IMAGE_EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 text-xs ${square ? "aspect-square" : "h-20"}`}
        aria-hidden
      >
        אין תמונה
      </div>
    );
  }
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-zinc-100 ${square ? "aspect-square" : "h-20"}`}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200" aria-hidden />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={name}
        className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

type ItemDefinition = {
  id: string;
  name: string;
  category: string;
  kind: "rental" | "purchase";
  unitPrice: number;
  damagePrice: number;
  description?: string;
  /** נתיב תמונה (אופציונלי). אם לא מוגדר – משתמשים ב־/images/items/[id].jpg */
  imageUrl?: string;
};

const CATALOG: ItemDefinition[] = [
  // אביזרים בסיסיים
  {
    id: "basic-table",
    name: "מצנח",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 150,
  },
  {
    id: "basic-arch-flowers",
    name: "קשתות פרחים",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "basic-arch-tol",
    name: "קשתות בד",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "basic-arch-orchid",
    name: "קשתות סחלב",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "basic-tablecloth-1",
    name: "סלסלאות שושבניות",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 60,
  },
  {
    id: "basic-tablecloth-2",
    name: "סלסלאות רגיל",
    category: "basic",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 60,
  },
  // אביזרים משמחים (מסודרים לפי א"ב)
  {
    id: "happy-instruments-1",
    name: "דרבוקות",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "happy-instruments-2",
    name: "גיטרה",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "happy-instruments-3",
    name: "תוף מרים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "happy-instruments-4",
    name: "קשקשנים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 40,
  },
  {
    id: "happy-shirts",
    name: "חולצות מזל טוב",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 35,
  },
  {
    id: "happy-hats-1",
    name: "כובעים גדולים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-hats-2",
    name: "כובעים קטנים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-hearts-1",
    name: "לבבות גדולים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 20,
  },
  {
    id: "happy-hearts-2",
    name: "לבבות קטנים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 20,
  },
  {
    id: "happy-glasses",
    name: "משקפיים וקשתות לשיער",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-balloon-stick",
    name: "מקל בלונים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 30,
  },
  {
    id: "happy-fans-1",
    name: "מניפות גדולות",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 30,
  },
  {
    id: "happy-fans-2",
    name: "מניפות קטנות",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 30,
  },
  {
    id: "happy-fans-3",
    name: "מניפות פרווה",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 30,
  },
  {
    id: "happy-umbrella",
    name: "מטריה",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 80,
  },
  {
    id: "happy-sticks-threads-1",
    name: "מקלות צבעי אש",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-sticks-threads-2",
    name: "סרט לב אדום",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-sticks-threads-3",
    name: "סרט לב ורוד",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-sticks-threads-4",
    name: "מקלות צבעים סגול לבן",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 25,
  },
  {
    id: "happy-moeddot",
    name: "מועדדות",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 50,
  },
  {
    id: "happy-flower-circles",
    name: "עיגולי פרחים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 60,
  },
  {
    id: "happy-flower-chains-1",
    name: "שרשראות פרחים – פשוט",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 50,
  },
  {
    id: "happy-flower-chains-2",
    name: "שרשראות פרחים – יקר",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 50,
  },
  {
    id: "happy-hoop-threads",
    name: "חישוק צבעוני עם חוטים",
    category: "happy",
    kind: "rental",
    unitPrice: 0,
    damagePrice: 35,
  },
  // מזוודת חופה
  {
    id: "extra-chuppah-kit",
    name: "מזוודת חופה",
    category: "extra",
    kind: "rental",
    unitPrice: 60,
    damagePrice: 60,
    description:
      "הכוללת: עשישיות, נרות, כוס לשבירה, תפילה לכלה, תפילה לאם הכלה והחתן, נרות, נצנצים לזריקה על החתן, ערכת עזרה ראשונה, ערכת מכשירי כתיבה, ערכת תפירה, טישו ומגבונים, מצית. המזוודה במחיר 60 ₪.",
  },
  // דברים לקנייה (מסודרים לפי א"ב)
  {
    id: "purchase-balloons",
    name: "בלונים",
    category: "purchase",
    kind: "purchase",
    unitPrice: 5,
    damagePrice: 5,
  },
  {
    id: "purchase-balloon-heart-big",
    name: "בלון לב אדום/לבן גדול",
    category: "purchase",
    kind: "purchase",
    unitPrice: 2,
    damagePrice: 2,
  },
  {
    id: "purchase-balloon-heart-small",
    name: "בלון לב אדום/לבן קטן",
    category: "purchase",
    kind: "purchase",
    unitPrice: 1,
    damagePrice: 1,
  },
  {
    id: "purchase-hearts-half",
    name: "חצי קילו לבבות",
    category: "purchase",
    kind: "purchase",
    unitPrice: 50,
    damagePrice: 50,
    imageUrl: "/images/items/purchashalfe-hearts-.png",
  },
  {
    id: "purchase-sparklers",
    name: "זיקוקים",
    category: "purchase",
    kind: "purchase",
    unitPrice: 14,
    damagePrice: 14,
  },
  {
    id: "purchase-rings-threads",
    name: "טבעות עם חוטים",
    category: "purchase",
    kind: "purchase",
    unitPrice: 7,
    damagePrice: 7,
  },
  {
    id: "purchase-marshmallow",
    name: "מרשמלו עטוף",
    category: "purchase",
    kind: "purchase",
    unitPrice: 30,
    damagePrice: 30,
  },
  {
    id: "purchase-hearts-kilo",
    name: "קילו לבבות",
    category: "purchase",
    kind: "purchase",
    unitPrice: 85,
    damagePrice: 85,
  },
  {
    id: "purchase-confetti-medium",
    name: "קונפטי בינוני",
    category: "purchase",
    kind: "purchase",
    unitPrice: 15,
    damagePrice: 15,
  },
  {
    id: "purchase-confetti-large",
    name: "קונפטי גדול",
    category: "purchase",
    kind: "purchase",
    unitPrice: 25,
    damagePrice: 25,
  },
  {
    id: "purchase-confetti-small",
    name: "קונפטי קטן",
    category: "purchase",
    kind: "purchase",
    unitPrice: 6,
    damagePrice: 6,
  },
];

const CATEGORY_TITLES: Record<string, string> = {
  basic: "אביזרים בסיסיים",
  happy: "אביזרים משמחים",
  purchase: "מוצרים לקנייה",
  extra: "מזוודת חופה",
};

const CATEGORY_ORDER: Array<keyof typeof CATEGORY_TITLES> = [
  "basic",
  "happy",
  "purchase",
  "extra",
];

const ARCH_SUB_IDS = ["basic-arch-flowers", "basic-arch-tol", "basic-arch-orchid"] as const;
const ARCH_MAX_TOTAL = 8;

const BASKET_SUB_IDS = ["basic-tablecloth-1", "basic-tablecloth-2"] as const;
const BASKET_MAX_TOTAL = 10;

const STICKS_THREADS_SUB_IDS = [
  "happy-sticks-threads-1",
  "happy-sticks-threads-2",
  "happy-sticks-threads-3",
  "happy-sticks-threads-4",
] as const;

const GLASSES_SUB_IDS = ["happy-glasses-light", "happy-glasses-no-light"] as const;

const INSTRUMENTS_SUB_IDS = [
  "happy-instruments-1",
  "happy-instruments-2",
  "happy-instruments-3",
  "happy-instruments-4",
] as const;

const HATS_SUB_IDS = ["happy-hats-1", "happy-hats-2"] as const;

const FANS_SUB_IDS = ["happy-fans-1", "happy-fans-2", "happy-fans-3"] as const;

const HEARTS_SUB_IDS = ["happy-hearts-1", "happy-hearts-2"] as const;

const FLOWER_CHAINS_SUB_IDS = ["happy-flower-chains-1", "happy-flower-chains-2"] as const;

/** פריטים לקנייה ממזוודת חופה – מופיעים רק בעמוד מזוודת חופה */
const CHUPPAH_PURCHASE_ITEMS: { id: string; name: string; unitPrice: number }[] = [
  { id: "purchase-chuppah-tefila-kahal", name: "תפילה לציבור (25 יחידות)", unitPrice: 10 },
  { id: "purchase-chuppah-cup-break", name: "כוס לשבירה", unitPrice: 5 },
  { id: "purchase-chuppah-glitter", name: "נצנצים לזריקה על החתן", unitPrice: 5 },
  { id: "purchase-chuppah-candles", name: "נרות (5 ₪ לנר)", unitPrice: 5 },
];

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setItemQuantity } = useRentalDraft();
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof CATEGORY_TITLES>("basic");
  const [showChuppahPurchase, setShowChuppahPurchase] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORY_ORDER.includes(cat as keyof typeof CATEGORY_TITLES)) {
      setActiveCategory(cat as keyof typeof CATEGORY_TITLES);
    }
  }, [searchParams]);

  const byCategory = (category: string) =>
    CATALOG.filter((item) => item.category === category);

  const activeIndex = CATEGORY_ORDER.indexOf(activeCategory);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const isLast = activeIndex === CATEGORY_ORDER.length - 1;
    if (isLast) {
      router.push("/rental/summary");
    } else {
      setActiveCategory(CATEGORY_ORDER[activeIndex + 1]);
    }
  };

  const handlePrev = () => {
    const isFirst = activeIndex === 0;
    if (isFirst) {
      router.push("/rental/dates");
    } else {
      setActiveCategory(CATEGORY_ORDER[activeIndex - 1]);
    }
  };

  const archTotal =
    ARCH_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const basketTotal =
    BASKET_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const sticksThreadsTotal =
    STICKS_THREADS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const instrumentsTotal =
    INSTRUMENTS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const hatsTotal =
    HATS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const fansTotal =
    FANS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const heartsTotal =
    HEARTS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const flowerChainsTotal =
    FLOWER_CHAINS_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);
  const glassesTotal =
    GLASSES_SUB_IDS.reduce((s, id) => s + (draft.items[id] ?? 0), 0);

  const renderItemsForCategory = (category: string) => {
    const items = byCategory(category).filter((item) => {
      if (category === "basic") {
        return (
          !ARCH_SUB_IDS.includes(item.id as (typeof ARCH_SUB_IDS)[number]) &&
          !BASKET_SUB_IDS.includes(item.id as (typeof BASKET_SUB_IDS)[number])
        );
      }
      if (category === "happy") {
        return (
          !STICKS_THREADS_SUB_IDS.includes(item.id as (typeof STICKS_THREADS_SUB_IDS)[number]) &&
          !INSTRUMENTS_SUB_IDS.includes(item.id as (typeof INSTRUMENTS_SUB_IDS)[number]) &&
          !HATS_SUB_IDS.includes(item.id as (typeof HATS_SUB_IDS)[number]) &&
          !FANS_SUB_IDS.includes(item.id as (typeof FANS_SUB_IDS)[number]) &&
          !HEARTS_SUB_IDS.includes(item.id as (typeof HEARTS_SUB_IDS)[number]) &&
          !GLASSES_SUB_IDS.includes(item.id as (typeof GLASSES_SUB_IDS)[number]) &&
          !FLOWER_CHAINS_SUB_IDS.includes(item.id as (typeof FLOWER_CHAINS_SUB_IDS)[number])
        );
      }
      return true;
    });
    const isBasic = category === "basic";
    const isHappy = category === "happy";

    const cardBase =
      "flex flex-col rounded-2xl border border-brand-soft/80 bg-white p-3 shadow-[0_2px_8px_rgba(200,90,108,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(200,90,108,0.12)] hover:border-brand/20 min-w-0 relative";
    const cardClickable = cardBase + " cursor-pointer hover:bg-brand-soft/30";
    const cardSelected = " border-green-500 bg-green-50/90 ring-2 ring-green-400/50";
    const SelectedBadge = () => (
      <span className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold shadow-md" aria-hidden>✓</span>
    );
    const qtyBtn =
      "flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 text-sm leading-none transition-colors hover:bg-zinc-50 hover:border-zinc-300";
    const qtyBtnDisabled = "disabled:opacity-40 disabled:pointer-events-none";

    const isExtra = category === "extra";

    return (
      <section key={category} className="mt-8">
        <h2 className="text-base font-semibold text-zinc-800 mb-3 text-right tracking-tight">
          {CATEGORY_TITLES[category]}
        </h2>

        {isExtra && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className={`${cardBase} sm:max-w-[280px] flex-shrink-0 ${(draft.items[items[0]?.id] ?? 0) > 0 ? cardSelected : ""}`}>
              {(() => {
                const item = items[0];
                if (!item) return null;
                const quantity = draft.items[item.id] ?? 0;
                const atMax = quantity >= 1;
                return (
                  <>
                    {quantity > 0 && <SelectedBadge />}
                    <ItemImage itemId={item.id} imageUrl={item.imageUrl} name={item.name} />
                    <div className="mt-1.5 text-right">
                      <div className="font-medium text-sm text-zinc-800">{item.name}</div>
                      <div className="text-[11px] text-zinc-500">יחידה אחת</div>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <button type="button" className={qtyBtn} onClick={() => setItemQuantity(item.id, Math.max(0, quantity - 1))}>−</button>
                        <input type="number" min={0} max={1} value={quantity} onChange={(e) => setItemQuantity(item.id, Number.isNaN(parseInt(e.target.value, 10)) ? 0 : Math.min(1, parseInt(e.target.value, 10)))} className="h-8 w-12 rounded-lg border-2 border-zinc-300 bg-white text-center text-base font-bold text-zinc-800" />
                        <button type="button" className={`${qtyBtn} ${qtyBtnDisabled}`} onClick={() => setItemQuantity(item.id, quantity + 1)} disabled={atMax}>+</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex-1 rounded-2xl border border-brand-soft/60 bg-white p-4 text-right shadow-[0_2px_8px_rgba(200,90,108,0.06)]">
              <h3 className="text-base font-bold text-brand">מה יש במזוודה?</h3>
              <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-zinc-700 sm:grid-cols-2">
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> תפילת כלה + תפילת אימהות + תפילה לציבור (כ־25 יח׳)</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> עשישיות + נרות + מצית</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> גביע</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> כוס לשבירה</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> שבע ברכות חופה</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> ערכת עזרה ראשונה</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> ערכת מכשירי כתיבה</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> ערכת תפירה</li>
                <li className="flex items-center gap-2"><span className="text-brand/80">•</span> נצנצים לזריקה על החתן</li>
              </ul>
              <div className="mt-4 border-t border-brand-soft/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChuppahPurchase((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-right text-sm font-semibold text-amber-900 hover:bg-amber-100"
                >
                  <span>דברים לקנייה מהמזוודת חופה</span>
                  <span className="text-amber-600" aria-hidden>{showChuppahPurchase ? "▼" : "◀"}</span>
                </button>
                {showChuppahPurchase && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CHUPPAH_PURCHASE_ITEMS.map((item) => {
                      const quantity = draft.items[item.id] ?? 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white p-2"
                        >
                          <div className="min-w-0 flex-1 text-right">
                            <div className="text-[13px] font-medium text-zinc-800">{item.name}</div>
                            <div className="text-[11px] text-zinc-500">{item.unitPrice} ₪</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className={qtyBtn}
                              onClick={() => setItemQuantity(item.id, Math.max(0, quantity - 1))}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={quantity}
                              onChange={(e) => {
                                const val = Number.isNaN(parseInt(e.target.value, 10)) ? 0 : Math.max(0, parseInt(e.target.value, 10));
                                setItemQuantity(item.id, val);
                              }}
                              className="h-8 w-12 rounded-lg border-2 border-zinc-300 bg-white text-center text-base font-bold text-zinc-800"
                            />
                            <button
                              type="button"
                              className={qtyBtn}
                              onClick={() => setItemQuantity(item.id, quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${isExtra ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
          {isBasic && (
            <>
              <Link href="/rental/items/arches" className={cardClickable + (archTotal > 0 ? cardSelected : "")}>
                {archTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="basic-arch-flowers" name="קשתות" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">קשתות</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {archTotal}/{ARCH_MAX_TOTAL} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/baskets" className={cardClickable + (basketTotal > 0 ? cardSelected : "")}>
                {basketTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="basic-tablecloth" name="סלסלאות" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">סלסלאות</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {basketTotal}/{BASKET_MAX_TOTAL} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
            </>
          )}
          {isHappy && (
            <>
              <Link href="/rental/items/instruments" className={cardClickable + (instrumentsTotal > 0 ? cardSelected : "")}>
                {instrumentsTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-darbukot" name="כלי נגינה" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">כלי נגינה</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {instrumentsTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/sticks-threads" className={cardClickable + (sticksThreadsTotal > 0 ? cardSelected : "")}>
                {sticksThreadsTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-sticks-threads" name="מקלות עם חוטים" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">מקלות עם חוטים</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {sticksThreadsTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/hats" className={cardClickable + (hatsTotal > 0 ? cardSelected : "")}>
                {hatsTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-hats" name="כובעים" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">כובעים</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {hatsTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/fans" className={cardClickable + (fansTotal > 0 ? cardSelected : "")}>
                {fansTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-fans" name="מניפות" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">מניפות</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {fansTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/glasses" className={cardClickable + (glassesTotal > 0 ? cardSelected : "")}>
                {glassesTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-glasses" name="משקפיים וקשתות לשיער" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">משקפיים וקשתות לשיער</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {glassesTotal} · עם אורות / ללא אורות
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/hearts" className={cardClickable + (heartsTotal > 0 ? cardSelected : "")}>
                {heartsTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-hearts" name="לבבות" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">לבבות</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {heartsTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
              <Link href="/rental/items/flower-chains" className={cardClickable + (flowerChainsTotal > 0 ? cardSelected : "")}>
                {flowerChainsTotal > 0 && <SelectedBadge />}
                <ItemImage itemId="happy-flower-chains" name="שרשראות פרחים" />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">שרשראות פרחים</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    סה״כ {flowerChainsTotal} · לחצו לבחירת סוגים
                  </div>
                </div>
              </Link>
            </>
          )}
          {items.filter((item) => !isExtra).map((item) => {
            const quantity = draft.items[item.id] ?? 0;
            const isPurchase = item.kind === "purchase";
            const maxQty =
              item.id === "extra-chuppah-kit" || item.id === "basic-table"
                ? 1
                : item.id === "happy-shirts"
                  ? 6
                  : undefined;
            const atMax = maxQty !== undefined && quantity >= maxQty;
            return (
              <div key={item.id} className={cardBase + (quantity > 0 ? cardSelected : "")}>
                {quantity > 0 && <SelectedBadge />}
                <ItemImage
                  itemId={item.id}
                  imageUrl={item.imageUrl}
                  name={item.name}
                />
                <div className="mt-1.5 min-h-0 flex-1 flex flex-col justify-end text-right">
                  <div className="font-medium text-sm text-zinc-800 break-words leading-tight">
                    {item.name}
                  </div>
                  {maxQty === 1 && (
                    <div className="text-[11px] text-zinc-500">יחידה אחת</div>
                  )}
                  {maxQty === 6 && (
                    <div className="text-[11px] text-zinc-500">עד 6</div>
                  )}
                  {isPurchase && (
                    <div className="text-[11px] text-zinc-500">
                      {item.unitPrice} ₪
                    </div>
                  )}
                  {!isPurchase && item.unitPrice > 0 && maxQty !== 1 && (
                    <div className="text-[11px] text-zinc-500">השכרה</div>
                  )}
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      className={qtyBtn}
                      onClick={() =>
                        setItemQuantity(item.id, Math.max(0, quantity - 1))
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={maxQty ?? undefined}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number.isNaN(parseInt(e.target.value, 10))
                          ? 0
                          : parseInt(e.target.value, 10);
                        setItemQuantity(
                          item.id,
                          maxQty !== undefined ? Math.min(val, maxQty) : val
                        );
                      }}
                      className="h-8 w-12 rounded-lg border-2 border-zinc-300 bg-white text-center text-base font-bold text-zinc-800"
                    />
                    <button
                      type="button"
                      className={`${qtyBtn} ${qtyBtnDisabled}`}
                      onClick={() => setItemQuantity(item.id, quantity + 1)}
                      disabled={atMax}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="app-page text-foreground">
      <header className="sticky top-0 z-20 border-b-2 border-brand-soft bg-gradient-to-b from-white to-brand-soft/20 shadow-[0_2px_12px_rgba(200,90,108,0.12)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link href="/" className="flex flex-shrink-0 items-center gap-3 rounded-xl py-1 pr-2 hover:opacity-90" aria-label="עמוד ראשי">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="" width={160} height={100} className="h-14 w-auto min-h-[52px] object-contain sm:h-16 sm:min-h-[60px]" />
              <span className="hidden text-base font-semibold text-brand-dark sm:inline">עמוד ראשי</span>
            </Link>
            <button
              type="button"
              onClick={handlePrev}
              className="text-sm font-medium text-zinc-600 hover:text-brand transition-colors"
            >
              ← חזרה
            </button>
          </div>
          <span className="text-xs text-zinc-500 tabular-nums">{activeIndex + 1} / {CATEGORY_ORDER.length}</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col items-stretch px-4 py-6 sm:py-8">
        <h1 className="text-xl font-bold text-brand text-center tracking-tight">
          {CATEGORY_TITLES[activeCategory]}
        </h1>
        <p className="mt-1 text-center text-sm text-brand-dark">
          בחרו כמות לכל פריט. מעבר חופשי בין הקטגוריות.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {CATEGORY_ORDER.map((categoryKey) => (
            <button
              key={categoryKey}
              type="button"
              onClick={() => setActiveCategory(categoryKey)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeCategory === categoryKey
                  ? "bg-brand text-white shadow-[0_2px_8px_rgba(200,90,108,0.35)]"
                  : "bg-white text-zinc-600 border border-brand-soft hover:border-brand/40 hover:bg-brand-soft/50"
              }`}
            >
              {CATEGORY_TITLES[categoryKey]}
            </button>
          ))}
        </div>

        <form onSubmit={handleNext} className="mt-6">
          {renderItemsForCategory(activeCategory)}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-center text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
            >
              חזרה
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand py-3 font-semibold text-sm text-white shadow-[0_2px_8px_rgba(200,90,108,0.3)] hover:bg-brand-dark transition-colors"
            >
              {activeIndex === CATEGORY_ORDER.length - 1 ? "לסיכום והקבלה" : "הבא"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

