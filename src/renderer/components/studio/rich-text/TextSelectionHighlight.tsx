import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../../lib/signal";
import { highlightRectsSignal, showSavedHighlight } from "./text-edit-bus";

export const TextSelectionHighlight: React.FC = () => {
  const rects = useSignalValue(highlightRectsSignal);
  const hasRects = rects !== null && rects.length > 0;

  useEffect(() => {
    if (!hasRects) return;
    const refresh = () => showSavedHighlight();
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [hasRects]);

  if (!rects || rects.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {rects.map((rect, index) => (
        <div
          key={index}
          className="absolute bg-blue-500/30 rounded-[1px]"
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
        />
      ))}
    </div>,
    document.body,
  );
};
