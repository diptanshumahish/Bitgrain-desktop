import type { JsonResult } from "@bitgrain/api/post-json";
import { requestJson } from "./share-request";
import type { ShareLinkPayload, ShareSettings, SharedProject } from "./share-types";

const sharePath = (projectId: string): string => `/api/projects/${encodeURIComponent(projectId)}/share`;

export async function fetchShareLink(projectId: string): Promise<JsonResult<ShareLinkPayload>> {
  return await requestJson<ShareLinkPayload>(sharePath(projectId));
}

export async function saveShareLink(projectId: string, settings: ShareSettings): Promise<JsonResult<ShareLinkPayload>> {
  return await requestJson<ShareLinkPayload>(sharePath(projectId), "PUT", settings);
}

export async function regenerateShareLink(
  projectId: string,
  settings: ShareSettings,
): Promise<JsonResult<ShareLinkPayload>> {
  return await requestJson<ShareLinkPayload>(`${sharePath(projectId)}/regenerate`, "POST", settings);
}

export async function revokeShareLink(projectId: string): Promise<JsonResult<ShareLinkPayload>> {
  return await requestJson<ShareLinkPayload>(sharePath(projectId), "DELETE");
}

export async function fetchSharedProject(token: string): Promise<JsonResult<SharedProject>> {
  return await requestJson<SharedProject>(`/api/shared/${encodeURIComponent(token)}`);
}

export const buildShareUrl = (token: string): string => `${window.location.origin}/s/${token}`;
