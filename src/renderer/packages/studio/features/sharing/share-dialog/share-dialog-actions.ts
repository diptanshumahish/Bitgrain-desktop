import type { JsonResult } from "@bitgrain/api/post-json";
import { fetchShareLink, regenerateShareLink, revokeShareLink, saveShareLink } from "../api/share-links-api";
import type { ShareLinkPayload, ShareSettings } from "../api/share-types";
import {
  shareBusySignal,
  shareDraftSignal,
  shareErrorSignal,
  shareLinkSignal,
  shareStatusSignal,
} from "./share-dialog-store";

const NOT_FOUND_STATUS = 404;

export async function loadShareLink(projectId: string): Promise<void> {
  shareStatusSignal.value = "loading";
  const result = await fetchShareLink(projectId);
  if (result.status === NOT_FOUND_STATUS) {
    shareStatusSignal.value = "local";
    return;
  }
  if (!result.ok || !result.data) {
    shareErrorSignal.value = result.error;
    shareStatusSignal.value = "error";
    return;
  }
  shareLinkSignal.value = result.data.link;
  shareStatusSignal.value = "ready";
}

const runShareRequest = async (request: () => Promise<JsonResult<ShareLinkPayload>>): Promise<boolean> => {
  if (shareBusySignal.value) return false;
  shareBusySignal.value = true;
  const result = await request();
  shareBusySignal.value = false;
  if (!result.ok || !result.data) {
    shareErrorSignal.value = result.error;
    return false;
  }
  shareErrorSignal.value = null;
  shareLinkSignal.value = result.data.link;
  return true;
};

export async function applyShareSettings(projectId: string, settings: ShareSettings): Promise<boolean> {
  if (!shareLinkSignal.value) {
    shareDraftSignal.value = settings;
    return true;
  }
  return await runShareRequest(() => saveShareLink(projectId, settings));
}

export async function createShareLink(projectId: string): Promise<boolean> {
  return await runShareRequest(() => saveShareLink(projectId, shareDraftSignal.value));
}

export async function regenerateLink(projectId: string, settings: ShareSettings): Promise<boolean> {
  return await runShareRequest(() => regenerateShareLink(projectId, settings));
}

export async function turnOffLink(projectId: string): Promise<boolean> {
  const current = shareLinkSignal.value;
  const turnedOff = await runShareRequest(() => revokeShareLink(projectId));
  if (turnedOff && current) {
    shareDraftSignal.value = { access: current.access, allowDownload: current.allowDownload, expiresAt: null };
  }
  return turnedOff;
}
