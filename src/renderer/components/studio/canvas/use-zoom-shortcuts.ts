import { useEffect, useRef } from "react";
import type { TemplatePage } from "../../../data/studioTypes";
import { trackEvent } from "../../../lib/tracker";
import type { CanvasViewport } from "./use-canvas-viewport";

const ZOOM_IN_CODES = new Set(["Equal", "NumpadAdd"]);
const ZOOM_OUT_CODES = new Set(["Minus", "NumpadSubtract"]);
const FIT_CODES = new Set(["Digit0", "Numpad0"]);
const ACTUAL_SIZE_CODES = new Set(["Digit1", "Numpad1"]);

type ZoomAction = "in" | "out" | "fit" | "actual";

const readZoomAction = (event: KeyboardEvent): ZoomAction | null => {
  const withModifier = event.metaKey || event.ctrlKey;
  if (event.shiftKey && !withModifier && event.code === "Digit1") return "fit";
  if (!withModifier) return null;
  if (ZOOM_IN_CODES.has(event.code)) return "in";
  if (ZOOM_OUT_CODES.has(event.code)) return "out";
  if (FIT_CODES.has(event.code)) return "fit";
  if (ACTUAL_SIZE_CODES.has(event.code)) return "actual";
  return null;
};

const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]");

export const useZoomShortcuts = (viewport: CanvasViewport, activePage: TemplatePage | undefined): void => {
  const activePageRef = useRef(activePage);

  useEffect(() => {
    activePageRef.current = activePage;
  });

  useEffect(() => {
    const runAction = (action: ZoomAction): void => {
      const page = activePageRef.current;
      if (action === "in") viewport.zoomStep(1);
      else if (action === "out") viewport.zoomStep(-1);
      else if (action === "actual") viewport.zoomToActualSize();
      else if (page) viewport.fitToRect(page);
      trackEvent("studio", "zoom_shortcut_used", { details: { action } });
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      const action = readZoomAction(event);
      if (!action) return;
      if (action === "fit" && !event.metaKey && !event.ctrlKey && isTypingTarget(event.target)) return;
      event.preventDefault();
      runAction(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewport]);
};
