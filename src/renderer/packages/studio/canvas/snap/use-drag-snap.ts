import { useCallback, useRef, useState } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { SnapRect } from "./snap-engine";
import { resolveSnap, type SnapOverlay } from "./snap-resolve";
import { pageAidLines } from "./snap-aid-lines";
import { isShiftHeld } from "../../state/modifier-keys-store";
import { hapticStep } from "../../../../shell/haptics";

// Desktop (PORTED.md): a trackpad tick when a new alignment locks in, keyed on the
// engaged guides so it fires once per alignment, not every frame. No-op off macOS.
const guideSignature = (guides: SnapOverlay["guides"]): string =>
  guides.map((guide) => JSON.stringify(guide)).sort().join("|");
let lastGuideSignature = "";

const SCREEN_SNAP_THRESHOLD_PX = 6;

interface DragState {
  id: string;
  pageId: string;
  startRect: SnapRect;
  accumDx: number;
  accumDy: number;
  appliedX: number;
  appliedY: number;
}

interface UseDragSnapArgs {
  pages: TemplatePage[];
  zoom: number;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
}

interface UseDragSnapResult {
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  overlayByPage: Record<string, SnapOverlay>;
}

const findPageContaining = (pages: TemplatePage[], layerId: string): TemplatePage | undefined =>
  pages.find((page) => page.layers.some((layer) => layer.id === layerId));

export const useDragSnap = ({
  pages,
  zoom,
  onMoveDelta,
  onMoveEnd,
}: UseDragSnapArgs): UseDragSnapResult => {
  const drag = useRef<DragState | null>(null);
  const [overlayByPage, setOverlayByPage] = useState<Record<string, SnapOverlay>>({});

  const handleMoveDelta = useCallback(
    (id: string, dx: number, dy: number) => {
      if (isShiftHeld()) {
        if (drag.current) drag.current = null;
        setOverlayByPage((prev) => (Object.keys(prev).length ? {} : prev));
        onMoveDelta(id, dx, dy);
        return;
      }

      const page = findPageContaining(pages, id);
      if (!page) {
        onMoveDelta(id, dx, dy);
        return;
      }

      if (!drag.current || drag.current.id !== id) {
        const layer = page.layers.find((entry) => entry.id === id);
        if (!layer) {
          onMoveDelta(id, dx, dy);
          return;
        }
        drag.current = {
          id,
          pageId: page.id,
          startRect: { x: layer.x, y: layer.y, width: layer.width, height: layer.height },
          accumDx: 0,
          accumDy: 0,
          appliedX: 0,
          appliedY: 0,
        };
      }

      drag.current.accumDx += dx;
      drag.current.accumDy += dy;

      const moving: SnapRect = {
        x: drag.current.startRect.x + drag.current.accumDx,
        y: drag.current.startRect.y + drag.current.accumDy,
        width: drag.current.startRect.width,
        height: drag.current.startRect.height,
      };

      const targets: SnapRect[] = page.layers
        .filter((layer) => layer.id !== id && layer.visible !== false)
        .map((layer) => ({ x: layer.x, y: layer.y, width: layer.width, height: layer.height }));

      const threshold = SCREEN_SNAP_THRESHOLD_PX / Math.max(zoom, 0.0001);
      const snap = resolveSnap(moving, targets, { width: page.width, height: page.height }, threshold, pageAidLines(page));

      const adjustedDx = dx + (snap.correctionX - drag.current.appliedX);
      const adjustedDy = dy + (snap.correctionY - drag.current.appliedY);
      drag.current.appliedX = snap.correctionX;
      drag.current.appliedY = snap.correctionY;

      const signature = guideSignature(snap.guides);
      if (signature && signature !== lastGuideSignature) hapticStep("alignment");
      lastGuideSignature = signature;
      setOverlayByPage({ [page.id]: { guides: snap.guides, measurements: snap.measurements } });
      onMoveDelta(id, adjustedDx, adjustedDy);
    },
    [pages, zoom, onMoveDelta],
  );

  const handleMoveEnd = useCallback(
    (id: string) => {
      drag.current = null;
      lastGuideSignature = "";
      setOverlayByPage({});
      onMoveEnd(id);
    },
    [onMoveEnd],
  );

  return { onMoveDelta: handleMoveDelta, onMoveEnd: handleMoveEnd, overlayByPage };
};
