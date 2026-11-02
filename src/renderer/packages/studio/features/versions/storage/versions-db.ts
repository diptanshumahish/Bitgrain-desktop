import type { ProjectVersion } from "../version-types";

const DB_NAME = "imgi-versions-db";
const DB_VERSION = 1;
const STORE_NAME = "versions";
const PROJECT_INDEX = "by-project";

const openVersionsDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) return;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex(PROJECT_INDEX, "projectKey");
    };
  });

const runRequest = async <T>(
  mode: IDBTransactionMode,
  buildRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openVersionsDB();
  return new Promise((resolve, reject) => {
    const request = buildRequest(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export async function putLocalVersion(version: ProjectVersion): Promise<void> {
  await runRequest("readwrite", (store) => store.put(version));
}

export async function getLocalVersion(id: string): Promise<ProjectVersion | null> {
  const found = await runRequest<ProjectVersion | undefined>("readonly", (store) => store.get(id));
  return found ?? null;
}

export async function listLocalVersions(projectKey: string): Promise<ProjectVersion[]> {
  const all = await runRequest<ProjectVersion[]>("readonly", (store) =>
    store.index(PROJECT_INDEX).getAll(projectKey),
  );
  return [...all].sort((left, right) => right.createdAt - left.createdAt);
}

export async function deleteLocalVersion(id: string): Promise<void> {
  await runRequest("readwrite", (store) => store.delete(id));
}
