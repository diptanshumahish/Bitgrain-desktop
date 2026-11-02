import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitPageAidsUpdate, type PageAidsPatch } from "../../state/canvas-aids/page-aids-event";

export function emitAidsToPages(
  pages: TemplatePage[],
  makePatch: (page: TemplatePage) => PageAidsPatch | null,
  recordHistory = true,
): void {
  const updates = pages.flatMap((page) => {
    const patch = makePatch(page);
    return patch ? [{ pageId: page.id, patch }] : [];
  });
  updates.forEach((update, index) => emitPageAidsUpdate({ ...update, recordHistory: recordHistory && index === 0 }));
}
