import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { isPointInside, isPointOnGlyphs } from "./glyph-hit-test";

const PASS_THROUGH_ATTR = "data-pass-through";

export const TEXT_PASS_THROUGH_CLASS = "data-[pass-through]:pointer-events-none";

export const useTextClickThrough = (
  wrapRef: React.RefObject<HTMLDivElement | null>,
  active: boolean,
): ((event: React.PointerEvent) => void) => {
  const watchRef = useRef<AbortController | null>(null);

  const restore = useCallback((): void => {
    watchRef.current?.abort();
    watchRef.current = null;
    wrapRef.current?.removeAttribute(PASS_THROUGH_ATTR);
  }, [wrapRef]);

  const watchForReturn = useCallback((wrap: HTMLDivElement): void => {
    const controller = new AbortController();
    watchRef.current = controller;
    const onMove = (event: PointerEvent): void => {
      if (event.buttons !== 0) return;
      const left = !isPointInside(wrap, event.clientX, event.clientY);
      if (left || isPointOnGlyphs(wrap, event.clientX, event.clientY)) restore();
    };
    window.addEventListener("pointermove", onMove, { signal: controller.signal });
  }, [restore]);

  useEffect(() => {
    if (!active) restore();
    return restore;
  }, [active, restore]);

  return useCallback((event: React.PointerEvent): void => {
    const wrap = wrapRef.current;
    if (!active || !wrap || event.buttons !== 0 || watchRef.current) return;
    if (isPointOnGlyphs(wrap, event.clientX, event.clientY)) return;
    wrap.setAttribute(PASS_THROUGH_ATTR, "");
    watchForReturn(wrap);
  }, [active, wrapRef, watchForReturn]);
};
