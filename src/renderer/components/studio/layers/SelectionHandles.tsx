import React, { useRef } from "react";

export type HandleDir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: HandleDir[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const CURSOR: Record<HandleDir, string> = {
  nw: "nw-resize",
  n: "n-resize",
  ne: "ne-resize",
  e: "e-resize",
  se: "se-resize",
  s: "s-resize",
  sw: "sw-resize",
  w: "w-resize",
};

// Handle visuals are drawn by SelectionBox; these divs are invisible hit zones.
const HIT_PX = 20;

// A handle is centered on its anchor, so half of it reaches inward. Capping each handle to this
// fraction of the box keeps the central region free for clicking (edit) and dragging (move), so
// resize stays confined to the borders even when the layer renders small on screen.
const MAX_HANDLE_FRACTION = 0.4;

const ROTATE_OFFSET_PX = 24;
const ROTATE_SNAP_DEG = 15;
const DEG_PER_RAD = 180 / Math.PI;

// Corner rotation zones sit in the outside quadrant of each corner, beneath the resize handle,
// so the exact corner still resizes and the area just outside it rotates (like Figma).
const ROTATE_CORNERS = ["nw", "ne", "se", "sw"] as const;
const ROTATE_ZONE_PX = 26;
const CORNER_ROTATE_TRANSFORM: Record<(typeof ROTATE_CORNERS)[number], string> = {
  nw: "translate(-100%, -100%)",
  ne: "translate(0%, -100%)",
  se: "translate(0%, 0%)",
  sw: "translate(-100%, 0%)",
};

// A curved double-headed arrow that bulges "up" at angle 0. Rotating it per corner makes the
// cursor point tangent to the rotation circle, so each corner reads as its own rotation direction.
const ROTATE_ARC =
  `<path d="M5 11 A8 8 0 0 1 19 11"/>` +
  `<path d="M5 11 8 10.5"/><path d="M5 11 6.5 14"/>` +
  `<path d="M19 11 16 10.5"/><path d="M19 11 17.5 14"/>`;

const buildRotateCursor = (angleDeg: number): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<g transform="rotate(${angleDeg} 12 12)">` +
    `<g stroke="white" stroke-width="3.5">${ROTATE_ARC}</g>` +
    `<g stroke="black" stroke-width="1.75">${ROTATE_ARC}</g>` +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 13 13, grab`;
};

const CORNER_ROTATE_CURSOR: Record<(typeof ROTATE_CORNERS)[number], string> = {
  nw: buildRotateCursor(-45),
  ne: buildRotateCursor(45),
  se: buildRotateCursor(135),
  sw: buildRotateCursor(225),
};
const TOP_ROTATE_CURSOR = buildRotateCursor(0);

// Each handle's anchor point as a fraction of the selection box. The hit area is then centered on
// that point with translate(-50%, -50%), so the dot always sits exactly on the corner / edge mid,
// independent of zoom, outline width, or hit-area size.
const ANCHOR: Record<HandleDir, { left: string; top: string }> = {
  nw: { left: "0%", top: "0%" },
  n: { left: "50%", top: "0%" },
  ne: { left: "100%", top: "0%" },
  e: { left: "100%", top: "50%" },
  se: { left: "100%", top: "100%" },
  s: { left: "50%", top: "100%" },
  sw: { left: "0%", top: "100%" },
  w: { left: "0%", top: "50%" },
};

const HORIZONTAL_EDGES: HandleDir[] = ["n", "s"];
const VERTICAL_EDGES: HandleDir[] = ["e", "w"];

const handleSize = (dir: HandleDir, handleW: number, handleH: number): { width: string; height: string } => {
  if (HORIZONTAL_EDGES.includes(dir)) return { width: `calc(100% - ${handleW}px)`, height: `${handleH}px` };
  if (VERTICAL_EDGES.includes(dir)) return { width: `${handleW}px`, height: `calc(100% - ${handleH}px)` };
  return { width: `${handleW}px`, height: `${handleH}px` };
};

interface RotateState {
  centerX: number;
  centerY: number;
  startAngle: number;
  startRotation: number;
}

interface SelectionHandlesProps {
  scale: number;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  boxWidth?: number;
  boxHeight?: number;
  rotation?: number;
  onRotate?: (rotation: number) => void;
  onRotateEnd?: () => void;
}

export const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  scale,
  onResizeDelta,
  onResizeEnd,
  boxWidth,
  boxHeight,
  rotation = 0,
  onRotate,
  onRotateEnd,
}) => {
  const last = useRef<{ x: number; y: number } | null>(null);
  const rotateState = useRef<RotateState | null>(null);

  const hit = HIT_PX / scale;
  const handleW = boxWidth ? Math.min(hit, boxWidth * MAX_HANDLE_FRACTION) : hit;
  const handleH = boxHeight ? Math.min(hit, boxHeight * MAX_HANDLE_FRACTION) : hit;
  const rotateOffset = ROTATE_OFFSET_PX / scale;

  const pointerAngle = (clientX: number, clientY: number, cx: number, cy: number): number =>
    Math.atan2(clientY - cy, clientX - cx) * DEG_PER_RAD;

  const beginRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    const box = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!box) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    rotateState.current = {
      centerX,
      centerY,
      startAngle: pointerAngle(e.clientX, e.clientY, centerX, centerY),
      startRotation: rotation,
    };
  };

  const moveRotate = (e: React.PointerEvent) => {
    const state = rotateState.current;
    if (!state) return;
    if (e.buttons === 0) {
      rotateState.current = null;
      return;
    }
    const angle = pointerAngle(e.clientX, e.clientY, state.centerX, state.centerY);
    let next = state.startRotation + (angle - state.startAngle);
    next = e.shiftKey
      ? Math.round(next / ROTATE_SNAP_DEG) * ROTATE_SNAP_DEG
      : Math.round(next);
    onRotate?.(next);
  };

  const endRotate = () => {
    rotateState.current = null;
    onRotateEnd?.();
  };

  return (
    <>
      {onRotate &&
        ROTATE_CORNERS.map((dir) => (
          <div
            key={`rotate-${dir}`}
            className="absolute z-10 pointer-events-auto"
            style={{
              width: ROTATE_ZONE_PX / scale,
              height: ROTATE_ZONE_PX / scale,
              left: ANCHOR[dir].left,
              top: ANCHOR[dir].top,
              transform: CORNER_ROTATE_TRANSFORM[dir],
              cursor: CORNER_ROTATE_CURSOR[dir],
            }}
            onPointerDown={beginRotate}
            onPointerMove={moveRotate}
            onPointerUp={endRotate}
          />
        ))}

      {onRotate && (
        <div
          className="absolute z-30 flex items-center justify-center pointer-events-auto"
          style={{
            width: hit,
            height: hit,
            left: "50%",
            top: 0,
            transform: `translate(-50%, calc(-50% - ${rotateOffset}px))`,
            cursor: TOP_ROTATE_CURSOR,
          }}
          onPointerDown={beginRotate}
          onPointerMove={moveRotate}
          onPointerUp={endRotate}
        />
      )}

      {HANDLES.map((dir) => (
        <div
          key={dir}
          className="absolute z-20 pointer-events-auto"
          style={{
            ...handleSize(dir, handleW, handleH),
            cursor: CURSOR[dir],
            left: ANCHOR[dir].left,
            top: ANCHOR[dir].top,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            last.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!last.current) return;
            if (e.buttons === 0) {
              last.current = null;
              return;
            }
            const dx = (e.clientX - last.current.x) / scale;
            const dy = (e.clientY - last.current.y) / scale;
            last.current = { x: e.clientX, y: e.clientY };
            onResizeDelta(dir, dx, dy);
          }}
          onPointerUp={() => {
            last.current = null;
            onResizeEnd();
          }}
        />
      ))}
    </>
  );
};
