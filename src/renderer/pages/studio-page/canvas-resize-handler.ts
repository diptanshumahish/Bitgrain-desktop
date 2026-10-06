import type { Layer, GroupLayer } from "../../data/studioTypes";
import { applyResize } from "../../utils/studio-layers";
import { regeneratePatternForBbox } from "../../utils/pattern-engine";
import { isShiftHeld } from "../../store/modifier-keys-store";
import { isAspectLocked } from "../../store/aspect-lock-store";
import type { HandleDir } from "../../components/studio/layers/SelectionHandles";

interface CanvasResizeArgs {
  id: string;
  dir: HandleDir;
  dx: number;
  dy: number;
  documentId: string;
  scaleContents: boolean;
  canvasWRef: React.MutableRefObject<number>;
  canvasHRef: React.MutableRefObject<number>;
  dragCanvasWRef: React.MutableRefObject<number | null>;
  dragCanvasHRef: React.MutableRefObject<number | null>;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
}

const MIN_DIM = 10;

export const handleCanvasResizeDelta = ({
  id,
  dir,
  dx,
  dy,
  documentId,
  scaleContents,
  canvasWRef,
  canvasHRef,
  dragCanvasWRef,
  dragCanvasHRef,
  setCanvasW,
  setCanvasH,
  setLayers,
}: CanvasResizeArgs): void => {
  if (id === documentId) {
    if (dragCanvasWRef.current === null)
      dragCanvasWRef.current = canvasWRef.current;
    if (dragCanvasHRef.current === null)
      dragCanvasHRef.current = canvasHRef.current;

    const prevW = dragCanvasWRef.current;
    const prevH = dragCanvasHRef.current;

    const dw = dir.includes("e") ? dx : dir.includes("w") ? -dx : 0;
    const dh = dir.includes("s") ? dy : dir.includes("n") ? -dy : 0;

    const nextW = dw !== 0 ? Math.max(MIN_DIM, Math.round(prevW + dw)) : prevW;
    const nextH = dh !== 0 ? Math.max(MIN_DIM, Math.round(prevH + dh)) : prevH;

    if (dw !== 0) {
      dragCanvasWRef.current = nextW;
      setCanvasW(nextW);
    }
    if (dh !== 0) {
      dragCanvasHRef.current = nextH;
      setCanvasH(nextH);
    }

    if (scaleContents) {
      const scaleX = dw !== 0 ? nextW / prevW : 1;
      const scaleY = dh !== 0 ? nextH / prevH : 1;
      if (scaleX !== 1 || scaleY !== 1) {
        setLayers((ls) =>
          ls.map((l) => ({
            ...l,
            x: Math.round(l.x * scaleX),
            y: Math.round(l.y * scaleY),
            width: Math.round(l.width * scaleX),
            height: Math.round(l.height * scaleY),
          })),
        );
      }
    } else {
      if (dw !== 0 && dir.includes("w")) {
        const realDelta = nextW - prevW;
        if (realDelta !== 0)
          setLayers((ls) =>
            ls.map((l) => ({ ...l, x: l.x + realDelta })),
          );
      }
      if (dh !== 0 && dir.includes("n")) {
        const realDelta = nextH - prevH;
        if (realDelta !== 0)
          setLayers((ls) =>
            ls.map((l) => ({ ...l, y: l.y + realDelta })),
          );
      }
    }
    return;
  }
  setLayers((prev) =>
    prev.map((l) => {
      if (l.id !== id) return l;
      const resized = { ...l, ...applyResize(l, dir, dx, dy, isShiftHeld() || isAspectLocked()) } as Layer;
      if (resized.type === "text" && resized.autoResize) resized.autoResize = false;
      if (resized.type === "group" && resized.pattern) {
        const group = resized as GroupLayer;
        const regen = regeneratePatternForBbox(
          group.pattern!,
          group.width,
          group.height,
          group.layers,
        );
        return { ...group, pattern: regen.params, layers: regen.children };
      }
      return resized;
    }),
  );
};
