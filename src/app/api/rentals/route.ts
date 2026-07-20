import { NextResponse } from "next/server";
import {
  createRental,
  getStoreInfo,
  listRentals,
} from "../../../lib/rentals/store";
import type { SavedRental } from "../../../lib/rentals/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rentals = await listRentals();
    return NextResponse.json({
      rentals,
      store: getStoreInfo(),
    });
  } catch (error) {
    console.error("GET /api/rentals failed", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת ההזמנות מהשרת" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SavedRental>;
    if (!body?.personal?.firstName || !body?.personal?.lastName) {
      return NextResponse.json(
        { error: "חסרים פרטי לקוח לשמירת הזמנה" },
        { status: 400 },
      );
    }

    const rental = await createRental({
      personal: body.personal,
      deposit: body.deposit!,
      dates: body.dates!,
      items: body.items || {},
      totals: body.totals!,
      notes: body.notes,
      extraChargeAmount: body.extraChargeAmount,
      returnCompleted: body.returnCompleted,
      returnDetails: body.returnDetails,
      id: body.id,
    });

    return NextResponse.json({ rental }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rentals failed", error);
    const message =
      error instanceof Error ? error.message : "שגיאה בשמירת ההזמנה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
