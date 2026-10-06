const DB_NAME = "imgi-video-media-db";
const DB_VERSION = 1;
const BLOBS_STORE = "blobs";

async function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE);
      }
    };
  });
}

export async function putMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS_STORE, "readwrite");
    const store = tx.objectStore(BLOBS_STORE);
    const request = store.put(blob, id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS_STORE, "readonly");
    const store = tx.objectStore(BLOBS_STORE);
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
  });
}

