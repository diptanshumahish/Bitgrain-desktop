import React from "react";
import {
  Type,
  Image as ImageIcon,
  MousePointer2,
  Hand,
  PenTool,
  Pencil,
  Brush,
  ChevronDown,
  LayoutGrid,
  Contrast,
  Frame,
  Shirt,
} from "lucide-react";
import type { ShapeType, VectorSettings } from "../../../data/studioTypes";
import type { PlacementTool } from "../canvas/use-canvas-tools";
import type { FramePreset } from "../../../utils/frame-presets";
import { DrawingSettingsBar } from "../adder/drawing/DrawingSettingsBar";
import { NodeEditToolbar, type NodeEditMode } from "./NodeEditToolbar";
import { FramePresetMenu } from "./frame-preset-menu";
import { emitPopover } from "../../../lib/event-bus";
import { Tooltip } from "./Tooltip";
import { trackEvent } from "../../../lib/tracker";
import { ShapeToolButton } from "../adder/shape-tool-button";

const trackToolSelected = (tool: string): void => {
  trackEvent("studio", "tool_selected", { details: { tool, source: "toolbar" } });
};

interface ActionBtnProps {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  active?: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({
  icon,
  onClick,
  title,
  active = false,
}) => (
  <Tooltip content={title}>
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border-none outline-none cursor-pointer transition-all duration-200 shrink-0 ${
        active
          ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
          : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      }`}
    >
      {icon}
    </button>
  </Tooltip>
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
  onGrabModeChange: (v: boolean) => void;
  onPenModeChange: (v: boolean) => void;
  onPencilModeChange: (v: boolean) => void;
  onBrushModeChange: (v: boolean) => void;
  onNodeEditModeChange: (mode: NodeEditMode) => void;
  onEndVectorEdit: () => void;
  onDrawingSettingsChange: (s: Partial<VectorSettings>) => void;
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

  const selectPen = () => {
    trackToolSelected("pen");
    onExitPlacement();
    onPenModeChange(true);
    onPencilModeChange(false);
    onBrushModeChange(false);
    onGrabModeChange(false);
  };
  const selectPencil = () => {
    trackToolSelected("pencil");
    onExitPlacement();
    onPencilModeChange(true);
    onPenModeChange(false);
    onBrushModeChange(false);
    onGrabModeChange(false);
  };
  const selectBrush = () => {
    trackToolSelected("brush");
    onExitPlacement();
    onBrushModeChange(true);
    onPenModeChange(false);
    onPencilModeChange(false);
    onGrabModeChange(false);
  };
  const selectSelect = () => {
    trackToolSelected("select");
    onExitPlacement();
    onGrabModeChange(false);
    onPenModeChange(false);
    onPencilModeChange(false);
    onBrushModeChange(false);
  };
  const selectGrab = () => {
    trackToolSelected("grab");
    onExitPlacement();
    onGrabModeChange(true);
    onPenModeChange(false);
    onPencilModeChange(false);
    onBrushModeChange(false);
  };

  const isGrabActive = grabMode || isSpacePressed;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100]">
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
          settings={drawingSettings}
          onChange={onDrawingSettingsChange}
          onDone={selectSelect}
        />
      )}

      <div
        className={`flex flex-row items-center bg-[var(--s-bg-panel)]/80 backdrop-blur-md border border-[var(--s-border)] p-1.5 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${isGrabActive ? "gap-0" : "gap-2"}`}
      >
        <div className="flex items-center gap-0.5 rounded-xl p-0.5 shrink-0">
          <ActionBtn
            icon={<MousePointer2 size={14} strokeWidth={1.5} />}
            onClick={() => selectSelect()}
            title="Select (V)"
            active={!grabMode && !isDrawing && !placementActive}
          />
          <ActionBtn
            icon={<Hand size={14} strokeWidth={1.5} />}
            onClick={() => selectGrab()}
            title="Hand (H)"
            active={isGrabActive}
          />
        </div>

        <div
          className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ${isGrabActive ? "max-w-0 opacity-0 translate-x-4 pointer-events-none" : "max-w-[500px] opacity-100 translate-x-0"}`}
        >
          <div className="w-px h-5 bg-[var(--s-border)] mx-1" />

          <div className="flex flex-row items-center gap-2 px-1">
            <div className="relative flex items-center">
              <button
                onClick={() => (isDrawing ? selectSelect() : selectPen())}
                title={isDrawing ? "Exit draw tool" : "Pen tool (P)"}
                aria-label={isDrawing ? "Exit draw tool" : "Pen tool"}
                className={`w-8 h-9 flex items-center justify-center rounded-l-xl border-none outline-none cursor-pointer transition-all duration-300 ${
                  isDrawing
                    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                    : "bg-[var(--s-bg-panel)] text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                }`}
              >
                {brushMode ? (
                  <Brush size={15} strokeWidth={1.5} />
                ) : pencilMode ? (
                  <Pencil size={15} strokeWidth={1.5} />
                ) : (
                  <PenTool size={15} strokeWidth={1.5} />
                )}
              </button>
              <button
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  emitPopover({
                    type: "tool-dropdown",
                    anchorRect: rect,
                    content: (
                      <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl overflow-hidden min-w-[130px]">
                        <button
                          onClick={() => {
                            selectPen();
                            emitPopover(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 border-none outline-none cursor-pointer text-[11px] font-semibold transition-colors ${
                            penMode
                              ? "bg-[var(--s-bg-input)] text-[var(--s-accent)]"
                              : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                          }`}
                        >
                          <PenTool size={13} />
                          <span className="flex-1 text-left">Pen</span>
                          <span className="text-[var(--s-text-subtle)] text-[10px]  ">
                            P
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            selectPencil();
                            emitPopover(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 border-none outline-none cursor-pointer text-[11px] font-semibold transition-colors ${
                            pencilMode
                              ? "bg-[var(--s-bg-input)] text-[var(--s-accent)]"
                              : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                          }`}
                        >
                          <Pencil size={13} />
                          <span className="flex-1 text-left">Pencil</span>
                          <span className="text-[var(--s-text-subtle)] text-[10px]  ">
                            ⇧P
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            selectBrush();
                            emitPopover(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 border-none outline-none cursor-pointer text-[11px] font-semibold transition-colors ${
                            brushMode
                              ? "bg-[var(--s-bg-input)] text-[var(--s-accent)]"
                              : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                          }`}
                        >
                          <Brush size={13} />
                          <span className="flex-1 text-left">Brush</span>
                          <span className="text-[var(--s-text-subtle)] text-[10px]  ">
                            B
                          </span>
                        </button>
                      </div>
                    ),
                  });
                }}
                aria-label="More drawing tools"
                title="More drawing tools"
                className={`w-5 h-9 flex items-center justify-center rounded-r-xl border-none outline-none cursor-pointer transition-all duration-300 border-l border-black/10 ${
                  isDrawing
                    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                    : "bg-[var(--s-bg-panel)] text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                }`}
              >
                <ChevronDown size={10} strokeWidth={1.5} />
              </button>
            </div>

            <ActionBtn
              icon={<Type size={16} strokeWidth={1.5} />}
              onClick={() => onStartTextPlacement()}
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
              icon={<Frame size={16} strokeWidth={1.5} />}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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
              }}
              title="Add page (F)"
              active={frameDrawMode}
            />

            <ActionBtn
              icon={<ImageIcon size={16} strokeWidth={1.5} />}
              onClick={() => {
                onExitPlacement();
                onAddImage();
              }}
              title="Add image"
            />

            <ActionBtn
              icon={<Contrast size={16} strokeWidth={1.5} />}
              onClick={() => {
                onExitPlacement();
                onAddAdjustment();
              }}
              title="Add adjustment layer"
            />

            <ActionBtn
              icon={<LayoutGrid size={16} strokeWidth={1.5} />}
              onClick={() => {
                onExitPlacement();
                onAddPattern();
              }}
              title="Generate pattern"
            />

            <ActionBtn
              icon={<Shirt size={16} strokeWidth={1.5} />}
              onClick={() => {
                onExitPlacement();
                onMockup();
              }}
              title="Place artwork on a photo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
