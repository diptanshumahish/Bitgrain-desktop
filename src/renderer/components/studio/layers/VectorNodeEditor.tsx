import React, { useEffect, useRef, useState } from "react";
import type {
  VectorLayer,
  VectorPath,
  BezierAnchor,
  AnchorCornerType,
} from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import {
  splitCubicBezier,
  findTOnSegment,
  cubicPointAt,
  moveAnchor,
  moveHandle,
  bendSegment,
  deleteAnchor,
  toggleAnchorCorner,
} from "./vector-node-ops";
import { VectorAnchorMarker } from "./VectorAnchorMarker";
import { PEN_CURSOR, DRAG_NODE_CURSOR } from "./vector-cursors";

type DragKind = "anchor" | "inHandle" | "outHandle" | "bendAnchor" | "bendSegment";

interface DraggingTarget {
  kind: DragKind;
  idx: number;
  lastNX: number;
  lastNY: number;
  movedTo: AnchorCornerType | null;
  t?: number;
}

interface HoveredSegment {
  idx: number;
  t: number;
}

interface VectorNodeEditorProps {
  layer: VectorLayer;
  scale: number;
  mode: NodeEditMode;
  onUpdatePath: (path: VectorPath) => void;
}

const HOVER_DOT_SCREEN_RADIUS = 3.5;
const HOVER_DOT_STROKE = 1.25;
const HIT_STROKE_SCREEN = 14;
const SKELETON_STROKE_SCREEN = 1.25;
const T_EPSILON = 0.005;

export const VectorNodeEditor: React.FC<VectorNodeEditorProps> = ({
  layer,
  scale,
  mode,
  onUpdatePath,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<DraggingTarget | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<HoveredSegment | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<number | null>(null);

  const px = (normX: number) => (normX / 100) * layer.width;
  const py = (normY: number) => (normY / 100) * layer.height;
  const toNormX = (localX: number) => layer.width > 0 ? (localX / layer.width) * 100 : 0;
  const toNormY = (localY: number) => layer.height > 0 ? (localY / layer.height) * 100 : 0;

  const localNorm = (event: { clientX: number; clientY: number }): { x: number; y: number } => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(ctm.inverse());
    return { x: toNormX(local.x), y: toNormY(local.y) };
  };
  const segmentEndpoints = (segmentIdx: number): [BezierAnchor, BezierAnchor] | null => {
    const anchorsList = layer.path.anchors;
    const nextIdx = layer.path.closed
      ? (segmentIdx + 1) % anchorsList.length
      : segmentIdx + 1;
    if (nextIdx >= anchorsList.length) return null;
    return [anchorsList[segmentIdx], anchorsList[nextIdx]];
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) return;
      if (selectedAnchor === null) return;
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (layer.path.anchors.length <= 2) return;
      event.preventDefault();
      const updated = deleteAnchor(layer.path.anchors, selectedAnchor);
      onUpdatePath({ ...layer.path, anchors: updated });
      setSelectedAnchor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layer.path, selectedAnchor, onUpdatePath]);

  const startNodeDrag = (
    event: React.PointerEvent,
    kind: "anchor" | "inHandle" | "outHandle",
    idx: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedAnchor(idx);
    svgRef.current!.setPointerCapture(event.pointerId);
    const bendAnchor = kind === "anchor" && mode === "bend";
    if (kind === "anchor") svgRef.current!.style.cursor = bendAnchor ? PEN_CURSOR : DRAG_NODE_CURSOR;
    const becomeAsymmetric = event.altKey && kind !== "anchor";
    const start = localNorm(event);
    draggingRef.current = {
      kind: bendAnchor ? "bendAnchor" : kind,
      idx,
      lastNX: start.x, lastNY: start.y,
      movedTo: bendAnchor ? "smooth" : becomeAsymmetric ? "asymmetric" : null,
    };
  };

  const insertAnchorOnSegment = (segmentIdx: number, t: number): number => {
    const { anchors, closed } = layer.path;
    const nextIdx = closed ? (segmentIdx + 1) % anchors.length : segmentIdx + 1;
    const { updatedA, inserted, updatedB } = splitCubicBezier(anchors[segmentIdx], anchors[nextIdx], t);
    const newAnchors = [...anchors];
    newAnchors[segmentIdx] = updatedA;
    newAnchors[nextIdx] = updatedB;
    newAnchors.splice(nextIdx, 0, inserted);
    onUpdatePath({ ...layer.path, anchors: newAnchors });
    setSelectedAnchor(nextIdx);
    setHoveredSegment(null);
    return nextIdx;
  };

  const startSegmentDrag = (event: React.PointerEvent<SVGPathElement>, segmentIdx: number) => {
    event.stopPropagation();
    event.preventDefault();
    const endpoints = segmentEndpoints(segmentIdx);
    if (!endpoints) return;
    const point = localNorm(event);
    const t = findTOnSegment(endpoints[0], endpoints[1], point.x, point.y);
    svgRef.current!.setPointerCapture(event.pointerId);
    svgRef.current!.style.cursor = PEN_CURSOR;
    if (mode === "bend") {
      setHoveredSegment(null);
      draggingRef.current = {
        kind: "bendSegment", idx: segmentIdx,
        lastNX: point.x, lastNY: point.y,
        movedTo: null, t,
      };
      return;
    }
    const insertedIdx = insertAnchorOnSegment(segmentIdx, t);
    draggingRef.current = {
      kind: "anchor", idx: insertedIdx,
      lastNX: point.x, lastNY: point.y,
      movedTo: null,
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = draggingRef.current;
    if (!drag) return;
    if (event.buttons === 0) {
      draggingRef.current = null;
      return;
    }
    const cur = localNorm(event);
    const dx = cur.x - drag.lastNX;
    const dy = cur.y - drag.lastNY;
    drag.lastNX = cur.x;
    drag.lastNY = cur.y;

    let anchors = layer.path.anchors;
    if (drag.movedTo && (drag.kind === "inHandle" || drag.kind === "outHandle" || drag.kind === "bendAnchor")) {
      anchors = anchors.map((a, i) => (i === drag.idx ? { ...a, cornerType: drag.movedTo! } : a));
      drag.movedTo = null;
    }
    const updated =
      drag.kind === "anchor"
        ? moveAnchor(anchors, drag.idx, dx, dy)
        : drag.kind === "bendAnchor"
          ? moveHandle(anchors, drag.idx, "outHandle", dx, dy)
          : drag.kind === "bendSegment"
            ? bendSegment(anchors, drag.idx, layer.path.closed, dx, dy, drag.t ?? 0.5)
            : moveHandle(anchors, drag.idx, drag.kind, dx, dy);
    onUpdatePath({ ...layer.path, anchors: updated });
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
    if (svgRef.current) svgRef.current.style.cursor = "";
  };

  const handleAnchorClick = (event: React.MouseEvent, idx: number) => {
    event.stopPropagation();
    if (event.altKey) {
      const updated = toggleAnchorCorner(layer.path.anchors, idx);
      onUpdatePath({ ...layer.path, anchors: updated });
    }
  };

  const handleAnchorDoubleClick = (event: React.MouseEvent, idx: number) => {
    event.stopPropagation();
    const updated = toggleAnchorCorner(layer.path.anchors, idx);
    onUpdatePath({ ...layer.path, anchors: updated });
  };

  const handleSegmentHover = (event: React.PointerEvent<SVGPathElement>, segmentIdx: number) => {
    if (draggingRef.current) return;
    const endpoints = segmentEndpoints(segmentIdx);
    if (!endpoints) return;
    const point = localNorm(event);
    const t = findTOnSegment(endpoints[0], endpoints[1], point.x, point.y);
    setHoveredSegment((prev) =>
      prev && prev.idx === segmentIdx && Math.abs(prev.t - t) < T_EPSILON ? prev : { idx: segmentIdx, t },
    );
  };

  const handleSegmentLeave = (segmentIdx: number) => {
    if (draggingRef.current) return;
    setHoveredSegment((prev) => (prev?.idx === segmentIdx ? null : prev));
  };

  const handleHandleDown = (event: React.PointerEvent, idx: number, side: "inHandle" | "outHandle") => {
    startNodeDrag(event, side, idx);
  };

  const segmentPath = (a: BezierAnchor, b: BezierAnchor): string => {
    const cp1 = a.outHandle ?? { x: a.x, y: a.y };
    const cp2 = b.inHandle ?? { x: b.x, y: b.y };
    return `M ${px(a.x)} ${py(a.y)} C ${px(cp1.x)} ${py(cp1.y)} ${px(cp2.x)} ${py(cp2.y)} ${px(b.x)} ${py(b.y)}`;
  };

  const { anchors, closed } = layer.path;
  const segmentCount = closed ? anchors.length : anchors.length - 1;
  const showHandlesFor = (i: number): boolean =>
    selectedAnchor === i || hoverIdx === i || mode === "bend";

  const hoverDot = (() => {
    if (!hoveredSegment) return null;
    const aIdx = hoveredSegment.idx;
    const bIdx = closed ? (aIdx + 1) % anchors.length : aIdx + 1;
    if (bIdx >= anchors.length) return null;
    const point = cubicPointAt(anchors[aIdx], anchors[bIdx], hoveredSegment.t);
    return { x: px(point.x), y: py(point.y) };
  })();

  return (
    <svg
      ref={svgRef}
      width={layer.width}
      height={layer.height}
      shapeRendering="geometricPrecision"
      className="absolute inset-0 block overflow-visible pointer-events-none cursor-default"
      onClick={(event) => event.stopPropagation()}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {Array.from({ length: segmentCount }, (_, i) => {
        const nextIdx = closed ? (i + 1) % anchors.length : i + 1;
        const d = segmentPath(anchors[i], anchors[nextIdx]);
        return (
          <g key={`seg-${i}`}>
            <path
              d={d}
              fill="none"
              stroke="var(--s-accent)"
              strokeWidth={SKELETON_STROKE_SCREEN / scale}
              className="pointer-events-none"
              shapeRendering="geometricPrecision"
            />
            <path
              d={d}
              fill="none"
              stroke="rgba(0,0,0,0)"
              strokeWidth={HIT_STROKE_SCREEN / scale}
              pointerEvents="stroke"
              style={{ cursor: PEN_CURSOR }}
              onPointerDown={(event) => startSegmentDrag(event, i)}
              onPointerMove={(event) => handleSegmentHover(event, i)}
              onPointerLeave={() => handleSegmentLeave(i)}
            />
          </g>
        );
      })}

      {hoverDot && (
        <circle
          cx={hoverDot.x}
          cy={hoverDot.y}
          r={HOVER_DOT_SCREEN_RADIUS / scale}
          fill="white"
          stroke="var(--s-accent)"
          strokeWidth={HOVER_DOT_STROKE / scale}
          className="pointer-events-none"
          shapeRendering="geometricPrecision"
        />
      )}

      {anchors.map((anchor, i) => (
        <VectorAnchorMarker
          key={i}
          anchor={anchor}
          index={i}
          scale={scale}
          px={px}
          py={py}
          selected={selectedAnchor === i}
          hovered={hoverIdx === i}
          showHandles={showHandlesFor(i)}
          onHover={(idx) => {
            if (idx === null) setHoverIdx((cur) => (cur === i ? null : cur));
            else setHoverIdx(idx);
          }}
          onAnchorPointerDown={(event, idx) => startNodeDrag(event, "anchor", idx)}
          onAnchorClick={handleAnchorClick}
          onAnchorDoubleClick={handleAnchorDoubleClick}
          onHandlePointerDown={handleHandleDown}
        />
      ))}
    </svg>
  );
};
