import { captureSnapshot } from "../../state/transform-store";
import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { publishRecipe } from "./recipes-api";
import { remixParentSignal } from "./remix-parent-store";

const CANVAS_ID = "transformation-output-canvas";
const THUMB_MAX_EDGE = 480;
const THUMB_QUALITY = 0.7;
const PUBLISH_NOTICE = `Publishing shares your settings and a small preview of your edited image, up to ${THUMB_MAX_EDGE}px, in the public community gallery. Only publish images you are happy for anyone to see.`;

const captureThumbnail = (): string | undefined => {
  const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!canvas || canvas.width === 0 || canvas.height === 0) return undefined;
  const scale = Math.min(1, THUMB_MAX_EDGE / Math.max(canvas.width, canvas.height));
  const off = document.createElement("canvas");
  off.width = Math.round(canvas.width * scale);
  off.height = Math.round(canvas.height * scale);
  const ctx = off.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(canvas, 0, 0, off.width, off.height);
  return off.toDataURL("image/webp", THUMB_QUALITY);
};

const showResult = (title: string, message: string): void => {
  emitDialog({ type: "confirm", title, message, confirmLabel: "OK", onConfirm: () => undefined });
};

const handlePublishFailed = (error?: unknown): void => {
  if (error) console.error("recipe publish failed:", error);
  showResult("Couldn't publish", "Something went wrong on our side. Try again in a moment.");
};

const handlePublished = (result: { id: string } | null): void => {
  if (!result) {
    handlePublishFailed();
    return;
  }
  remixParentSignal.value = null;
  showResult("Published", "Your look is live in community recipes.");
};

export const publishCurrentLook = (): void => {
  emitDialog({
    type: "prompt",
    title: "Name this look",
    label: "A short name others will see in the gallery",
    notice: PUBLISH_NOTICE,
    placeholder: "For example, Newsprint noir",
    confirmLabel: "Publish",
    onSubmit: (value) => {
      const name = value.trim();
      if (!name) return;
      publishRecipe({
        name,
        authorName: userSignal.value?.name || undefined,
        thumbnail: captureThumbnail(),
        recipe: captureSnapshot(),
        parentId: remixParentSignal.value ?? undefined,
      })
        .then(handlePublished)
        .catch(handlePublishFailed);
    },
  });
};
