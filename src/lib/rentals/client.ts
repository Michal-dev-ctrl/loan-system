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

function isCloudStorageMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("blob") ||
    lower.includes("erofs") ||
    lower.includes("read-only") ||
    message.includes("Vercel Blob") ||
    message.includes("שגיאה בעדכון ההזמנה") ||
    message.includes("שגיאה בשמירת ההזמנה") ||
    message.includes("שגיאה במחיקת ההזמנה")
  );
}

function writeLocalRentals(rentals: SavedRental[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rentals));
}

function nextLocalId(existing: SavedRental[]): string {
  const maxId = existing.reduce((max, rental) => {
    const num = parseInt(String(rental.id), 10);
    return !Number.isNaN(num) && num > max ? num : max;
  }, 0);
  return String(maxId + 1);
}

function saveLocalCreate(
  input: Omit<SavedRental, "id" | "createdAt"> & { id?: string },
): SavedRental {
  const existing = readLocalRentals();
  const id = input.id?.trim() || nextLocalId(existing);
  const rental: SavedRental = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  existing.push(rental);
  writeLocalRentals(existing);
  return rental;
}

function saveLocalUpdate(
  id: string,
  patch: UpdateRentalInput,
): SavedRental | null {
  const existing = readLocalRentals();
  const index = existing.findIndex((r) => String(r.id).trim() === id.trim());
  if (index < 0) return null;
  const updated: SavedRental = {
    ...existing[index],
    ...patch,
    id: existing[index].id,
    createdAt: existing[index].createdAt,
  };
  existing[index] = updated;
  writeLocalRentals(existing);
  return updated;
}

export async function fetchRentals(): Promise<{
  rentals: SavedRental[];
  store?: {
    backend: string;
    durable: boolean;
    needsBlobSetup?: boolean;
  };
}> {
  let serverRentals: SavedRental[] = [];
  let store:
    | {
        backend: string;
        durable: boolean;
        needsBlobSetup?: boolean;
      }
    | undefined;

  try {
    const res = await fetch("/api/rentals", { cache: "no-store" });
    const data = await parseJson<{
      rentals: SavedRental[];
      store?: {
        backend: string;
        durable: boolean;
        needsBlobSetup?: boolean;
      };
    }>(res);
    serverRentals = data.rentals || [];
    store = data.store;
  } catch {
    store = {
      backend: "local",
      durable: false,
      needsBlobSetup: true,
    };
  }

  const localRentals = readLocalRentals();
  const byId = new Map<string, SavedRental>();
  // שרת קודם לדפדפן: localStorage ישן עם אותו מספר הזמנה לא ידרוס טלפון/פרטים מהענן
  for (const rental of [...localRentals, ...serverRentals]) {
    byId.set(String(rental.id).trim(), rental);
  }

  const rentals = Array.from(byId.values()).sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) return db - da;
    return Number(b.id) - Number(a.id);
  });

  return { rentals, store };
}

export async function fetchRental(id: string): Promise<SavedRental | null> {
  try {
    const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await parseJson<{ rental: SavedRental }>(res);
      return data.rental;
    }
  } catch {
    // fallback below
  }
  const local = readLocalRentals().find(
    (r) => String(r.id).trim() === String(id).trim(),
  );
  return local || null;
}

export async function createRentalApi(
  rental: Omit<SavedRental, "id" | "createdAt"> & { id?: string },
): Promise<SavedRental> {
  try {
    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rental),
    });
    const data = await parseJson<{ rental: SavedRental }>(res);
    return data.rental;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isCloudStorageMissingError(message)) {
      return saveLocalCreate(rental);
    }
    throw error;
  }
}

export async function updateRentalApi(
  id: string,
  patch: UpdateRentalInput,
): Promise<SavedRental> {
  try {
    const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.status === 404) {
      const localUpdated = saveLocalUpdate(id, patch);
      if (localUpdated) return localUpdated;
      throw new Error("הזמנה לא נמצאה");
    }
    const data = await parseJson<{ rental: SavedRental }>(res);
    return data.rental;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "הזמנה לא נמצאה") throw error;
    if (isCloudStorageMissingError(message)) {
      const updated = saveLocalUpdate(id, patch);
      if (updated) return updated;
      if (patch.personal && patch.dates && patch.deposit && patch.totals) {
        return saveLocalCreate({
          personal: patch.personal,
          deposit: patch.deposit,
          dates: patch.dates,
          items: patch.items || {},
          totals: patch.totals,
          notes: patch.notes,
          extraChargeAmount: patch.extraChargeAmount,
          returnCompleted: patch.returnCompleted,
          returnDetails: patch.returnDetails,
          id,
        });
      }
      throw new Error(
        "לא ניתן לעדכן את ההזמנה במחשב הזה. נסי לשמור מחדש את ההזמנה.",
      );
    }
    throw error;
  }
}

export async function deleteRentalApi(id: string): Promise<void> {
  let serverFailedForStorage = false;
  try {
    const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await parseJson<{ success: boolean }>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isCloudStorageMissingError(message)) {
      serverFailedForStorage = true;
    } else if (!message.includes("404") && !message.includes("לא נמצאה")) {
      throw error;
    }
  }

  const next = readLocalRentals().filter(
    (r) => String(r.id).trim() !== String(id).trim(),
  );
  writeLocalRentals(next);

  if (serverFailedForStorage) {
    // נמחקה מקומית – מספיק כשאין Blob
  }
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
