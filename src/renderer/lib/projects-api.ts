import { callApi } from "./api-client";

export interface ServerProject {
  id: string;
  kind: "image" | "video";
  name: string;
  data: unknown;
  thumbnail?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ServerProjectSummary {
  id: string;
  kind: "image" | "video";
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

export async function createProject(project: Partial<ServerProject>): Promise<ServerProject | null> {
  return await callApi<ServerProject>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
}

export async function updateProject(id: string, project: Partial<ServerProject>): Promise<boolean> {
  const result = await callApi<{ ok: boolean }>(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  return result?.ok ?? false;
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await callApi<{ ok: boolean }>(`/api/projects/${id}`, {
    method: "DELETE",
  });
  return result?.ok ?? false;
}

export async function getProject(id: string): Promise<ServerProject | null> {
  return await callApi<ServerProject>(`/api/projects/${id}`);
}
