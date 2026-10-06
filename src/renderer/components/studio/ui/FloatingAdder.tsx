import React, { useState } from "react";
import {
  Type,
  Square,
  Image as ImageIcon,
  Circle,
  Triangle,
  MousePointer2,
  Hand,
  PenTool,
  Pencil,
  Brush,
  Check,
  ChevronDown,
  LayoutGrid,
  Contrast,
  Frame,
  Shirt,
} from "lucide-react";
import type { ShapeType, VectorSettings } from "../../../data/studioTypes";
import type { PlacementTool } from "../canvas/use-canvas-tools";
import type { FramePreset } from "../../../utils/frame-presets";
import { ColorPicker } from "./ColorPicker";
import { ScrubField } from "./panelPrimitives";
import { DashStyleToggle } from "./DashStyleToggle";
import { NodeEditToolbar, type NodeEditMode } from "./NodeEditToolbar";
import { FramePresetMenu } from "./frame-preset-menu";
import { emitPopover } from "../../../lib/event-bus";
import { Tooltip } from "./Tooltip";

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
      onClick={onClick}
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

const SHAPE_OPTIONS: { type: ShapeType; icon: React.ReactNode }[] = [
  { type: "rect", icon: <Square size={15} /> },
  { type: "circle", icon: <Circle size={15} /> },
  { type: "triangle", icon: <Triangle size={15} /> },
];

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
  const [strokeColorOpen, setStrokeColorOpen] = useState(false);
  const [fillColorOpen, setFillColorOpen] = useState(false);

  const hasFill =
    drawingSettings.fill !== "transparent" && drawingSettings.fill !== "none";
  const isDrawing = penMode || pencilMode || brushMode;
  const placementActive = placementTool !== null;

  const selectPen = () => {
    onExitPlacement();
    onPenModeChange(true);
    onPencilModeChange(false);
    onBrushModeChange(false);
    onGrabModeChange(false);
  };
  const selectPencil = () => {
    onExitPlacement();
    onPencilModeChange(true);
    onPenModeChange(false);
    onBrushModeChange(false);
    onGrabModeChange(false);
  };
  const selectBrush = () => {
    onExitPlacement();
    onBrushModeChange(true);
    onPenModeChange(false);
    onPencilModeChange(false);
    onGrabModeChange(false);
  };
  const selectSelect = () => {
    onExitPlacement();
    onGrabModeChange(false);
    onPenModeChange(false);
    onPencilModeChange(false);
    onBrushModeChange(false);
  };
  const selectGrab = () => {
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
        <div className="flex flex-row items-center gap-2 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-2xl px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-[var(--s-text-subtle)]  ">
              STROKE
            </span>
            <div className="relative">
              <button
                onClick={() => {
                  setStrokeColorOpen(!strokeColorOpen);
                  setFillColorOpen(false);
                }}
                className="w-6 h-6 rounded-full border-2 border-[var(--s-border)] outline-none cursor-pointer"
                style={{ background: drawingSettings.strokeColor }}
              />
              {strokeColorOpen && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[300]">
                  <ColorPicker
                    color={drawingSettings.strokeColor}
                    onChange={(c) =>
                      onDrawingSettingsChange({ strokeColor: c })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {penMode && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] text-[var(--s-text-subtle)]  ">
                FILL
              </span>
              <div className="relative">
                <button
                  onClick={() => {
                    setFillColorOpen(!fillColorOpen);
                    setStrokeColorOpen(false);
                  }}
                  className="w-6 h-6 rounded-full border-2 border-[var(--s-border)] outline-none cursor-pointer relative overflow-hidden"
                  style={{
                    background: hasFill ? drawingSettings.fill : "transparent",
                  }}
                >
                  {!hasFill && (
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute inset-0 w-full h-full"
                    >
                      <line
                        x1="4"
                        y1="4"
                        x2="20"
                        y2="20"
                        stroke="var(--s-text-subtle)"
                        strokeWidth="2.5"
                      />
                    </svg>
                  )}
                </button>
                {fillColorOpen && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-1">
                    <button
                      onClick={() =>
                        onDrawingSettingsChange({
                          fill: hasFill ? "transparent" : "#ffffff",
                        })
                      }
                      className="text-[9px] px-2 py-1 rounded bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] border-none outline-none cursor-pointer"
                    >
                      {hasFill ? "Remove fill" : "Add fill"}
                    </button>
                    {hasFill && (
                      <ColorPicker
                        color={drawingSettings.fill}
                        onChange={(c) => onDrawingSettingsChange({ fill: c })}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="w-px h-6 bg-[var(--s-border)]" />

          <div className="w-[80px]">
            <ScrubField
              label="W"
              value={drawingSettings.strokeWidth}
              min={0.5}
              max={200}
              onChange={(v) => onDrawingSettingsChange({ strokeWidth: v })}
            />
          </div>

          <DashStyleToggle
            value={drawingSettings.dashStyle}
            onChange={(dashStyle) => onDrawingSettingsChange({ dashStyle })}
          />

          {penMode && (
            <span className="text-[9px] text-[var(--s-text-subtle)]   leading-tight max-w-[90px]">
              Click = point, drag = curve, Enter = done
            </span>
          )}

          <div className="w-px h-6 bg-[var(--s-border)]" />

          <button
            onClick={() => {
              onPenModeChange(false);
              onPencilModeChange(false);
              onBrushModeChange(false);
            }}
            title={penMode ? "Finish path (Enter)" : "Done"}
            className="w-7 h-7 flex items-center justify-center rounded-lg border-none outline-none cursor-pointer bg-[var(--s-accent)] text-[var(--s-accent-text)]"
          >
            <Check size={13} strokeWidth={3} />
          </button>
        </div>
      )}

      <div
        className={`flex flex-row items-center bg-[var(--s-bg-panel)]/80 backdrop-blur-md border border-[var(--s-border)] p-1.5 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${isGrabActive ? "gap-0" : "gap-2"}`}
      >
        {/* Mode toggle: Select | Hand, unified segmented pill */}
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

        {/* Other tools - Morph out to right */}
        <div
          className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ${isGrabActive ? "max-w-0 opacity-0 translate-x-4 pointer-events-none" : "max-w-[500px] opacity-100 translate-x-0"}`}
        >
          <div className="w-px h-5 bg-[var(--s-border)] mx-1" />

          <div className="flex flex-row items-center gap-2 px-1">
            <div className="relative flex items-center">
              <button
                onClick={() => (isDrawing ? selectSelect() : selectPen())}
                title={isDrawing ? "Exit draw tool" : "Pen tool (P)"}
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
              title="Add text (drag to place)"
              active={placementTool?.kind === "text"}
            />

            <div className="relative">
              <ActionBtn
                icon={<Square size={16} strokeWidth={1.5} />}
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  emitPopover({
                    type: "tool-dropdown",
                    anchorRect: rect,
                    content: (
                      <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1.5 flex flex-row gap-1">
                        {SHAPE_OPTIONS.map((s) => (
                          <button
                            key={s.type}
                            onClick={() => {
                              onStartShapePlacement(s.type);
                              emitPopover(null);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border-none outline-none bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)] cursor-pointer"
                          >
                            {s.icon}
                          </button>
                        ))}
                      </div>
                    ),
                  });
                }}
                title="Add shape (drag to place)"
                active={placementTool?.kind === "shape"}
              />
            </div>

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
