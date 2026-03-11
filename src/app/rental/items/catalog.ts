export type ItemCategory =
  | "basic"
  | "fun"
  | "extra"
  | "purchase";

export type ItemStatus = "תקין" | "פגום / שבור" | "חלק חסר";

export type CatalogItem = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  purchaseOnly?: boolean;
  imageUrl?: string;
  damageFee?: number;
};

export const catalog: CatalogItem[] = [
  {
    id: "basic-table",
    name: "מצנח",
    category: "basic",
    price: 0,
    damageFee: 1000,
  },
  {
    id: "basic-tablecloth-1",
    name: "סלסלאות שושבניות",
    category: "basic",
    price: 0,
    damageFee: 40,
  },
  {
    id: "basic-tablecloth-2",
    name: "סלסלאות רגיל",
    category: "basic",
    price: 0,
    damageFee: 80,
  },
  {
    id: "basic-arch-flowers",
    name: "קשתות פרחים",
    category: "basic",
    price: 0,
    damageFee: 70,
  },
  {
    id: "basic-arch-tol",
    name: "קשתות בד",
    category: "basic",
    price: 0,
    damageFee: 40,
  },
  {
    id: "basic-arch-orchid",
    name: "קשתות סחלב",
    category: "basic",
    price: 0,
    damageFee: 100,
  },
  {
    id: "happy-instruments-1",
    name: "דרבוקות",
    category: "fun",
    price: 0,
    damageFee: 70,
  },
  {
    id: "happy-instruments-2",
    name: "גיטרה",
    category: "fun",
    price: 0,
    damageFee: 50,
  },
  {
    id: "happy-instruments-3",
    name: "תוף מרים",
    category: "fun",
    price: 0,
    damageFee: 20,
  },
  {
    id: "happy-instruments-4",
    name: "קשקשנים",
    category: "fun",
    price: 0,
    damageFee: 7,
  },
  {
    id: "happy-shirts",
    name: "חולצות מזל טוב",
    category: "fun",
    price: 0,
    damageFee: 100,
  },
  {
    id: "happy-hats-1",
    name: "כובעים גדולים",
    category: "fun",
    price: 0,
    damageFee: 25,
  },
  {
    id: "happy-hats-2",
    name: "כובעים קטנים",
    category: "fun",
    price: 0,
    damageFee: 4,
  },
  {
    id: "happy-hearts-1",
    name: "לבבות גדולים",
    category: "fun",
    price: 0,
    damageFee: 20,
  },
  {
    id: "happy-hearts-2",
    name: "לבבות קטנים",
    category: "fun",
    price: 0,
    damageFee: 15,
  },
  {
    id: "happy-balloon-stick",
    name: "מקל בלונים",
    category: "fun",
    price: 0,
    damageFee: 12,
  },
  {
    id: "happy-fans-1",
    name: "מניפות גדולות",
    category: "fun",
    price: 0,
    damageFee: 20,
  },
  {
    id: "happy-fans-2",
    name: "מניפות קטנות",
    category: "fun",
    price: 0,
    damageFee: 10,
  },
  {
    id: "happy-fans-3",
    name: "מניפות פרווה",
    category: "fun",
    price: 0,
    damageFee: 15,
  },
  {
    id: "happy-umbrella",
    name: "מטריה",
    category: "fun",
    price: 0,
    damageFee: 40,
  },
  {
    id: "happy-sticks-threads-1",
    name: "מקלות צבעי אש",
    category: "fun",
    price: 0,
    damageFee: 17,
  },
  {
    id: "happy-sticks-threads-2",
    name: "סרט לב אדום",
    category: "fun",
    price: 0,
    damageFee: 10,
  },
  {
    id: "happy-sticks-threads-3",
    name: "סרט לב ורוד",
    category: "fun",
    price: 0,
    damageFee: 10,
  },
  {
    id: "happy-sticks-threads-4",
    name: "מקלות צבעים סגול לבן",
    category: "fun",
    price: 0,
    damageFee: 7,
  },
  {
    id: "happy-moeddot",
    name: "מועדדות",
    category: "fun",
    price: 0,
    damageFee: 5,
  },
  {
    id: "happy-flower-circles",
    name: "עיגולי פרחים",
    category: "fun",
    price: 0,
    damageFee: 35,
  },
  {
    id: "happy-flower-chains-1",
    name: "שרשראות פרחים – פשוט",
    category: "fun",
    price: 0,
    damageFee:4,
  },
  {
    id: "happy-flower-chains-2",
    name: "שרשראות פרחים – יקר",
    category: "fun",
    price: 0,
    damageFee: 15,
  },
  {
    id: "happy-hoop-threads",
    name: "חישוק צבעוני עם חוטים",
    category: "fun",
    price: 0,
    damageFee: 10,
  },
  {
    id: "extra-chuppah-kit",
    name: "מזוודת חופה",
    category: "extra",
    price: 60,
    damageFee: 60,
  },
  // דברים לקנייה (מסודרים לפי א"ב)
  {
    id: "purchase-balloons",
    name: "בלונים",
    category: "purchase",
    price: 5,
    purchaseOnly: true,
  },
  {
    id: "purchase-balloon-heart-big",
    name: "בלון לב אדום/לבן גדול",
    category: "purchase",
    price: 2,
    purchaseOnly: true,
  },
  {
    id: "purchase-balloon-heart-small",
    name: "בלון לב אדום/לבן קטן",
    category: "purchase",
    price: 1,
    purchaseOnly: true,
  },
  {
    id: "purchase-hearts-half",
    name: "חצי קילו לבבות",
    category: "purchase",
    price: 50,
    purchaseOnly: true,
  },
  {
    id: "purchase-sparklers",
    name: "זיקוקים",
    category: "purchase",
    price: 14,
    purchaseOnly: true,
  },
  {
    id: "purchase-rings-threads",
    name: "טבעות עם חוטים",
    category: "purchase",
    price: 7,
    purchaseOnly: true,
  },
  {
    id: "purchase-marshmallow",
    name: "מרשמלו עטוף",
    category: "purchase",
    price: 30,
    purchaseOnly: true,
  },
  {
    id: "purchase-hearts-kilo",
    name: "קילו לבבות",
    category: "purchase",
    price: 85,
    purchaseOnly: true,
  },
  {
    id: "purchase-confetti-medium",
    name: "קונפטי בינוני",
    category: "purchase",
    price: 15,
    purchaseOnly: true,
  },
  {
    id: "purchase-confetti-large",
    name: "קונפטי גדול",
    category: "purchase",
    price: 25,
    purchaseOnly: true,
  },
  {
    id: "purchase-confetti-small",
    name: "קונפטי קטן",
    category: "purchase",
    price: 6,
    purchaseOnly: true,
  },
  // קנייה ממזוודת חופה (מופיעים בעמוד מזוודת חופה)
  {
    id: "purchase-chuppah-tefila-kahal",
    name: "תפילה לציבור (25 יחידות)",
    category: "purchase",
    price: 10,
    purchaseOnly: true,
  },
  {
    id: "purchase-chuppah-cup-break",
    name: "כוס לשבירה",
    category: "purchase",
    price: 5,
    purchaseOnly: true,
  },
  {
    id: "purchase-chuppah-glitter",
    name: "נצנצים לזריקה על החתן",
    category: "purchase",
    price: 5,
    purchaseOnly: true,
  },
  {
    id: "purchase-chuppah-candles",
    name: "נרות (כל נר 5 ₪)",
    category: "purchase",
    price: 5,
    purchaseOnly: true,
  },
];

export function getCategoryLabel(category: ItemCategory): string {
  switch (category) {
    case "basic":
      return "אביזרים בסיסיים";
    case "fun":
      return "אביזרים משמחים";
    case "extra":
      return "אביזרים נוספים";
    case "purchase":
      return "רכישת מוצרים";
    default:
      return "";
  }
}

