import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type { SavedRental } from "./types";

const BLOB_PATH = "loan-system/rentals.json";
const FILE_PATH = path.join(process.cwd(), "data", "rentals.json");

type StoreBackend = "blob" | "file";

function getBackend(): StoreBackend {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "file";
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
    // Blob עדיין לא קיים / ריק – מתחילים מרשימה ריקה
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

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
}

async function readFromFile(): Promise<SavedRental[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw) as SavedRental[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return [];
    throw error;
  }
}

async function writeToFile(rentals: SavedRental[]): Promise<void> {
  await ensureDataDir();
  const tmpPath = `${FILE_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(rentals, null, 2), "utf8");
  await fs.rename(tmpPath, FILE_PATH);
}

export async function listRentals(): Promise<SavedRental[]> {
  const rentals =
    getBackend() === "blob" ? await readFromBlob() : await readFromFile();
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
  } else {
    await writeToFile(rentals);
  }
}

export async function createRental(
  input: Omit<SavedRental, "id" | "createdAt"> & { id?: string },
): Promise<SavedRental> {
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

export function getStoreInfo(): { backend: StoreBackend; durable: boolean } {
  const backend = getBackend();
  return {
    backend,
    // File storage is durable on a persistent Node host; Blob is durable on Vercel.
    durable: backend === "blob" || process.env.VERCEL !== "1",
  };
}
