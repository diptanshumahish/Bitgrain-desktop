import { signal } from "../lib/signal";
import { getAllWorks, persistWork, removeWork, getWork as getLocalWork } from "../utils/works-persist";
import type { Work } from "../types/work";
import { userSignal } from "../hooks/useAuth";
import * as ProjectsAPI from "../lib/projects-api";
import type { ServerProject, ServerProjectSummary } from "../lib/projects-api";
import { resolveAssetUrl } from "../lib/api-client";
import { saveToCloud } from "../lib/save-to-cloud";

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

export async function saveWork(work: Work): Promise<void> {
  const savedToCloud = await saveToCloud(workToCloud(work));
  if (!savedToCloud) {
    await persistWork(work);
  }

  const next = worksSignal.value.filter((w) => w.id !== work.id);
  next.unshift(work);
  worksSignal.value = next;
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

export async function getWorkById(id: string): Promise<Work | null> {
  const user = userSignal.value;
  if (user) {
    const cloud = await ProjectsAPI.getProject(id);
    if (cloud) return cloudToWork(cloud);
  }
  return await getLocalWork(id);
}

export async function deleteWork(id: string): Promise<void> {
  const user = userSignal.value;
  if (user) {
    await ProjectsAPI.deleteProject(id);
  }
  await removeWork(id);
  worksSignal.value = worksSignal.value.filter((w) => w.id !== id);
}
