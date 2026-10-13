import { signal } from "../lib/signal";
import { getAllWorks, persistWork, removeWork, getWork as getLocalWork } from "../utils/works-persist";
import type { Work } from "../types/work";
import { isReturningUser, userSignal } from "../hooks/useAuth";
import { waitForAuthSettled } from "../lib/api/wait-for-auth";
import * as ProjectsAPI from "../lib/projects-api";
import type { ServerProject, ServerProjectSummary } from "../lib/projects-api";
import { backendEnabled, resolveAssetUrl } from "../lib/api-client";
import { syncToCloud, type CloudSyncOutcome } from "../lib/save-to-cloud";

const DEFAULT_CANVAS_SIZE = 1;
const DEFAULT_BACKGROUND = "#ffffff";

export const worksSignal = signal<Work[]>([]);
export const worksLoadingSignal = signal(false);

function workToCloud(work: Work) {
  const { id, name, thumbnail, ...data } = work;
  return {
    id,
    kind: "image" as const,
    name,
    thumbnail: thumbnail || undefined,
    data,
  };
}

function cloudToWork(cloud: ServerProject): Work {
  const data = (cloud.data && typeof cloud.data === "object" ? cloud.data : {}) as Partial<Work>;
  return {
    ...data,
    id: cloud.id,
    name: cloud.name,
    thumbnail: resolveAssetUrl(cloud.thumbnail),
    updatedAt: new Date(cloud.updatedAt).getTime(),
    createdAt: new Date(cloud.createdAt).getTime(),
  } as Work;
}

function summaryToWork(summary: ServerProjectSummary): Work {
  const updatedAt = new Date(summary.updatedAt).getTime();
  return {
    id: summary.id,
    name: summary.name,
    thumbnail: resolveAssetUrl(summary.thumbnail),
    background: summary.background || DEFAULT_BACKGROUND,
    canvasW: summary.width || DEFAULT_CANVAS_SIZE,
    canvasH: summary.height || DEFAULT_CANVAS_SIZE,
    layers: [],
    image: null,
    createdAt: updatedAt,
    updatedAt,
  };
}

export async function applyImageSummaries(summaries: ServerProjectSummary[]): Promise<void> {
  const localWorks = await getAllWorks();
  const cloudIds = new Set(summaries.map((summary) => summary.id));
  worksSignal.value = [
    ...summaries.map(summaryToWork),
    ...localWorks.filter((work) => !cloudIds.has(work.id)),
  ];
}

export async function loadWorks(): Promise<void> {
  worksLoadingSignal.value = true;
  const user = userSignal.value;

  if (user) {
    await applyImageSummaries(await ProjectsAPI.listProjects("image"));
  } else {
    worksSignal.value = await getAllWorks();
  }

  worksLoadingSignal.value = false;
}

export async function saveWork(work: Work): Promise<CloudSyncOutcome> {
  const outcome = await syncToCloud(workToCloud(work));
  if (outcome !== "saved") {
    await persistWork(work);
  }

  worksSignal.value = [work, ...worksSignal.value.filter((existing) => existing.id !== work.id)];
  return outcome;
}

export async function duplicateWork(id: string, newName: string): Promise<string | null> {
  const source = await getWorkById(id);
  if (!source) return null;

  const cloned = structuredClone(source);
  const now = Date.now();
  cloned.id = crypto.randomUUID();
  cloned.name = newName;
  cloned.createdAt = now;
  cloned.updatedAt = now;

  await saveWork(cloned);
  return cloned.id;
}

async function getWorkById(id: string): Promise<Work | null> {
  const result = await loadWorkById(id);
  return result.kind === "found" ? result.work : null;
}

export type WorkLoadResult =
  | { kind: "found"; work: Work }
  | { kind: "missing" }
  | { kind: "failed" };

const loadLocalWorkResult = async (id: string): Promise<WorkLoadResult> => {
  const local = await getLocalWork(id);
  return local ? { kind: "found", work: local } : { kind: "missing" };
};

export async function loadWorkById(id: string): Promise<WorkLoadResult> {
  await waitForAuthSettled();
  if (!userSignal.value && backendEnabled && isReturningUser()) return { kind: "failed" };
  if (!userSignal.value) return await loadLocalWorkResult(id);
  const cloud = await ProjectsAPI.fetchProject(id);
  if (cloud.kind === "ok") return { kind: "found", work: cloudToWork(cloud.data) };
  if (cloud.kind === "failed") return { kind: "failed" };
  return await loadLocalWorkResult(id);
}

export async function deleteWork(id: string): Promise<void> {
  const user = userSignal.value;
  if (user) {
    await ProjectsAPI.deleteProject(id);
  }
  await removeWork(id);
  worksSignal.value = worksSignal.value.filter((w) => w.id !== id);
}

const renameLocalWork = async (id: string, name: string): Promise<boolean> => {
  const local = await getLocalWork(id);
  if (!local) return false;
  await persistWork({ ...local, name, updatedAt: Date.now() });
  return true;
};

const renameCloudWork = async (id: string, name: string): Promise<boolean> => {
  const outcome = await ProjectsAPI.putProject(id, { name });
  if (outcome.kind === "not_found") return await renameLocalWork(id, name);
  return outcome.kind === "ok";
};

export async function renameWork(id: string, name: string): Promise<boolean> {
  const renamed = userSignal.value ? await renameCloudWork(id, name) : await renameLocalWork(id, name);
  if (renamed) {
    worksSignal.value = worksSignal.value.map((work) => (work.id === id ? { ...work, name } : work));
  }
  return renamed;
}
