"use client";

import { useState, useMemo } from "react";
import { HDate, gematriya } from "@hebcal/core";

const HEBREW_MONTH_NAMES: Record<number, string> = {
  1: "ניסן",
  2: "אייר",
  3: "סיון",
  4: "תמוז",
  5: "אב",
  6: "אלול",
  7: "תשרי",
  8: "חשון",
  9: "כסלו",
  10: "טבת",
  11: "שבט",
  12: "אדר",
  13: "אדר ב׳",
};

const WEEKDAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type DayCell = {
  day: number;
  hdate: HDate;
  greg: Date;
  iso: string;
  disabled: boolean;
};

function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayISO(): string {
  return dateToISO(new Date());
}

type HebrewCalendarProps = {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  label?: string;
};

export function HebrewCalendar({ value, onChange, min, max, label }: HebrewCalendarProps) {
  const todayISO = getTodayISO();

  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      const hd = new HDate(d);
      return { year: hd.getFullYear(), month: hd.getMonth() };
    }
    const hd = new HDate(new Date());
    return { year: hd.getFullYear(), month: hd.getMonth() };
  });

  const minAbs = min ? new Date(min + "T12:00:00").getTime() : null;
  const maxAbs = max ? new Date(max + "T12:00:00").getTime() : null;

  const { grid, monthName, yearHeb } = useMemo(() => {
    const { year, month } = viewDate;
    const daysInMonth = HDate.daysInMonth(month, year);
    const firstDay = new HDate(1, month, year);
    const startCol = firstDay.getDay();
    const monthName = HEBREW_MONTH_NAMES[month] || "";
    const yearHeb = "ה'" + gematriya(year % 1000);

    const rows: (DayCell | null)[][] = [];
    let row: (DayCell | null)[] = [];
    let col = 0;

    for (let empty = 0; empty < startCol; empty++) {
      row.push(null);
      col++;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hdate = new HDate(day, month, year);
      const greg = hdate.greg();
      const iso = dateToISO(greg);
      const time = greg.getTime();
      const disabled = (minAbs != null && time < minAbs) || (maxAbs != null && time > maxAbs);
      row.push({ day, hdate, greg, iso, disabled });
      col++;
      if (col === 7) {
        rows.push(row);
        row = [];
        col = 0;
      }
    }
    if (row.length) {
      while (row.length < 7) row.push(null);
      rows.push(row);
    }

    return { grid: rows, monthName, yearHeb };
  }, [viewDate.year, viewDate.month, minAbs, maxAbs]);

  const goPrev = () => {
    if (viewDate.month === 1) {
      setViewDate({ year: viewDate.year - 1, month: HDate.isLeapYear(viewDate.year - 1) ? 13 : 12 });
    } else {
      setViewDate((v) => ({ ...v, month: v.month - 1 }));
    }
  };

  const goNext = () => {
    const monthsInYear = HDate.monthsInYear(viewDate.year);
    if (viewDate.month >= monthsInYear) {
      setViewDate({ year: viewDate.year + 1, month: 1 });
    } else {
      setViewDate((v) => ({ ...v, month: v.month + 1 }));
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      {label && (
        <div className="mb-2 text-sm font-medium text-zinc-700 text-right">{label}</div>
      )}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          aria-label="חודש קודם"
        >
          ‹
        </button>
        <div className="text-base font-bold text-brand">
          {monthName} {yearHeb}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          aria-label="חודש הבא"
        >
          ›
        </button>
      </div>
      <table className="w-full text-center border-collapse" role="grid" aria-label={label || "לוח שנה עברי"}>
        <thead>
          <tr>
            {WEEKDAY_NAMES.map((name) => (
              <th key={name} className="py-1 text-xs font-medium text-zinc-500 border-b border-zinc-100">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell: DayCell | null, ci) => {
                if (cell === null) {
                  return <td key={ci} className="p-0.5" />;
                }
                const { day, hdate, greg, iso, disabled } = cell;
                const isSelected = value === iso;
                const isToday = todayISO === iso;
                const hebDisplay = hdate.renderGematriya(true, true);
                return (
                  <td key={ci} className="p-0.5">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && onChange(iso)}
                      className={`w-full rounded-lg py-1.5 text-sm transition-colors ${
                        disabled
                          ? "cursor-not-allowed text-zinc-300"
                          : isSelected
                            ? "bg-brand text-white font-semibold"
                            : isToday
                              ? "bg-brand-soft/60 text-brand font-medium ring-1 ring-brand/40"
                              : "hover:bg-zinc-100 text-zinc-800"
                      }`}
                      title={`${iso} (${hebDisplay})`}
                    >
                      <div className="text-base font-bold">{greg.getDate()}</div>
                      <div className="text-[10px] leading-tight opacity-90">{hebDisplay}</div>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
