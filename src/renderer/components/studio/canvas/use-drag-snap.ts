import { useCallback, useRef, useState } from "react";
import type { TemplatePage } from "../../../data/studioTypes";
import { computeSnap, type SnapGuide, type SnapRect } from "./snap-engine";
import { isShiftHeld } from "../../../store/modifier-keys-store";
import { hapticStep } from "../../../shell/haptics";

// A stable fingerprint of the engaged guides, so a haptic tick fires only when a
// NEW alignment locks in (not every frame the same guide stays active).
const guideSignature = (guides: SnapGuide[]): string =>
  guides
    .map((g) => `${g.orientation}:${Math.round(g.position)}`)
    .sort()
    .join("|");

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
  guidesByPage: Record<string, SnapGuide[]>;
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
  const prevGuideSig = useRef<string>("");
  const [guidesByPage, setGuidesByPage] = useState<Record<string, SnapGuide[]>>({});

  const handleMoveDelta = useCallback(
    (id: string, dx: number, dy: number) => {
      if (isShiftHeld()) {
        if (drag.current) drag.current = null;
        prevGuideSig.current = "";
        setGuidesByPage((prev) => (Object.keys(prev).length ? {} : prev));
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
      const snap = computeSnap(moving, targets, { width: page.width, height: page.height }, threshold);

      const adjustedDx = dx + (snap.correctionX - drag.current.appliedX);
      const adjustedDy = dy + (snap.correctionY - drag.current.appliedY);
      drag.current.appliedX = snap.correctionX;
      drag.current.appliedY = snap.correctionY;

      // A trackpad tick the moment a new alignment engages — the "positioning
      // helper" snap the user asked for. macOS-only (helper no-ops elsewhere).
      const sig = guideSignature(snap.guides);
      if (sig && sig !== prevGuideSig.current) hapticStep("alignment");
      prevGuideSig.current = sig;

      setGuidesByPage({ [page.id]: snap.guides });
      onMoveDelta(id, adjustedDx, adjustedDy);
    },
    [pages, zoom, onMoveDelta],
  );

  const handleMoveEnd = useCallback(
    (id: string) => {
      drag.current = null;
      prevGuideSig.current = "";
      setGuidesByPage({});
      onMoveEnd(id);
    },
    [onMoveEnd],
  );

  return { onMoveDelta: handleMoveDelta, onMoveEnd: handleMoveEnd, guidesByPage };
};
