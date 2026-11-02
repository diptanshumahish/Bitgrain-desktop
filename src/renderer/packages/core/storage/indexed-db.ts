const DB_NAME = "imgi-db";
const STORE_NAME = "images";
const IMAGE_KEY = "current-image";

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

interface StoredImageBytes {
  buffer: ArrayBuffer;
  type: string;
}

const isStoredImageBytes = (value: unknown): value is StoredImageBytes =>
  typeof value === "object" && value !== null && (value as StoredImageBytes).buffer instanceof ArrayBuffer;

const toBlob = (value: unknown): Blob | null => {
  if (value instanceof Blob) return value;
  if (isStoredImageBytes(value)) return new Blob([value.buffer], { type: value.type });
  return null;
};

export async function saveImageToDB(blob: Blob): Promise<void> {
  const record: StoredImageBytes = { buffer: await blob.arrayBuffer(), type: blob.type };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record, IMAGE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadImageFromDB(): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(IMAGE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(toBlob(request.result));
  });
}

export async function clearImageFromDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(IMAGE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
