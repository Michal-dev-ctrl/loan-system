import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReceiptContent } from "./buildReceipt";
import type { SavedRental } from "../rentals/types";

const rental: SavedRental = {
  id: "12",
  createdAt: "2026-07-21T10:00:00.000Z",
  personal: {
    firstName: "מיכל",
    lastName: "שי",
    phone1: "0556771200",
    phone2: "0524545458",
  },
  deposit: {
    option: "cash",
    chequeName: "",
    chequeNumber: "",
    depositAmount: 200,
    donationAmount: 50,
  },
  dates: { pickupDate: "2026-08-01", returnDate: "2026-08-05" },
  items: {
    "basic-table": 1,
    "happy-instruments-1": 2,
  },
  totals: {
    donation: 50,
    depositAmount: 200,
    purchaseTotal: 0,
    rentalTotal: 0,
    totalToPayNow: 250,
  },
  notes: "הערה לבדיקה",
};

const catalog = [
  { id: "basic-table", name: "מצנח", price: 0 },
  { id: "happy-instruments-1", name: "דרבוקות", price: 0 },
  { id: "ignored", name: "לא נבחר", price: 10 },
];

describe("buildReceiptContent", () => {
  it("includes customer, items and totals in text", () => {
    const receipt = buildReceiptContent(rental, catalog);
    assert.match(receipt.subject, /מערכת ההשאלה של גמ״ח אור לכלה/);
    assert.match(receipt.subject, /12/);
    assert.match(receipt.text, /מיכל שי/);
    assert.match(receipt.text, /0556771200/);
    assert.match(receipt.text, /מצנח/);
    assert.match(receipt.text, /דרבוקות/);
    assert.match(receipt.text, /הערה לבדיקה/);
    assert.match(receipt.text, /250/);
  });

  it("builds RTL HTML with item table", () => {
    const receipt = buildReceiptContent(rental, catalog, {
      customerEmail: "a@b.com",
    });
    assert.match(receipt.html, /dir="rtl"/);
    assert.match(receipt.html, /מצנח/);
    assert.match(receipt.html, /a@b.com/);
    assert.match(receipt.html, /סה&quot;כ לתשלום עכשיו/);
  });

  it("lists every selected equipment line in the body", () => {
    const receipt = buildReceiptContent(rental, catalog);
    assert.match(receipt.text, /— ציוד ופריטים —/);
    assert.match(receipt.html, /ציוד ופריטים/);
    assert.match(receipt.html, /דרבוקות/);
  });
});
