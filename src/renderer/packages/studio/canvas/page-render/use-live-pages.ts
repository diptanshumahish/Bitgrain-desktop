import { startTransition, useEffect, useMemo, useState } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { onViewportChange } from "./viewport-bus";

const VIEWPORT_MARGIN_RATIO = 0.75;
const KEY_SEPARATOR = "\n";
const FIELD_SEPARATOR = "|";

interface ViewportRefs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
}

interface PageRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const geometryKey = (pages: TemplatePage[]): string =>
  pages
    .map((page) => [page.id, page.x, page.y, page.width, page.height].join(FIELD_SEPARATOR))
    .join(KEY_SEPARATOR);

const parseGeometryKey = (key: string): PageRect[] =>
  key === ""
    ? []
    : key.split(KEY_SEPARATOR).map((line) => {
        const [id, x, y, width, height] = line.split(FIELD_SEPARATOR);
        return { id, x: Number(x), y: Number(y), width: Number(width), height: Number(height) };
      });

const liveKeyFor = (rects: PageRect[], refs: ViewportRefs): string => {
  const wrap = refs.wrapRef.current;
  const zoom = refs.zoomRef.current;
  if (!wrap || !(zoom > 0)) return "";
  const viewWidth = wrap.clientWidth / zoom;
  const viewHeight = wrap.clientHeight / zoom;
  const left = -refs.panRef.current.x / zoom - viewWidth * VIEWPORT_MARGIN_RATIO;
  const top = -refs.panRef.current.y / zoom - viewHeight * VIEWPORT_MARGIN_RATIO;
  const right = left + viewWidth * (1 + 2 * VIEWPORT_MARGIN_RATIO);
  const bottom = top + viewHeight * (1 + 2 * VIEWPORT_MARGIN_RATIO);
  return rects
    .filter((rect) => rect.x < right && rect.x + rect.width > left && rect.y < bottom && rect.y + rect.height > top)
    .map((rect) => rect.id)
    .join(KEY_SEPARATOR);
};

export const useLivePages = (pages: TemplatePage[], refs: ViewportRefs): ReadonlySet<string> => {
  const layoutKey = geometryKey(pages);
  const stableRects = useMemo(() => parseGeometryKey(layoutKey), [layoutKey]);
  const [liveKey, setLiveKey] = useState("");

  useEffect(() => {
    let frame: number | null = null;
    const refresh = (): void => {
      frame = null;
      const nextKey = liveKeyFor(stableRects, refs);
      startTransition(() => setLiveKey(nextKey));
    };
    const scheduleRefresh = (): void => {
      if (frame === null) frame = requestAnimationFrame(refresh);
    };
    const stopListening = onViewportChange(scheduleRefresh);
    window.addEventListener("resize", scheduleRefresh);
    scheduleRefresh();
    return () => {
      stopListening();
      window.removeEventListener("resize", scheduleRefresh);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [stableRects, refs]);

  return useMemo(() => new Set(liveKey === "" ? [] : liveKey.split(KEY_SEPARATOR)), [liveKey]);
};
