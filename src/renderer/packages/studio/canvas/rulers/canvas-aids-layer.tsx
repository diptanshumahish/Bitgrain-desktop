import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsSignal } from "../../state/canvas-aids/canvas-aids-visibility";
import { useCanvasAidShortcuts } from "../guides/use-canvas-aid-shortcuts";
import { CanvasRulers } from "./canvas-rulers";

interface CanvasAidsLayerProps {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
  pages: TemplatePage[];
  activePage: TemplatePage | undefined;
  selectedIds: string[];
}

export const CanvasAidsLayer = (props: CanvasAidsLayerProps): React.ReactElement | null => {
  const { rulers } = useSignalValue(canvasAidsSignal);
  useCanvasAidShortcuts(props.pages);
  if (!rulers) return null;
  return (
    <div className="absolute inset-0 isolate z-[49] pointer-events-none [&>canvas]:pointer-events-auto">
      <CanvasRulers {...props} />
    </div>
  );
};
