import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-soft via-[#fef5f7] to-white text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-brand-soft bg-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(200,90,108,0.12)]">
            <h1 className="text-2xl font-bold text-brand sm:text-3xl tracking-tight">
              גמ"ח אור לכלה שמחת "יום טוב"
            </h1>
            <p className="mt-2 text-sm text-zinc-600 font-medium">
              לע"נ ר' "יום טוב" ליפמן ב"ר משה שי זצ"ל
            </p>
            <div className="mt-6 w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="לוגו העמותה"
                width={420}
                height={260}
                className="h-auto max-h-80 w-full max-w-lg rounded-2xl border-2 border-brand-soft bg-white object-contain shadow-[0_8px_24px_rgba(200,90,108,0.18)]"
              />
            </div>
            <p className="mt-5 text-sm sm:text-base text-brand-dark font-medium">
              הרשמה, בחירת ציוד, פיקדון ותרומה – הכול במקום אחד
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/rental/personal-details"
              className="flex-1 rounded-2xl bg-brand px-8 py-4 text-center text-lg font-semibold text-white shadow-[0_4px_14px_rgba(200,90,108,0.4)] transition-all hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(166,66,88,0.45)]"
            >
              התחל
            </Link>
            <Link
              href="/search"
              className="flex-1 rounded-2xl border-2 border-brand/50 bg-white px-8 py-4 text-center text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-brand-soft hover:border-brand/70"
            >
              חיפוש והחזרת ציוד
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-zinc-500 border-t border-brand-soft/50 bg-white/50">
        <p>© 2026 כל הזכויות שמורות | האתר פותח ע&quot;י מיכל רבינוביץ</p>
      </footer>
    </div>
  );
}
