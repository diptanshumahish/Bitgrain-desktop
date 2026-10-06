import { currentProjectSignal } from "../store/project-store";
import { previewCanvasSignal } from "../store/preview-canvas-store";
import { persistProject } from "./project-persist";

const THUMB_MAX_WIDTH = 320;
const THUMB_QUALITY = 0.75;

function drawThumbnail(canvas: HTMLCanvasElement): string | null {
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return null;

  const scale = Math.min(1, THUMB_MAX_WIDTH / w);
  const tw = Math.max(1, Math.floor(w * scale));
  const th = Math.max(1, Math.floor(h * scale));

  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, tw, th);
  try {
    return out.toDataURL("image/jpeg", THUMB_QUALITY);
  } catch {
    return null;
  }
}

export async function captureAndPersistThumbnail(): Promise<void> {
  const project = currentProjectSignal.value;
  const canvas = previewCanvasSignal.value;
  if (!project || !canvas) return;
  const thumb = drawThumbnail(canvas);
  if (!thumb) return;
  if (thumb === project.thumbnail) return;
  const updated = { ...project, thumbnail: thumb, updatedAt: Date.now() };
  try {
    await persistProject(updated);
  } catch {
    // ignore, thumbnail is best-effort
  }
}
