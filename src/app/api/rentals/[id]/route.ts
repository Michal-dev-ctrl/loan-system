import { NextResponse } from "next/server";
import {
  deleteRental,
  getRentalById,
  updateRental,
} from "../../../../lib/rentals/store";
import type { UpdateRentalInput } from "../../../../lib/rentals/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const rental = await getRentalById(decodeURIComponent(id));
    if (!rental) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }
    return NextResponse.json({ rental });
  } catch (error) {
    console.error("GET /api/rentals/[id] failed", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת ההזמנה" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const patch = (await request.json()) as UpdateRentalInput;
    const rental = await updateRental(decodeURIComponent(id), patch);
    if (!rental) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }
    return NextResponse.json({ rental });
  } catch (error) {
    console.error("PATCH /api/rentals/[id] failed", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון ההזמנה" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteRental(decodeURIComponent(id));
    if (!ok) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/rentals/[id] failed", error);
    return NextResponse.json(
      { error: "שגיאה במחיקת ההזמנה" },
      { status: 500 },
    );
  }
}
