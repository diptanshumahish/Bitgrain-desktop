import { callApi, callApiWithOutcome } from "@bitgrain/api/api-client";
import type { ApiOutcome } from "@bitgrain/api/api-outcome";
import { markAbsentFromCloud, markPresentInCloud } from "./cloud-usage/cloud-presence";

type ProjectKind = "image" | "video" | "apparel" | "albums" | "menus" | "qr";

export interface ServerProject {
  id: string;
  kind: ProjectKind;
  name: string;
  data: unknown;
  thumbnail?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ServerProjectSummary {
  id: string;
  kind: ProjectKind;
  name: string;
  thumbnail?: string;
  updatedAt: string;
  width?: number;
  height?: number;
  background?: string;
  fps?: number;
  duration?: number;
}

export async function listProjects(kind?: string): Promise<ServerProjectSummary[]> {
  const query = kind ? `?kind=${kind}` : "";
  const result = await callApi<ServerProjectSummary[]>(`/api/projects${query}`);
  return result ?? [];
}

export async function postProject(project: Partial<ServerProject>): Promise<ApiOutcome<ServerProject>> {
  return await callApiWithOutcome<ServerProject>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
}

export async function putProject(
  id: string,
  project: Partial<ServerProject>,
): Promise<ApiOutcome<{ ok: boolean }>> {
  return await callApiWithOutcome<{ ok: boolean }>(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  const outcome = await callApiWithOutcome<{ ok: boolean }>(`/api/projects/${id}`, {
    method: "DELETE",
  });
  return outcome.kind === "not_found" || (outcome.kind === "ok" && outcome.data.ok);
}

export async function fetchProject(id: string): Promise<ApiOutcome<ServerProject>> {
  const outcome = await callApiWithOutcome<ServerProject>(`/api/projects/${id}`);
  if (outcome.kind === "not_found") markAbsentFromCloud(id);
  if (outcome.kind === "ok") markPresentInCloud(id);
  return outcome;
}
