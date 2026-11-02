import { useEffect, useRef } from "react";
import { hasOpenOverlay } from "../open-overlay";
import { readLayerShortcut } from "./read-layer-shortcut";
import { canRunShortcut, runLayerShortcut, type LayerShortcutContext } from "./run-layer-shortcut";

const TYPING_SELECTOR = "input, textarea, select, [contenteditable]";

const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.(TYPING_SELECTOR);

export const useLayerShortcuts = (ctx: LayerShortcutContext): void => {
  const ctxRef = useRef(ctx);

  useEffect(() => {
    ctxRef.current = ctx;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target) || isTypingTarget(document.activeElement)) return;
      const shortcut = readLayerShortcut(event);
      if (!shortcut || hasOpenOverlay()) return;
      const current = ctxRef.current;
      if (!canRunShortcut(shortcut, current)) return;
      event.preventDefault();
      runLayerShortcut(shortcut, current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
