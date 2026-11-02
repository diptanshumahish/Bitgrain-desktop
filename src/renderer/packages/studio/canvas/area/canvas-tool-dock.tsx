import React from "react";
import type { ShapeType, VectorSettings } from "@bitgrain/studio-core/model/studio-types";
import { FloatingAdder } from "../../ui/FloatingAdder";
import type { FramePreset } from "@bitgrain/core/layout/frame-presets";
import type { CanvasPanZoom, CanvasTools } from "./canvas-tool-types";

interface CanvasToolDockProps {
  panZoom: CanvasPanZoom;
  tools: CanvasTools;
  vectorEditingId: string | null;
  vectorSettings: VectorSettings;
  selectedFrameId: string | null;
  onEndVectorEdit: () => void;
  onAddShape: (type: ShapeType) => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onAddPattern: () => void;
  onMockup: () => void;
  onAddFramePreset: (preset: FramePreset) => void;
  onAddFrameInside: (parentId: string) => void;
}

export const CanvasToolDock = ({
  panZoom, tools, vectorEditingId, vectorSettings, selectedFrameId,
  onEndVectorEdit, onAddShape, onAddImage, onAddAdjustment, onAddPattern, onMockup, onAddFramePreset, onAddFrameInside,
}: CanvasToolDockProps): React.ReactElement => (
  <FloatingAdder
    grabMode={panZoom.grabMode}
    isSpacePressed={panZoom.isSpaceActive}
    penMode={tools.drawingMode}
    pencilMode={tools.pencilMode}
    brushMode={tools.brushMode}
    vectorEditingId={vectorEditingId}
    nodeEditMode={tools.nodeEditMode}
    drawingSettings={vectorSettings}
    onGrabModeChange={panZoom.setGrabMode}
    onPenModeChange={tools.setDrawingMode}
    onPencilModeChange={tools.setPencilMode}
    onBrushModeChange={tools.setBrushMode}
    onNodeEditModeChange={tools.setNodeEditMode}
    onEndVectorEdit={onEndVectorEdit}
    onDrawingSettingsChange={(settings) => tools.setVectorSettings((prev) => ({ ...prev, ...settings }))}
    placementTool={tools.placementTool}
    onStartTextPlacement={() => tools.selectPlacement({ kind: "text" })}
    onStartShapePlacement={(type) => tools.selectPlacement({ kind: "shape", shapeType: type })}
    onAddRectangle={() => onAddShape("rect")}
    onExitPlacement={tools.clearPlacement}
    onAddImage={onAddImage}
    onAddAdjustment={onAddAdjustment}
    onAddPattern={onAddPattern}
    onMockup={onMockup}
    frameDrawMode={tools.frameDrawMode}
    onStartFrameDraw={() => tools.setFrameDrawMode(true)}
    onAddFramePreset={onAddFramePreset}
    selectedFrameId={selectedFrameId}
    onAddFrameInside={onAddFrameInside}
  />
);
