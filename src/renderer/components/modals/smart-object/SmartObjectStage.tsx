import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSmartObjectRender } from "./use-smart-object-render";
import { CornerLoupe } from "./CornerLoupe";
import { drawCornerLoupe } from "./loupe-painter";
import { QuadGuides } from "./QuadGuides";
import { isConvexQuad } from "../../../engine/mockup/homography";
import { constrainToEdgeAxis } from "../../../engine/mockup/quad-guides";
import { EdgeMap } from "../../../engine/mockup/edge-map";
import type { MockupPoint, MockupQuad, SmartObjectSettings } from "../../../engine/mockup/mockup-types";

const HANDLE_LABELS = ["top left", "top right", "bottom right", "bottom left"];
const QUAD_STROKE = "#820000";
const NUDGE_STEP = 0.002;
const COARSE_NUDGE_STEP = 0.02;
const SNAP_RADIUS_FRACTION = 0.012;

const NUDGE_KEYS: Record<string, MockupPoint> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

interface SmartObjectStageProps {
  base: HTMLImageElement | null;
  artwork: HTMLCanvasElement | null;
  corners: MockupQuad;
  settings: SmartObjectSettings;
  snapToEdges: boolean;
  showGuides: boolean;
  onCornersChange: (corners: MockupQuad) => void;
}

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

const clampPoint = (point: MockupPoint): MockupPoint => ({ x: clampUnit(point.x), y: clampUnit(point.y) });

const replaceCorner = (corners: MockupQuad, index: number, point: MockupPoint): MockupQuad =>
  corners.map((corner, position) => (position === index ? point : corner)) as MockupQuad;

const translateQuad = (corners: MockupQuad, deltaX: number, deltaY: number): MockupQuad =>
  corners.map((corner) => ({ x: clampUnit(corner.x + deltaX), y: clampUnit(corner.y + deltaY) })) as MockupQuad;

export const SmartObjectStage: React.FC<SmartObjectStageProps> = ({
  base,
  artwork,
  corners,
  settings,
  snapToEdges,
  showGuides,
  onCornersChange,
}) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<MockupPoint | null>(null);
  const dragStartCorners = useRef<MockupQuad | null>(null);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);

  const edgeMap = useMemo(() => (base ? new EdgeMap(base) : null), [base]);

  useSmartObjectRender(base, artwork, corners, settings, previewRef);

  useEffect(() => {
    if (activeCorner === null) return;
    const preview = previewRef.current;
    const loupe = loupeRef.current;
    if (preview && loupe) drawCornerLoupe(preview, loupe, corners[activeCorner]);
  }, [activeCorner, corners, settings, base, artwork]);

  const pointerToUnit = (event: React.PointerEvent): MockupPoint | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: clampUnit((event.clientX - rect.left) / rect.width),
      y: clampUnit((event.clientY - rect.top) / rect.height),
    };
  };

  const resolveCornerTarget = (index: number, desired: MockupPoint, shiftKey: boolean): MockupPoint => {
    const start = dragStartCorners.current;
    if (shiftKey && start) return clampPoint(constrainToEdgeAxis(start, index, desired));
    if (snapToEdges && edgeMap) {
      const snapped = edgeMap.snap(desired, SNAP_RADIUS_FRACTION);
      if (snapped) return snapped;
    }
    return desired;
  };

  const startCornerDrag = (index: number) => (event: React.PointerEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartCorners.current = corners;
    setActiveCorner(index);
  };

  const dragCorner = (index: number) => (event: React.PointerEvent): void => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const desired = pointerToUnit(event);
    if (desired) onCornersChange(replaceCorner(corners, index, resolveCornerTarget(index, desired, event.shiftKey)));
  };

  const endCornerDrag = (event: React.PointerEvent): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartCorners.current = null;
    setActiveCorner(null);
  };

  const nudgeCorner = (index: number) => (event: React.KeyboardEvent): void => {
    const direction = NUDGE_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? COARSE_NUDGE_STEP : NUDGE_STEP;
    const corner = corners[index];
    setActiveCorner(index);
    onCornersChange(
      replaceCorner(corners, index, {
        x: clampUnit(corner.x + direction.x * step),
        y: clampUnit(corner.y + direction.y * step),
      }),
    );
  };

  const handleQuadPointerDown = (event: React.PointerEvent): void => {
    lastPoint.current = pointerToUnit(event);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleQuadPointerMove = (event: React.PointerEvent): void => {
    if (!lastPoint.current) return;
    const point = pointerToUnit(event);
    if (!point) return;
    onCornersChange(translateQuad(corners, point.x - lastPoint.current.x, point.y - lastPoint.current.y));
    lastPoint.current = point;
  };

  const endQuadDrag = (): void => {
    lastPoint.current = null;
  };

  const polygonPoints = corners.map((corner) => `${corner.x},${corner.y}`).join(" ");
  const warning = isConvexQuad(corners) ? null : "corners are crossed, uncross them for a clean warp";

  return (
    <div className="flex flex-col gap-2">
      <div ref={stageRef} className="relative w-full select-none touch-none">
        <canvas ref={previewRef} className="block w-full h-auto rounded-lg border border-black/10" />
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          {showGuides && <QuadGuides corners={corners} />}
          <polygon
            points={polygonPoints}
            fill="transparent"
            stroke={QUAD_STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className="absolute inset-0 cursor-move"
          onPointerDown={handleQuadPointerDown}
          onPointerMove={handleQuadPointerMove}
          onPointerUp={endQuadDrag}
          onPointerCancel={endQuadDrag}
        />
        {corners.map((corner, index) => (
          <button
            key={HANDLE_LABELS[index]}
            title={`${HANDLE_LABELS[index]}, shift keeps the edge straight, arrows nudge`}
            onPointerDown={startCornerDrag(index)}
            onPointerMove={dragCorner(index)}
            onPointerUp={endCornerDrag}
            onPointerCancel={endCornerDrag}
            onKeyDown={nudgeCorner(index)}
            onBlur={() => setActiveCorner(null)}
            className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-[#820000] cursor-grab active:cursor-grabbing"
            style={{ left: `${corner.x * 100}%`, top: `${corner.y * 100}%` }}
          />
        ))}
        {activeCorner !== null && <CornerLoupe loupeRef={loupeRef} point={corners[activeCorner]} />}
      </div>
      {warning && <p className="text-[11px] text-[#820000]">{warning}</p>}
    </div>
  );
};
