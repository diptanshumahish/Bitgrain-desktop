import { useCallback, useRef, useState } from "react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { isShiftHeld } from "../../state/modifier-keys-store";
import { isAspectLocked } from "../../state/aspect-lock-store";
import type { SnapGuide, SnapRect } from "./snap-engine";
import { computeResizeSnap, resizedRect } from "./snap-resize";
import { pageAidLines } from "./snap-aid-lines";

const SCREEN_SNAP_THRESHOLD_PX = 6;
const MIN_ZOOM = 0.0001;

interface ResizeState {
  id: string;
  startRect: SnapRect;
  accumDx: number;
  accumDy: number;
  appliedX: number;
  appliedY: number;
}

interface UseResizeSnapArgs {
  pages: TemplatePage[];
  zoom: number;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
}

interface UseResizeSnapResult {
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  guidesByPage: Record<string, SnapGuide[]>;
}

const findTopLevelLayer = (pages: TemplatePage[], layerId: string): { page: TemplatePage; layer: Layer } | null => {
  for (const page of pages) {
    const layer = page.layers.find((entry) => entry.id === layerId);
    if (layer) return { page, layer };
  }
  return null;
};

const canSnapResize = (layer: Layer): boolean =>
  !isShiftHeld() && !isAspectLocked() && (layer.rotation ?? 0) === 0;

const toRect = (layer: Layer): SnapRect => ({ x: layer.x, y: layer.y, width: layer.width, height: layer.height });

const siblingRects = (page: TemplatePage, layerId: string): SnapRect[] =>
  page.layers.filter((layer) => layer.id !== layerId && layer.visible !== false).map(toRect);

export const useResizeSnap = ({ pages, zoom, onResizeDelta, onResizeEnd }: UseResizeSnapArgs): UseResizeSnapResult => {
  const resize = useRef<ResizeState | null>(null);
  const [guidesByPage, setGuidesByPage] = useState<Record<string, SnapGuide[]>>({});

  const handleResizeDelta = useCallback(
    (id: string, dir: HandleDir, dx: number, dy: number) => {
      const found = findTopLevelLayer(pages, id);
      if (!found || !canSnapResize(found.layer)) {
        resize.current = null;
        setGuidesByPage((prev) => (Object.keys(prev).length ? {} : prev));
        onResizeDelta(id, dir, dx, dy);
        return;
      }
      if (!resize.current || resize.current.id !== id) {
        resize.current = { id, startRect: toRect(found.layer), accumDx: 0, accumDy: 0, appliedX: 0, appliedY: 0 };
      }
      const state = resize.current;
      state.accumDx += dx;
      state.accumDy += dy;
      const threshold = SCREEN_SNAP_THRESHOLD_PX / Math.max(zoom, MIN_ZOOM);
      const resizing = resizedRect(state.startRect, dir, state.accumDx, state.accumDy);
      const snap = computeResizeSnap(resizing, dir, siblingRects(found.page, id), found.page, threshold, pageAidLines(found.page));
      const adjustedDx = dx + (snap.correctionX - state.appliedX);
      const adjustedDy = dy + (snap.correctionY - state.appliedY);
      state.appliedX = snap.correctionX;
      state.appliedY = snap.correctionY;
      setGuidesByPage({ [found.page.id]: snap.guides });
      onResizeDelta(id, dir, adjustedDx, adjustedDy);
    },
    [pages, zoom, onResizeDelta],
  );

  const handleResizeEnd = useCallback(
    (id: string) => {
      resize.current = null;
      setGuidesByPage({});
      onResizeEnd(id);
    },
    [onResizeEnd],
  );

  return { onResizeDelta: handleResizeDelta, onResizeEnd: handleResizeEnd, guidesByPage };
};
