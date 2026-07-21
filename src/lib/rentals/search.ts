import type { SavedRental } from "./types";

/** Keep digits only so 055-677-1200 matches 0556771200 (and paste with hidden chars). */
export function digitsOnly(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function rentalMatchesSearch(
  rental: SavedRental,
  termRaw: string,
): boolean {
  const term = termRaw.trim().toLowerCase();
  if (!term) return true;

  const firstName = String(rental.personal?.firstName ?? "").toLowerCase();
  const lastName = String(rental.personal?.lastName ?? "").toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  const phone1 = String(rental.personal?.phone1 ?? "").toLowerCase();
  const phone2 = String(rental.personal?.phone2 ?? "").toLowerCase();
  const id = String(rental.id ?? "").toLowerCase();

  if (
    fullName.includes(term) ||
    phone1.includes(term) ||
    phone2.includes(term) ||
    id.includes(term)
  ) {
    return true;
  }

  const termDigits = digitsOnly(term);
  if (termDigits.length >= 3) {
    const p1 = digitsOnly(phone1);
    const p2 = digitsOnly(phone2);
    if (p1.includes(termDigits) || p2.includes(termDigits)) {
      return true;
    }
  }

  return false;
}

export function filterRentals(
  rentals: SavedRental[],
  termRaw: string,
): SavedRental[] {
  const term = termRaw.trim();
  if (!term) return rentals;
  return rentals.filter((rental) => rentalMatchesSearch(rental, term));
}
