"use client";

import Link from "next/link";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
};

export function AppHeader({ backHref, backLabel, rightSlot }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-brand-soft bg-gradient-to-b from-white to-brand-soft/20 shadow-[0_2px_12px_rgba(200,90,108,0.12)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-3 rounded-xl py-1 pr-2 transition-opacity hover:opacity-90"
            aria-label="עמוד ראשי"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt=""
              width={160}
              height={100}
              className="h-14 w-auto min-h-[52px] object-contain sm:h-16 sm:min-h-[60px]"
            />
            <span className="hidden text-base font-semibold text-brand-dark sm:inline">עמוד ראשי</span>
          </Link>
          {backHref && backLabel && (
            <Link
              href={backHref}
              className="text-sm font-medium text-zinc-600 hover:text-brand transition-colors"
            >
              ← {backLabel}
            </Link>
          )}
        </div>
        {rightSlot && (
          <div className="flex-shrink-0 text-xs font-medium text-zinc-500">{rightSlot}</div>
        )}
      </div>
    </header>
  );
}
