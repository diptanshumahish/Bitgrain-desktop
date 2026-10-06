const DB_NAME = "imgi-studio-db";
const STORE_NAME = "autosave";
const AUTOSAVE_KEY = "current";

export interface StudioAutosavePage {
  id: string;
  name: string;
  layers: unknown[];
  background: string;
  backgroundVar?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  image?: string | null;
  clip?: boolean;
  animation?: import("../data/animation-types").PageAnimation;
}

export interface StudioAutosave {
  layers: unknown[];
  background: string;
  canvasW: number;
  canvasH: number;
  image: string | null;
  pages?: StudioAutosavePage[];
  activePageId?: string;
  timestamp: number;
}

async function openStudioDB(): Promise<IDBDatabase> {
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

export async function saveStudioAutosave(state: StudioAutosave): Promise<void> {
  const db = await openStudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, AUTOSAVE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadStudioAutosave(): Promise<StudioAutosave | null> {
  const db = await openStudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(AUTOSAVE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

export async function clearStudioAutosave(): Promise<void> {
  const db = await openStudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(AUTOSAVE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
