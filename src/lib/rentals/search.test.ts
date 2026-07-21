import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  digitsOnly,
  filterRentals,
  rentalMatchesSearch,
} from "./search";
import {
  isValidIsraeliMobile,
  normalizeIsraeliMobile,
} from "./phone";
import type { SavedRental } from "./types";

function sample(overrides: Partial<SavedRental> = {}): SavedRental {
  return {
    id: "6",
    createdAt: "2026-07-20T00:00:00.000Z",
    personal: {
      firstName: "מיכל",
      lastName: "שי",
      phone1: "0556771200",
      phone2: "0524545458",
    },
    deposit: {
      option: null,
      chequeName: "",
      chequeNumber: "",
      depositAmount: 0,
      donationAmount: 0,
    },
    dates: { pickupDate: "2026-07-30", returnDate: "2026-08-09" },
    items: {},
    totals: {
      donation: 0,
      depositAmount: 0,
      purchaseTotal: 0,
      rentalTotal: 0,
      totalToPayNow: 0,
    },
    ...overrides,
  };
}

describe("digitsOnly / phone search", () => {
  it("strips dashes, spaces and invisible chars", () => {
    assert.equal(digitsOnly("055-677-1200"), "0556771200");
    assert.equal(digitsOnly("055 677 1200"), "0556771200");
    assert.equal(digitsOnly("\u200e0556771200"), "0556771200");
  });

  it("finds rental by plain phone", () => {
    const rentals = [sample()];
    assert.equal(filterRentals(rentals, "0556771200").length, 1);
  });

  it("finds rental by dashed phone", () => {
    const rentals = [sample()];
    assert.equal(filterRentals(rentals, "055-677-1200").length, 1);
  });

  it("finds rental by name and order id", () => {
    const rentals = [sample()];
    assert.equal(filterRentals(rentals, "מיכל").length, 1);
    assert.equal(filterRentals(rentals, "6").length, 1);
  });

  it("does not match unrelated phone", () => {
    const rentals = [sample()];
    assert.equal(filterRentals(rentals, "0500000000").length, 0);
  });

  it("matches reversed digit paste (RTL quirk)", () => {
    assert.equal(
      rentalMatchesSearch(sample(), "0021776550"),
      true,
    );
  });
});

describe("Israeli mobile validation", () => {
  it("accepts valid mobiles with or without dashes", () => {
    assert.equal(isValidIsraeliMobile("0556771200"), true);
    assert.equal(isValidIsraeliMobile("055-677-1200"), true);
    assert.equal(normalizeIsraeliMobile("052-454-5458"), "0524545458");
  });

  it("rejects empty, short, or landline-like numbers", () => {
    assert.equal(isValidIsraeliMobile(""), false);
    assert.equal(isValidIsraeliMobile("055677120"), false);
    assert.equal(isValidIsraeliMobile("031234567"), false);
    assert.equal(normalizeIsraeliMobile("123"), null);
  });
});
