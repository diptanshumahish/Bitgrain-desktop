import type { VideoProject } from "../types";

const DB_NAME = "imgi-video-db";
const DB_VERSION = 1;
const PROJECTS_STORE = "projects";

async function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function persistProject(project: VideoProject): Promise<void> {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readwrite");
    const store = tx.objectStore(PROJECTS_STORE);
    const request = store.put(project);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllProjects(): Promise<VideoProject[]> {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readonly");
    const store = tx.objectStore(PROJECTS_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const projects = (request.result as VideoProject[]).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      );
      resolve(projects);
    };
  });
}

export async function removeProject(id: string): Promise<void> {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readwrite");
    const store = tx.objectStore(PROJECTS_STORE);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
