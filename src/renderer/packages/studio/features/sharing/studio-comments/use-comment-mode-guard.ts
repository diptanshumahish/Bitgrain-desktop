import { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitSelectLayers } from "../../../editor/select-layers-event";
import { commentModeSignal } from "../comment-state/comment-ui-store";

const COMMENT_CURSOR_CLASS = "comment-cursor";

const PASS_THROUGH_SELECTOR = [
  "[data-comment-surface]",
  "[data-comment-pin]",
  "[data-popover-root]",
  "[data-canvas-ruler]",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "a",
  "[contenteditable]",
].join(", ");

const blockCanvasPress = (event: PointerEvent): void => {
  if (event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest(PASS_THROUGH_SELECTOR)) return;
  event.stopPropagation();
};

export const useCommentModeGuard = (wrapRef: React.RefObject<HTMLDivElement | null>): void => {
  const active = useSignalValue(commentModeSignal);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !active) return undefined;
    emitSelectLayers([]);
    wrap.classList.add(COMMENT_CURSOR_CLASS);
    wrap.addEventListener("pointerdown", blockCanvasPress, true);
    return () => {
      wrap.classList.remove(COMMENT_CURSOR_CLASS);
      wrap.removeEventListener("pointerdown", blockCanvasPress, true);
    };
  }, [active, wrapRef]);
};
