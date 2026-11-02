import { useEffect, useRef, useState, type RefObject } from "react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";

export const PAGE_MEASURE_TARGET = "page";

interface PagePoint {
  x: number;
  y: number;
}

interface UseAltMeasureTargetArgs {
  page: TemplatePage;
  selectedId: string | null;
  rootRef: RefObject<HTMLDivElement | null>;
}

const toPagePoint = (clientX: number, clientY: number, root: HTMLDivElement, page: TemplatePage): PagePoint => {
  const bounds = root.getBoundingClientRect();
  const scale = bounds.width / page.width;
  return { x: (clientX - bounds.left) / scale, y: (clientY - bounds.top) / scale };
};

const containsPoint = (layer: Layer, point: PagePoint): boolean =>
  point.x >= layer.x && point.x <= layer.x + layer.width && point.y >= layer.y && point.y <= layer.y + layer.height;

const resolveTargetId = (page: TemplatePage, point: PagePoint, selectedId: string): string | null => {
  if (point.x < 0 || point.y < 0 || point.x > page.width || point.y > page.height) return null;
  const hovered = [...page.layers]
    .reverse()
    .find((layer) => layer.id !== selectedId && layer.visible !== false && containsPoint(layer, point));
  return hovered ? hovered.id : PAGE_MEASURE_TARGET;
};

export const useAltMeasureTarget = ({ page, selectedId, rootRef }: UseAltMeasureTargetArgs): string | null => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const pointer = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    const update = (altKey: boolean): void => {
      const root = rootRef.current;
      if (!altKey || !selectedId || !root || !pointer.current) {
        setTargetId(null);
        return;
      }
      const point = toPagePoint(pointer.current.clientX, pointer.current.clientY, root, page);
      setTargetId(resolveTargetId(page, point, selectedId));
    };
    const handlePointer = (event: PointerEvent): void => {
      pointer.current = { clientX: event.clientX, clientY: event.clientY };
      update(event.altKey);
    };
    const handleKey = (event: KeyboardEvent): void => update(event.altKey);
    const handleBlur = (): void => update(false);
    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
      window.removeEventListener("blur", handleBlur);
    };
  }, [page, selectedId, rootRef]);

  return targetId;
};
