import React from "react";
import { Type, Image as ImageIcon, MousePointer2, Hand, Frame } from "lucide-react";
import type { ShapeType, VectorSettings } from "@bitgrain/studio-core/model/studio-types";
import type { PlacementTool } from "../canvas/use-canvas-tools";
import type { FramePreset } from "@bitgrain/core/layout/frame-presets";
import { DrawingSettingsBar } from "../adder/drawing/DrawingSettingsBar";
import { NodeEditToolbar, type NodeEditMode } from "./NodeEditToolbar";
import { FramePresetMenu } from "./frame-preset-menu";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { trackEvent } from "@bitgrain/platform/tracker";
import { ShapeToolButton } from "../adder/shape-tool-button";
import { DrawingToolButton } from "../adder/drawing-tool-button";
import { MoreToolsButton } from "../adder/more-tools-button";
import { ToolTileContent } from "../adder/tool-tile";
import { TOOL_TILE_CLASS, TOOL_TILE_ICON_SIZE, toolTileTone } from "../adder/tool-tile-styles";
import { useSignalValue } from "@bitgrain/core/signal";
import { CommentToolButton } from "../features/sharing/studio-comments/comment-tool-button";
import { commentModeSignal } from "../features/sharing/comment-state/comment-ui-store";
import { setCommentMode } from "../features/sharing/comment-state/comment-mode";

const trackToolSelected = (tool: string): void => {
  trackEvent("studio", "tool_selected", { details: { tool, source: "toolbar" } });
};

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  active?: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ icon, label, onClick, title, active = false }) => (
  <Tooltip content={title}>
    <button type="button" onClick={onClick} aria-label={title} className={`${TOOL_TILE_CLASS} rounded-xl ${toolTileTone(active)}`}>
      <ToolTileContent icon={icon} label={label} />
    </button>
  </Tooltip>
);


const Divider: React.FC = () => (
  <div aria-hidden className="w-px h-5 bg-[var(--s-border)] shrink-0" />
);

interface FloatingAdderProps {
  grabMode: boolean;
  isSpacePressed?: boolean;
  penMode: boolean;
  pencilMode: boolean;
  brushMode: boolean;
  vectorEditingId: string | null;
  nodeEditMode: NodeEditMode;
  drawingSettings: VectorSettings;
  onGrabModeChange: (value: boolean) => void;
  onPenModeChange: (value: boolean) => void;
  onPencilModeChange: (value: boolean) => void;
  onBrushModeChange: (value: boolean) => void;
  onNodeEditModeChange: (mode: NodeEditMode) => void;
  onEndVectorEdit: () => void;
  onDrawingSettingsChange: (settings: Partial<VectorSettings>) => void;
  placementTool: PlacementTool | null;
  onStartTextPlacement: () => void;
  onStartShapePlacement: (type: ShapeType) => void;
  onAddRectangle: () => void;
  onExitPlacement: () => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onAddPattern: () => void;
  onMockup: () => void;
  frameDrawMode: boolean;
  onStartFrameDraw: () => void;
  onAddFramePreset: (preset: FramePreset) => void;
  selectedFrameId: string | null;
  onAddFrameInside: (parentId: string) => void;
}

export const FloatingAdder: React.FC<FloatingAdderProps> = ({
  grabMode,
  isSpacePressed = false,
  penMode,
  pencilMode,
  brushMode,
  vectorEditingId,
  nodeEditMode,
  drawingSettings,
  onGrabModeChange,
  onPenModeChange,
  onPencilModeChange,
  onBrushModeChange,
  onNodeEditModeChange,
  onEndVectorEdit,
  onDrawingSettingsChange,
  placementTool,
  onStartTextPlacement,
  onStartShapePlacement,
  onAddRectangle,
  onExitPlacement,
  onAddImage,
  onAddAdjustment,
  onAddPattern,
  onMockup,
  frameDrawMode,
  onStartFrameDraw,
  onAddFramePreset,
  selectedFrameId,
  onAddFrameInside,
}) => {
  const isDrawing = penMode || pencilMode || brushMode;
  const placementActive = placementTool !== null;
  const isGrabActive = grabMode || isSpacePressed;
  const commentMode = useSignalValue(commentModeSignal);

  const applyMode = (tool: "select" | "grab" | "pen" | "pencil" | "brush"): void => {
    trackToolSelected(tool);
    setCommentMode(false);
    onExitPlacement();
    onGrabModeChange(tool === "grab");
    onPenModeChange(tool === "pen");
    onPencilModeChange(tool === "pencil");
    onBrushModeChange(tool === "brush");
  };

  const selectSelect = (): void => applyMode("select");
  const selectGrab = (): void => applyMode("grab");
  const selectDrawingMode = (mode: "pen" | "pencil" | "brush"): void => applyMode(mode);

  const openFrameMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    emitPopover({
      type: "tool-dropdown",
      anchorRect: rect,
      content: (
        <FramePresetMenu
          onDraw={() => {
            onStartFrameDraw();
            emitPopover(null);
          }}
          onPick={(preset) => {
            onAddFramePreset(preset);
            emitPopover(null);
          }}
          onAddInside={
            selectedFrameId
              ? () => {
                  onAddFrameInside(selectedFrameId);
                  emitPopover(null);
                }
              : undefined
          }
        />
      ),
    });
  };

  return (
    <div data-tutorial="studio-tools" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[80]">
      {vectorEditingId && (
        <NodeEditToolbar
          mode={nodeEditMode}
          onModeChange={onNodeEditModeChange}
          onClose={onEndVectorEdit}
        />
      )}

      {isDrawing && !vectorEditingId && (
        <DrawingSettingsBar
          penMode={penMode}
          brushMode={brushMode}
          settings={drawingSettings}
          onChange={onDrawingSettingsChange}
          onDone={selectSelect}
        />
      )}

      <div
        className={`flex flex-row items-center bg-[var(--s-bg-panel)]/90 backdrop-blur-md border border-[var(--s-border)] p-1.5 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
          isGrabActive ? "gap-0" : "gap-1.5"
        }`}
      >
        <div className="flex items-center gap-0.5 shrink-0">
          <ActionBtn
            icon={<MousePointer2 size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />}
            label="Select"
            onClick={selectSelect}
            title="Select (V)"
            active={!grabMode && !isDrawing && !placementActive && !commentMode}
          />
          <ActionBtn
            icon={<Hand size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />}
            label="Move"
            onClick={selectGrab}
            title="Move the canvas (H)"
            active={isGrabActive}
          />
          <CommentToolButton />
        </div>

        <div
          className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ${
            isGrabActive
              ? "max-w-0 opacity-0 translate-x-4 pointer-events-none"
              : "max-w-[640px] opacity-100 translate-x-0"
          }`}
        >
          <Divider />

          <div className="flex items-center gap-0.5 px-1.5">
            <DrawingToolButton
              penMode={penMode}
              pencilMode={pencilMode}
              brushMode={brushMode}
              onSelectPen={() => selectDrawingMode("pen")}
              onSelectPencil={() => selectDrawingMode("pencil")}
              onSelectBrush={() => selectDrawingMode("brush")}
              onExit={selectSelect}
            />

            <ActionBtn
              icon={<Type size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />}
              label="Text"
              onClick={onStartTextPlacement}
              title="Add text (T)"
              active={placementTool?.kind === "text"}
            />

            <ShapeToolButton
              active={placementTool?.kind === "shape"}
              onAddRectangle={() => {
                onExitPlacement();
                onAddRectangle();
              }}
              onStartShapePlacement={onStartShapePlacement}
            />

            <ActionBtn
              icon={<Frame size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />}
              label="Page"
              onClick={openFrameMenu}
              title="Add a page or frame (F)"
              active={frameDrawMode}
            />
          </div>

          <Divider />

          <div className="flex items-center gap-0.5 pl-1.5">
            <ActionBtn
              icon={<ImageIcon size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />}
              label="Image"
              onClick={() => {
                onExitPlacement();
                onAddImage();
              }}
              title="Add image"
            />
            <MoreToolsButton
              onAddAdjustment={() => {
                onExitPlacement();
                onAddAdjustment();
              }}
              onAddPattern={() => {
                onExitPlacement();
                onAddPattern();
              }}
              onMockup={() => {
                onExitPlacement();
                onMockup();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
