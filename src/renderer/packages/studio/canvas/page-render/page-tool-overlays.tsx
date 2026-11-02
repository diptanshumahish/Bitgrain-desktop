import React from "react";
import type { TemplatePage, VectorSettings } from "@bitgrain/studio-core/model/studio-types";
import { VectorPenTool } from "../vector-pen-tool";
import { PencilTool } from "../pencil-tool";
import { PlacementToolOverlay } from "../placement-tool";
import type { PlacementTool } from "../use-canvas-tools";
import type { CanvasPageHandlers } from "./canvas-page-handlers";

export interface PageToolState {
  drawingMode: boolean;
  pencilMode: boolean;
  brushMode: boolean;
  placementTool: PlacementTool | null;
  vectorSettings: VectorSettings;
}

interface PageToolOverlaysProps {
  page: TemplatePage;
  isActive: boolean;
  zoom: number;
  tools: PageToolState;
  drawFlushRef: React.MutableRefObject<(() => void) | null>;
  handlers: CanvasPageHandlers;
}

export const PageToolOverlays = ({
  page, isActive, zoom, tools, drawFlushRef, handlers,
}: PageToolOverlaysProps): React.ReactElement => {
  const activatePage = (): void => handlers.activateDrawingPage(page.id);
  return (
    <>
      {tools.drawingMode && (
        <VectorPenTool
          active={tools.drawingMode}
          canvasW={page.width}
          canvasH={page.height}
          zoom={zoom}
          isSpacePressed={handlers.isSpacePressed}
          settings={tools.vectorSettings}
          isActivePage={isActive}
          flushRef={drawFlushRef}
          onActivatePage={activatePage}
          onFinish={handlers.onVectorFinish}
        />
      )}
      {(tools.pencilMode || tools.brushMode) && (
        <PencilTool
          active={tools.pencilMode || tools.brushMode}
          canvasW={page.width}
          canvasH={page.height}
          zoom={zoom}
          isSpacePressed={handlers.isSpacePressed}
          settings={tools.vectorSettings}
          inkMode={tools.brushMode}
          isActivePage={isActive}
          flushRef={drawFlushRef}
          onActivatePage={activatePage}
          onStrokeFinished={handlers.onPencilStroke}
          onInkFinish={handlers.onInkFinish}
        />
      )}
      {tools.placementTool && (
        <PlacementToolOverlay
          tool={tools.placementTool}
          canvasW={page.width}
          canvasH={page.height}
          zoom={zoom}
          isSpacePressed={handlers.isSpacePressed}
          isActivePage={isActive}
          onActivatePage={activatePage}
          onPlace={handlers.onPlace}
        />
      )}
    </>
  );
};
