import type { BreachRecord } from "../engine/log";

/**
 * All data lives in this browser's IndexedDB. Nothing is sent anywhere.
 * Stores: "records" (the breach log) and "meta" (the in-progress draft).
 */

const DB_NAME = "breach-assessor";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function open(factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = factory.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("records")) db.createObjectStore("records", { keyPath: "id" });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listRecords(): Promise<BreachRecord[]> {
  const db = await open();
  const all = await request(db.transaction("records").objectStore("records").getAll() as IDBRequest<BreachRecord[]>);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function putRecord(rec: BreachRecord): Promise<void> {
  const db = await open();
  const tx = db.transaction("records", "readwrite");
  tx.objectStore("records").put(rec);
  await done(tx);
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await open();
  const tx = db.transaction("records", "readwrite");
  tx.objectStore("records").delete(id);
  await done(tx);
}

/** Restores a backup. "replace" clears the log first; "merge" keeps existing records and overwrites any with the same ID. */
export async function restoreRecords(records: BreachRecord[], mode: "replace" | "merge"): Promise<void> {
  const db = await open();
  const tx = db.transaction("records", "readwrite");
  const store = tx.objectStore("records");
  if (mode === "replace") store.clear();
  for (const r of records) store.put(r);
  await done(tx);
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await open();
  return request(db.transaction("meta").objectStore("meta").get(key) as IDBRequest<T | undefined>);
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await open();
  const tx = db.transaction("meta", "readwrite");
  if (value === undefined) tx.objectStore("meta").delete(key);
  else tx.objectStore("meta").put(value, key);
  await done(tx);
}

/** Erases everything this app has stored in the browser. */
export async function eraseAll(): Promise<void> {
  const db = await open();
  const tx = db.transaction(["records", "meta"], "readwrite");
  tx.objectStore("records").clear();
  tx.objectStore("meta").clear();
  await done(tx);
}
