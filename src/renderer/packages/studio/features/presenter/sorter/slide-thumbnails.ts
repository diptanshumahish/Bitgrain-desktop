import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { signal } from "@bitgrain/core/signal";
import { renderExportPreview } from "../../../panels/export-popup/render-export-preview";

type ThumbnailState = { status: "ready"; src: string } | { status: "failed" } | { status: "pending" };

const thumbnails = new WeakMap<TemplatePage, ThumbnailState>();
let renderQueue: Promise<void> = Promise.resolve();

export const thumbnailVersionSignal = signal<number>(0);

const renderThumbnail = async (template: TemplateDef, page: TemplatePage): Promise<void> => {
  try {
    thumbnails.set(page, { status: "ready", src: await renderExportPreview(template, page) });
  } catch {
    thumbnails.set(page, { status: "failed" });
  }
  thumbnailVersionSignal.value += 1;
};

export const requestThumbnail = (template: TemplateDef, page: TemplatePage): void => {
  if (thumbnails.has(page)) return;
  thumbnails.set(page, { status: "pending" });
  renderQueue = renderQueue.then(() => renderThumbnail(template, page));
};

export const readThumbnail = (page: TemplatePage): ThumbnailState =>
  thumbnails.get(page) ?? { status: "pending" };
