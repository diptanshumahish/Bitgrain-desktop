import { captureSnapshot } from "../../store/transform-store";
import { emitModal } from "../../lib/event-bus";
import { userSignal } from "../../hooks/useAuth";
import { publishRecipe } from "./recipes-api";

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
  emitModal({ type: "confirm", title, message, confirmLabel: "ok", onConfirm: () => undefined });
};

export const publishCurrentLook = (): void => {
  emitModal({
    type: "prompt",
    title: "name this look",
    label: "a short name others will see in the gallery",
    notice: PUBLISH_NOTICE,
    placeholder: "e.g. newsprint noir",
    confirmLabel: "publish",
    onSubmit: (value) => {
      const name = value.trim();
      if (!name) return;
      const snap = captureSnapshot();
      publishRecipe({
        name,
        authorName: userSignal.value?.name || undefined,
        thumbnail: captureThumbnail(),
        recipe: {
          modes: snap.modes,
          ditherMethod: snap.ditherMethod,
          ditherFactor: snap.ditherFactor,
          resolution: snap.resolution,
          contrast: snap.contrast,
          brightness: snap.brightness,
          saturation: snap.saturation,
          grain: snap.grain,
          hue: snap.hue,
          isColor: snap.isColor,
          paletteId: snap.palette?.id ?? null,
        },
      })
        .then(() => showResult("published", "your look is live in community recipes."))
        .catch(() => showResult("couldn't publish", "something went wrong, try again."));
    },
  });
};
