import type { SavedRental, UpdateRentalInput } from "./types";

export const LOCAL_STORAGE_KEY = "event_rentals";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `בקשה נכשלה (${res.status})`,
    );
  }
  return data;
}

export async function fetchRentals(): Promise<SavedRental[]> {
  const res = await fetch("/api/rentals", { cache: "no-store" });
  const data = await parseJson<{ rentals: SavedRental[] }>(res);
  return data.rentals || [];
}

export async function fetchRental(id: string): Promise<SavedRental | null> {
  const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  const data = await parseJson<{ rental: SavedRental }>(res);
  return data.rental;
}

export async function createRentalApi(
  rental: Omit<SavedRental, "id" | "createdAt"> & { id?: string },
): Promise<SavedRental> {
  const res = await fetch("/api/rentals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rental),
  });
  const data = await parseJson<{ rental: SavedRental }>(res);
  return data.rental;
}

export async function updateRentalApi(
  id: string,
  patch: UpdateRentalInput,
): Promise<SavedRental> {
  const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<{ rental: SavedRental }>(res);
  return data.rental;
}

export async function deleteRentalApi(id: string): Promise<void> {
  const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await parseJson<{ success: boolean }>(res);
}

export async function migrateLocalRentals(
  rentals: SavedRental[],
): Promise<{ imported: number; skipped: number }> {
  const res = await fetch("/api/rentals/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rentals }),
  });
  return parseJson<{ imported: number; skipped: number }>(res);
}

export function readLocalRentals(): SavedRental[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedRental[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearLocalRentals(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}
