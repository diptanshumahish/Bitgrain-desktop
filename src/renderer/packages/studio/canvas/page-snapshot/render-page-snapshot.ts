import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { pageRenderTemplate } from "./page-render-template";
import { withLookPreviews } from "./look-preview-layers";
import { SNAPSHOT_MAX_EDGE_PX, SNAPSHOT_ZOOM_THRESHOLD } from "./snapshot-limits";

const SNAPSHOT_MIME = "image/webp";
const SNAPSHOT_QUALITY = 0.92;
const FULL_SCALE = 1;

const snapshotScale = (page: TemplatePage): number => {
  const pixelRatio = window.devicePixelRatio || FULL_SCALE;
  const wanted = Math.min(FULL_SCALE, SNAPSHOT_ZOOM_THRESHOLD * pixelRatio);
  return Math.min(wanted, SNAPSHOT_MAX_EDGE_PX / Math.max(page.width, page.height));
};

const canvasToUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("snapshot encode failed"))),
      SNAPSHOT_MIME,
      SNAPSHOT_QUALITY,
    );
  });

export const renderPageSnapshot = async (page: TemplatePage): Promise<string> => {
  const { renderToCanvas } = await import("@bitgrain/studio-core/render/render-canvas");
  const scale = snapshotScale(page);
  const width = Math.max(1, Math.round(page.width * scale));
  const height = Math.max(1, Math.round(page.height * scale));
  const pageImage = page.image ?? null;
  const preview = await withLookPreviews(page.layers, pageImage, scale);
  try {
    const canvas = await renderToCanvas(pageRenderTemplate(page), page.background, preview.layers, pageImage, width, height);
    return await canvasToUrl(canvas);
  } finally {
    preview.release();
  }
};
