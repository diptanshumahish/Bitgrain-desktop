import { signal } from "../../../lib/signal";
import {
  getAllProjects,
  persistProject,
  removeProject,
} from "../utils/project-persist";
import type { VideoProject, VideoProjectMeta } from "../types";
import { userSignal } from "../../../hooks/useAuth";
import * as ProjectsAPI from "../../../lib/projects-api";
import type { ServerProject, ServerProjectSummary } from "../../../lib/projects-api";
import { resolveAssetUrl } from "../../../lib/api-client";
import { saveToCloud } from "../../../lib/save-to-cloud";

const DEFAULT_VIDEO_DIMENSION = 1;
const DEFAULT_VIDEO_FPS = 30;
const DEFAULT_VIDEO_DURATION = 0;

export const videoProjectsSignal = signal<VideoProjectMeta[]>([]);
export const videoProjectsLoadingSignal = signal(false);

function toMeta(project: VideoProject): VideoProjectMeta {
  return {
    id: project.id,
    name: project.name,
    thumbnail: project.thumbnail,
    width: project.width,
    height: project.height,
    fps: project.fps,
    duration: project.duration,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function projectToCloud(project: VideoProject) {
  const { id, name, thumbnail, ...data } = project;
  return {
    id,
    kind: "video" as const,
    name,
    thumbnail: thumbnail || undefined,
    data,
  };
}

function cloudToProject(cloud: ServerProject): VideoProject {
  const data = (cloud.data && typeof cloud.data === "object" ? cloud.data : {}) as Partial<VideoProject>;
  return {
    ...data,
    id: cloud.id,
    name: cloud.name,
    thumbnail: resolveAssetUrl(cloud.thumbnail),
    updatedAt: new Date(cloud.updatedAt).getTime(),
    createdAt: new Date(cloud.createdAt).getTime(),
  } as VideoProject;
}

function summaryToMeta(summary: ServerProjectSummary): VideoProjectMeta {
  const updatedAt = new Date(summary.updatedAt).getTime();
  return {
    id: summary.id,
    name: summary.name,
    thumbnail: resolveAssetUrl(summary.thumbnail),
    width: summary.width || DEFAULT_VIDEO_DIMENSION,
    height: summary.height || DEFAULT_VIDEO_DIMENSION,
    fps: summary.fps || DEFAULT_VIDEO_FPS,
    duration: summary.duration ?? DEFAULT_VIDEO_DURATION,
    createdAt: updatedAt,
    updatedAt,
  };
}

export async function applyVideoSummaries(summaries: ServerProjectSummary[]): Promise<void> {
  const localProjects = await getAllProjects();
  const cloudIds = new Set(summaries.map((summary) => summary.id));
  videoProjectsSignal.value = [
    ...summaries.map(summaryToMeta),
    ...localProjects.filter((project) => !cloudIds.has(project.id)).map(toMeta),
  ];
}

export async function loadVideoProjects(): Promise<void> {
  videoProjectsLoadingSignal.value = true;
  const user = userSignal.value;

  if (user) {
    await applyVideoSummaries(await ProjectsAPI.listProjects("video"));
  } else {
    const projects = await getAllProjects();
    videoProjectsSignal.value = projects.map(toMeta);
  }

  videoProjectsLoadingSignal.value = false;
}

export async function saveVideoProject(project: VideoProject): Promise<void> {
  const savedToCloud = await saveToCloud(projectToCloud(project));
  if (!savedToCloud) {
    await persistProject(project);
  }

  const next = videoProjectsSignal.value.filter((p) => p.id !== project.id);
  next.unshift(toMeta(project));
  videoProjectsSignal.value = next;
}

export async function getVideoProjectById(id: string): Promise<VideoProject | null> {
  const user = userSignal.value;
  if (user) {
    const cloud = await ProjectsAPI.getProject(id);
    if (cloud) return cloudToProject(cloud);
  }
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function deleteVideoProject(id: string): Promise<void> {
  const user = userSignal.value;
  if (user) {
    await ProjectsAPI.deleteProject(id);
  }
  await removeProject(id);
  videoProjectsSignal.value = videoProjectsSignal.value.filter(
    (p) => p.id !== id,
  );
}
