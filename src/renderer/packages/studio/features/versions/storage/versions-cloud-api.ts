import { callApiWithOutcome } from "@bitgrain/api/api-client";
import type { ApiOutcome } from "@bitgrain/api/api-outcome";
import type { ProjectVersion, VersionSnapshot } from "../version-types";

const VERSION_UPLOAD_TIMEOUT_MS = 60000;

export interface CloudVersionSummary {
  id: string;
  name: string;
  auto: boolean;
  thumbnail?: string;
  createdAt: string;
}

interface CloudVersion extends CloudVersionSummary {
  data: VersionSnapshot;
}

const versionsPath = (projectId: string): string => `/api/projects/${projectId}/versions`;

const jsonRequest = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function fetchCloudVersions(projectId: string): Promise<ApiOutcome<CloudVersionSummary[]>> {
  return await callApiWithOutcome<CloudVersionSummary[]>(versionsPath(projectId));
}

export async function fetchCloudVersion(projectId: string, versionId: string): Promise<ApiOutcome<CloudVersion>> {
  return await callApiWithOutcome<CloudVersion>(`${versionsPath(projectId)}/${versionId}`);
}

export async function uploadCloudVersion(version: ProjectVersion): Promise<ApiOutcome<{ id: string }>> {
  const body = {
    id: version.id,
    name: version.name,
    auto: version.auto,
    data: version.snapshot,
    thumbnail: version.thumbnail ?? "",
    createdAt: new Date(version.createdAt).toISOString(),
  };
  return await callApiWithOutcome<{ id: string }>(
    versionsPath(version.projectKey),
    jsonRequest("POST", body),
    VERSION_UPLOAD_TIMEOUT_MS,
  );
}

export async function renameCloudVersion(version: ProjectVersion, name: string): Promise<ApiOutcome<{ ok: boolean }>> {
  return await callApiWithOutcome<{ ok: boolean }>(
    `${versionsPath(version.projectKey)}/${version.id}`,
    jsonRequest("PATCH", { name }),
  );
}

export async function deleteCloudVersion(version: ProjectVersion): Promise<ApiOutcome<{ ok: boolean }>> {
  return await callApiWithOutcome<{ ok: boolean }>(`${versionsPath(version.projectKey)}/${version.id}`, {
    method: "DELETE",
  });
}
