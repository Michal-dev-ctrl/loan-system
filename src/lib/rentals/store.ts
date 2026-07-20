import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type { SavedRental } from "./types";

const BLOB_PATH = "loan-system/rentals.json";

type StoreBackend = "blob" | "file";

type GlobalRentalsCache = {
  rentals: SavedRental[] | null;
};

function getMemoryCache(): GlobalRentalsCache {
  const g = globalThis as typeof globalThis & {
    __loanRentalsCache?: GlobalRentalsCache;
  };
  if (!g.__loanRentalsCache) {
    g.__loanRentalsCache = { rentals: null };
  }
  return g.__loanRentalsCache;
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBackend(): StoreBackend {
  return hasBlobToken() ? "blob" : "file";
}

/** ב־Vercel מערכת הקבצים לקריאה בלבד – שומרים ב־/tmp */
function getFilePath(): string {
  if (isVercelRuntime()) {
    return path.join("/tmp", "loan-system-rentals.json");
  }
  return path.join(process.cwd(), "data", "rentals.json");
}

async function readFromBlob(): Promise<SavedRental[]> {
  try {
    const result = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!result || result.statusCode === 304 || !result.stream) {
      return [];
    }
    const text = await new Response(result.stream).text();
    if (!text.trim()) return [];
    const parsed = JSON.parse(text) as SavedRental[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "BlobNotFoundError" ||
        error.message.toLowerCase().includes("not found"))
    ) {
      return [];
    }
    throw error;
  }
}

async function writeToBlob(rentals: SavedRental[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(rentals, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function readFromFile(): Promise<SavedRental[]> {
  const cache = getMemoryCache();
  if (cache.rentals) {
    return cache.rentals;
  }

  const filePath = getFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) {
      cache.rentals = [];
      return [];
    }
    const parsed = JSON.parse(raw) as SavedRental[];
    const rentals = Array.isArray(parsed) ? parsed : [];
    cache.rentals = rentals;
    return rentals;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      cache.rentals = [];
      return [];
    }
    throw error;
  }
}

async function writeToFile(rentals: SavedRental[]): Promise<void> {
  const filePath = getFilePath();
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(rentals, null, 2), "utf8");
  await fs.rename(tmpPath, filePath);
  getMemoryCache().rentals = rentals;
}

export async function listRentals(): Promise<SavedRental[]> {
  const rentals =
    getBackend() === "blob" ? await readFromBlob() : await readFromFile();
  if (getBackend() === "blob") {
    getMemoryCache().rentals = rentals;
  }
  return [...rentals].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) {
      return db - da;
    }
    return Number(b.id) - Number(a.id);
  });
}

export async function getRentalById(id: string): Promise<SavedRental | null> {
  const normalized = id.trim();
  const numericId = parseInt(normalized, 10);
  const rentals = await listRentals();
  return (
    rentals.find((r) => String(r.id).trim() === normalized) ||
    (Number.isNaN(numericId)
      ? null
      : rentals.find(
          (r) =>
            !Number.isNaN(parseInt(String(r.id), 10)) &&
            parseInt(String(r.id), 10) === numericId,
        ) || null)
  );
}

function nextRentalId(rentals: SavedRental[]): string {
  const maxId = rentals.reduce((max, rental) => {
    const num = parseInt(String(rental.id), 10);
    return !Number.isNaN(num) && num > max ? num : max;
  }, 0);
  return String(maxId + 1);
}

async function saveAll(rentals: SavedRental[]): Promise<void> {
  if (getBackend() === "blob") {
    await writeToBlob(rentals);
    getMemoryCache().rentals = rentals;
    return;
  }

  try {
    await writeToFile(rentals);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    // אם עדיין EROFS – לפחות שומרים בזיכרון של השרת החם
    if (err.code === "EROFS" || err.code === "EACCES") {
      getMemoryCache().rentals = rentals;
      if (isVercelRuntime() && !hasBlobToken()) {
        throw new Error(
          'השמירה בענן דורשת Vercel Blob. ב־Vercel: Storage → Create → Blob Store → חברי לפרויקט loan-system-gmach-or, ואז Redeploy.',
        );
      }
      throw new Error("לא ניתן לשמור לקובץ בשרת. נסי שוב או בדקי הרשאות.");
    }
    throw error;
  }
}

export async function createRental(
  input: Omit<SavedRental, "id" | "createdAt"> & { id?: string },
): Promise<SavedRental> {
  assertWritableOrExplain();
  const rentals = await listRentals();
  const id = input.id?.trim() || nextRentalId(rentals);

  if (rentals.some((r) => String(r.id).trim() === id)) {
    throw new Error(`Rental id ${id} already exists`);
  }

  const rental: SavedRental = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  rentals.push(rental);
  await saveAll(rentals);
  return rental;
}

export async function updateRental(
  id: string,
  patch: Partial<Omit<SavedRental, "id" | "createdAt">>,
): Promise<SavedRental | null> {
  assertWritableOrExplain();
  const rentals = await listRentals();
  const normalized = id.trim();
  const index = rentals.findIndex((r) => String(r.id).trim() === normalized);
  if (index < 0) return null;

  const updated: SavedRental = {
    ...rentals[index],
    ...patch,
    id: rentals[index].id,
    createdAt: rentals[index].createdAt,
  };
  rentals[index] = updated;
  await saveAll(rentals);
  return updated;
}

export async function deleteRental(id: string): Promise<boolean> {
  assertWritableOrExplain();
  const rentals = await listRentals();
  const normalized = id.trim();
  const next = rentals.filter((r) => String(r.id).trim() !== normalized);
  if (next.length === rentals.length) return false;
  await saveAll(next);
  return true;
}

export async function upsertMany(incoming: SavedRental[]): Promise<{
  imported: number;
  skipped: number;
}> {
  assertWritableOrExplain();
  const rentals = await listRentals();
  const byId = new Map(rentals.map((r) => [String(r.id).trim(), r]));
  let imported = 0;
  let skipped = 0;

  for (const rental of incoming) {
    const id = String(rental.id).trim();
    if (!id) {
      skipped += 1;
      continue;
    }
    if (byId.has(id)) {
      skipped += 1;
      continue;
    }
    byId.set(id, { ...rental, id });
    imported += 1;
  }

  await saveAll(Array.from(byId.values()));
  return { imported, skipped };
}

function assertWritableOrExplain(): void {
  if (isVercelRuntime() && !hasBlobToken()) {
    throw new Error(
      "כדי לשמור הזמנות בענן צריך לחבר Vercel Blob פעם אחת: באתר vercel.com פתחי את הפרויקט loan-system-gmach-or → Storage → Create → Blob Store → Connect to project → ואז Redeploy. אחר כך השמירה תעבוד בין כל המחשבים.",
    );
  }
}

export function getStoreInfo(): {
  backend: StoreBackend;
  durable: boolean;
  needsBlobSetup: boolean;
} {
  const backend = getBackend();
  const needsBlobSetup = isVercelRuntime() && !hasBlobToken();
  return {
    backend,
    durable: backend === "blob" || !isVercelRuntime(),
    needsBlobSetup,
  };
}
