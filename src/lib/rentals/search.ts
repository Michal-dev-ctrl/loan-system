import type { SavedRental } from "./types";

/** Keep digits only so 055-677-1200 matches 0556771200 (and paste with hidden chars). */
export function digitsOnly(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

function phoneMatches(stored: string, termDigits: string): boolean {
  if (!termDigits) return false;
  const phone = digitsOnly(stored);
  if (!phone) return false;
  if (phone.includes(termDigits) || termDigits.includes(phone)) return true;
  // לפעמים בשדה RTL הספרות נשמרות הפוך בתיבת החיפוש
  const reversed = termDigits.split("").reverse().join("");
  return phone.includes(reversed) || reversed.includes(phone);
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
    if (phoneMatches(phone1, termDigits) || phoneMatches(phone2, termDigits)) {
      return true;
    }
    if (digitsOnly(id).includes(termDigits)) return true;
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
