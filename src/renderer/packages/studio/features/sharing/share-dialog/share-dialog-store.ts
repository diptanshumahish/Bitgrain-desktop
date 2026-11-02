import { signal } from "@bitgrain/core/signal";
import type { ShareLink, ShareSettings } from "../api/share-types";

type ShareDialogStatus = "loading" | "local" | "ready" | "error";

const DEFAULT_SHARE_SETTINGS: ShareSettings = { access: "view", allowDownload: false, expiresAt: null };

export const shareStatusSignal = signal<ShareDialogStatus>("loading");
export const shareLinkSignal = signal<ShareLink | null>(null);
export const shareDraftSignal = signal<ShareSettings>(DEFAULT_SHARE_SETTINGS);
export const shareBusySignal = signal<boolean>(false);
export const shareErrorSignal = signal<string | null>(null);
export const shareNeedsProSignal = signal<boolean>(false);

export const resetShareDialog = (): void => {
  shareStatusSignal.value = "loading";
  shareLinkSignal.value = null;
  shareDraftSignal.value = DEFAULT_SHARE_SETTINGS;
  shareBusySignal.value = false;
  shareErrorSignal.value = null;
  shareNeedsProSignal.value = false;
};

export const settingsOf = (link: ShareLink | null, draft: ShareSettings): ShareSettings =>
  link ? { access: link.access, allowDownload: link.allowDownload, expiresAt: link.expiresAt } : draft;
