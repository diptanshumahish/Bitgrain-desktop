import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { captureSnapshot } from "../../../state/transform-store";
import { encodeRecipeUrl } from "../../../share/recipe-url";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { renderShareFile, type ShareRenderOptions } from "./render-share-file";
import type { ExportOutcome } from "@bitgrain/platform/billing/export-pack/export-grant";

const SHARE_TITLE = "made with bitgrain";
const SHARE_TEXT = "open this look on your own photo";

const canShareFile = (file: File): boolean =>
  typeof navigator.share === "function" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [file] });

const isShareCancel = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const shareNatively = async (file: File, recipeUrl: string): Promise<void> => {
  await navigator.share({ files: [file], title: SHARE_TITLE, text: SHARE_TEXT, url: recipeUrl });
  trackEvent("home", "output_shared", { details: { method: "native" } });
};

const isActivationExpired = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "NotAllowedError";

const copyLink = async (recipeUrl: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(recipeUrl);
    return true;
  } catch (error) {
    trackEvent("home", "output_share_link_copy_failed", {
      details: { message: error instanceof Error ? error.message : "unknown" },
    });
    return false;
  }
};

const saveAndCopyLink = async (file: File, recipeUrl: string): Promise<void> => {
  downloadBlob(file, file.name);
  const copied = await copyLink(recipeUrl);
  emitStatusToast(
    copied
      ? { title: "image saved, link copied", detail: "paste the link anywhere, it opens this exact look" }
      : { title: "image saved", detail: "use copy recipe link to share this exact look" },
  );
  trackEvent("home", "output_shared", { details: { method: "download_and_link", copied } });
};

const shareOrFallBack = async (file: File, recipeUrl: string): Promise<void> => {
  try {
    await shareNatively(file, recipeUrl);
  } catch (error) {
    if (!isActivationExpired(error)) throw error;
    await saveAndCopyLink(file, recipeUrl);
  }
};

const reportShareFailure = (error: unknown): void => {
  trackEvent("home", "output_share_failed", {
    details: { message: error instanceof Error ? error.message : "unknown" },
  });
  emitStatusToast({ title: "couldn't share this one", detail: "try downloading it instead" });
};

export const shareCurrentOutput = async (options: ShareRenderOptions): Promise<ExportOutcome> => {
  try {
    const file = await renderShareFile(options);
    if (!file) {
      emitStatusToast({ title: "nothing to share yet", detail: "add an image first" });
      return "failed";
    }
    const recipeUrl = encodeRecipeUrl(captureSnapshot());
    if (canShareFile(file)) {
      await shareOrFallBack(file, recipeUrl);
      return "done";
    }
    await saveAndCopyLink(file, recipeUrl);
    return "done";
  } catch (error) {
    if (isShareCancel(error)) return "cancelled";
    reportShareFailure(error);
    return "failed";
  }
};
