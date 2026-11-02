import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { toggleGuides, toggleRulers } from "../../state/canvas-aids/canvas-aids-visibility";
import { selectGuide, selectedGuideSignal } from "../../state/canvas-aids/guide-selection";
import { emitPageAidsUpdate } from "../../state/canvas-aids/page-aids-event";
import { removeGuide } from "./guide-list-ops";
import { GUIDE_SELECTOR } from "./guide-constants";

const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]");

const isRulerToggle = (event: KeyboardEvent): boolean =>
  event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey && event.code === "KeyR";

const isGuidesToggle = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && !event.altKey && event.code === "Semicolon";

const isDeleteKey = (event: KeyboardEvent): boolean => event.key === "Delete" || event.key === "Backspace";

const consume = (event: KeyboardEvent): void => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

const deleteSelectedGuide = (pages: TemplatePage[]): boolean => {
  const selection = selectedGuideSignal.value;
  const page = selection ? pages.find((candidate) => candidate.id === selection.pageId) : undefined;
  if (!selection || !page) return false;
  emitPageAidsUpdate({ pageId: page.id, patch: { guides: removeGuide(page.guides ?? [], selection.guideId) }, recordHistory: true });
  selectGuide(null);
  return true;
};

export const useCanvasAidShortcuts = (pages: TemplatePage[]): void => {
  const pagesRef = useRef(pages);

  useEffect(() => {
    pagesRef.current = pages;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      if (isRulerToggle(event)) {
        consume(event);
        toggleRulers();
      } else if (isGuidesToggle(event)) {
        consume(event);
        toggleGuides();
      } else if (isDeleteKey(event) && deleteSelectedGuide(pagesRef.current)) {
        consume(event);
      }
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (!selectedGuideSignal.value) return;
      if ((event.target as HTMLElement | null)?.closest?.(GUIDE_SELECTOR)) return;
      selectGuide(null);
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);
};
