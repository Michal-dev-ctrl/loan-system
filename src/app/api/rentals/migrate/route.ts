import { NextResponse } from "next/server";
import { upsertMany } from "../../../../lib/rentals/store";
import type { SavedRental } from "../../../../lib/rentals/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rentals?: SavedRental[] };
    const rentals = Array.isArray(body.rentals) ? body.rentals : [];
    if (rentals.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0 });
    }
    const result = await upsertMany(rentals);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/rentals/migrate failed", error);
    return NextResponse.json(
      { error: "שגיאה בהעברת נתונים ישנים לשרת" },
      { status: 500 },
    );
  }
}
