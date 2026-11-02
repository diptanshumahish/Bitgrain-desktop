import { useEffect, useRef } from "react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { svgMarkupToLayer } from "./parse-svg-markup";
import { canvasMeasurer, finalizeImportedLayer } from "./finalize-layers";
import { onSvgLayersImport, type SvgLayersRequest } from "./svg-import-events";

interface UseSvgImportInsertArgs {
  pages: TemplatePage[];
  activePageId: string;
  setLayersForPage: (pageId: string, updater: (prev: Layer[]) => Layer[]) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

const MAX_LISTED_REASONS = 3;

const notifySkipped = (skipped: string[]): void => {
  if (skipped.length === 0) return;
  const reasons = [...new Set(skipped)].slice(0, MAX_LISTED_REASONS).join(", ");
  const parts = skipped.length === 1 ? "1 part" : `${skipped.length} parts`;
  emitStatusToast({
    title: "Imported with a few gaps",
    detail: `${parts} could not become editable and were left out (${reasons}).`,
  });
};

const notifyUnreadable = (): void => {
  emitStatusToast({
    title: "We could not read that SVG",
    detail: "It may be damaged or empty. Try importing it as an image instead.",
  });
};

export const useSvgImportInsert = (args: UseSvgImportInsertArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => {
    const insert = async (request: SvgLayersRequest): Promise<void> => {
      const page = argsRef.current.pages.find((candidate) => candidate.id === argsRef.current.activePageId);
      if (!page) return;
      const result = svgMarkupToLayer(request.markup, page, canvasMeasurer, request.name);
      if (!result) {
        notifyUnreadable();
        return;
      }
      const layer = await finalizeImportedLayer(result.layer, page.width);
      const current = argsRef.current;
      current.pushHistory();
      current.setLayersForPage(page.id, (prev) => [...prev, layer]);
      current.setSelectedIds([layer.id]);
      trackEvent("studio", "svg_imported", { details: { skipped: result.skipped.length } });
      notifySkipped(result.skipped);
    };
    return onSvgLayersImport((request) => void insert(request));
  }, []);
};
