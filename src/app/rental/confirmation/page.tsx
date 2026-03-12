export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-zinc-100 px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <span className="text-3xl leading-none text-emerald-500">✓</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">
          ההזמנה נשמרה בהצלחה
        </h1>
        <p className="text-sm text-zinc-600 mb-4">
          ניתן תמיד לחזור לרשימת ההשכרות והחזרות כדי לראות את הפרטים.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(200,90,108,0.35)] hover:bg-brand-dark transition-colors"
        >
          חזרה לדף הראשי
        </a>
      </div>
    </div>
  );
}

