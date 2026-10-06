import React, { useRef, useState, useEffect, useCallback } from "react";
import type { BezierAnchor, VectorSettings } from "../../../data/studioTypes";
import { anchorsToPath, previewSegment, dist, dashArrayFor } from "../../../utils/vector-utils";
import { notePenInput, shouldDrawWith } from "./pen-input";

const CLOSE_RADIUS = 12;
const DRAG_MIN = 5;
const PEN_GLYPH_SCALE = 16;

interface Point { x: number; y: number; }

interface VectorPenToolProps {
  active: boolean;
  canvasW: number;
  canvasH: number;
  zoom: number;
  isSpacePressed: () => boolean;
  settings: VectorSettings;
  anchorColor: string;
  onFinish: (anchors: BezierAnchor[], closed: boolean) => void;
}

export const VectorPenTool: React.FC<VectorPenToolProps> = ({
  active,
  canvasW,
  canvasH,
  zoom,
  isSpacePressed,
  settings,
  anchorColor,
  onFinish,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<BezierAnchor[]>([]);
  const pointerDownPosRef = useRef<Point | null>(null);
  const isPointerDownRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  const [anchors, setAnchors] = useState<BezierAnchor[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [pendingAnchor, setPendingAnchor] = useState<BezierAnchor | null>(null);
  const [nearFirst, setNearFirst] = useState(false);

  const toCanvas = useCallback((clientX: number, clientY: number): Point => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom };
  }, [zoom]);

  const commitCurrentPath = useCallback((closed: boolean) => {
    const current = anchorsRef.current;
    if (current.length >= 2) onFinish(current, closed);
    anchorsRef.current = [];
    setAnchors([]);
    setMousePos(null);
    setPendingAnchor(null);
    setNearFirst(false);
    isPointerDownRef.current = false;
    pointerDownPosRef.current = null;
    activePointerIdRef.current = null;
  }, [onFinish]);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  useEffect(() => {
    return () => {
      const current = anchorsRef.current;
      if (current.length >= 2) onFinishRef.current(current, false);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.key === "Enter") commitCurrentPath(false);
      if (e.key === "Escape") {
        anchorsRef.current = [];
        setAnchors([]);
        setMousePos(null);
        setPendingAnchor(null);
        setNearFirst(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, commitCurrentPath]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!active || isSpacePressed() || e.button !== 0) return;
    notePenInput(e.pointerType);
    if (!shouldDrawWith(e.pointerType)) return;
    if (activePointerIdRef.current !== null) return;
    e.stopPropagation();
    e.preventDefault();
    overlayRef.current!.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    const pt = toCanvas(e.clientX, e.clientY);
    isPointerDownRef.current = true;
    pointerDownPosRef.current = pt;

    const isClosing = anchorsRef.current.length >= 2 && dist(pt, anchorsRef.current[0]) < CLOSE_RADIUS / zoom;
    if (isClosing) {
      commitCurrentPath(true);
      return;
    }
    setPendingAnchor({ x: pt.x, y: pt.y });
  }, [active, isSpacePressed, toCanvas, zoom, commitCurrentPath]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPointerDownRef.current && e.pointerId !== activePointerIdRef.current) return;
    const pt = toCanvas(e.clientX, e.clientY);
    setMousePos(pt);

    if (anchorsRef.current.length >= 2) {
      setNearFirst(dist(pt, anchorsRef.current[0]) < CLOSE_RADIUS / zoom);
    }

    if (!isPointerDownRef.current || !pointerDownPosRef.current) return;
    const down = pointerDownPosRef.current;
    const dx = pt.x - down.x;
    const dy = pt.y - down.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_MIN / zoom) {
      setPendingAnchor({
        x: down.x,
        y: down.y,
        outHandle: { x: down.x + dx, y: down.y + dy },
        inHandle: { x: down.x - dx, y: down.y - dy },
      });
    }
  }, [toCanvas, zoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerId === activePointerIdRef.current) activePointerIdRef.current = null;
    if (!isPointerDownRef.current || !pendingAnchor) return;
    isPointerDownRef.current = false;
    pointerDownPosRef.current = null;
    const newAnchors = [...anchorsRef.current, pendingAnchor];
    anchorsRef.current = newAnchors;
    setAnchors(newAnchors);
    setPendingAnchor(null);
  }, [pendingAnchor]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    commitCurrentPath(false);
  }, [commitCurrentPath]);

  if (!active) return null;

  const previewDash = dashArrayFor(settings.dashStyle, settings.strokeWidth);
  const lastAnchor = pendingAnchor ?? anchors[anchors.length - 1] ?? null;
  const closedPreview = nearFirst && !pendingAnchor;
  const previewTarget = closedPreview
    ? anchors[0]
    : (pendingAnchor ? null : mousePos);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[200] touch-none cursor-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <svg
        width={canvasW}
        height={canvasH}
        className="absolute inset-0 pointer-events-none overflow-visible"
      >
        {anchors.length >= 2 && (
          <path
            d={anchorsToPath(anchors, false)}
            fill="none"
            stroke={settings.strokeColor}
            strokeWidth={settings.strokeWidth}
            strokeLinecap={settings.lineCap}
            strokeLinejoin={settings.lineJoin}
            strokeDasharray={previewDash}
          />
        )}

        {pendingAnchor && anchors.length >= 1 && (
          <path
            d={previewSegment(anchors[anchors.length - 1], pendingAnchor)}
            fill="none"
            stroke={settings.strokeColor}
            strokeWidth={settings.strokeWidth}
            strokeLinecap={settings.lineCap}
            strokeLinejoin={settings.lineJoin}
            opacity={0.7}
          />
        )}

        {!pendingAnchor && mousePos && lastAnchor && (
          <path
            d={previewSegment(lastAnchor, closedPreview ? anchors[0] : mousePos)}
            fill="none"
            stroke={settings.strokeColor}
            strokeWidth={settings.strokeWidth}
            strokeLinecap={settings.lineCap}
            strokeLinejoin={settings.lineJoin}
            opacity={0.5}
            strokeDasharray="4 3"
          />
        )}

        {pendingAnchor?.outHandle && (
          <>
            <line
              x1={pendingAnchor.x} y1={pendingAnchor.y}
              x2={pendingAnchor.outHandle.x} y2={pendingAnchor.outHandle.y}
              stroke="var(--s-handle)" strokeWidth={1} opacity={0.8}
            />
            <line
              x1={pendingAnchor.x} y1={pendingAnchor.y}
              x2={pendingAnchor.inHandle!.x} y2={pendingAnchor.inHandle!.y}
              stroke="var(--s-handle)" strokeWidth={1} opacity={0.8}
            />
            <circle cx={pendingAnchor.outHandle.x} cy={pendingAnchor.outHandle.y} r={3} fill="var(--s-handle)" />
            <circle cx={pendingAnchor.inHandle!.x} cy={pendingAnchor.inHandle!.y} r={3} fill="var(--s-handle)" />
          </>
        )}

        {anchors.map((a, i) => (
          <g key={i}>
            {a.outHandle && (
              <>
                <line x1={a.x} y1={a.y} x2={a.outHandle.x} y2={a.outHandle.y} stroke="var(--s-handle)" strokeWidth={1} opacity={0.5} />
                <circle cx={a.outHandle.x} cy={a.outHandle.y} r={2.5} fill="var(--s-handle)" opacity={0.7} />
              </>
            )}
            {a.inHandle && (
              <>
                <line x1={a.x} y1={a.y} x2={a.inHandle.x} y2={a.inHandle.y} stroke="var(--s-handle)" strokeWidth={1} opacity={0.5} />
                <circle cx={a.inHandle.x} cy={a.inHandle.y} r={2.5} fill="var(--s-handle)" opacity={0.7} />
              </>
            )}
            <circle
              cx={a.x} cy={a.y} r={i === 0 && nearFirst ? 6 : 4}
              fill={i === 0 && nearFirst ? "var(--s-accent)" : anchorColor}
              stroke="var(--s-handle)"
              strokeWidth={1.5}
            />
          </g>
        ))}

        {pendingAnchor && (
          <circle cx={pendingAnchor.x} cy={pendingAnchor.y} r={4} fill={anchorColor} stroke="var(--s-handle)" strokeWidth={1.5} />
        )}

        {previewTarget && !pendingAnchor && mousePos && (
          <circle
            cx={mousePos.x} cy={mousePos.y} r={closedPreview ? 6 : 3}
            fill={closedPreview ? "var(--s-accent)" : "transparent"}
            stroke="var(--s-handle)" strokeWidth={1.5}
            opacity={0.7}
          />
        )}

        {mousePos && (
          <g
            transform={`translate(${mousePos.x} ${mousePos.y}) scale(${PEN_GLYPH_SCALE / zoom / 24})`}
            className="pointer-events-none"
          >
            <path
              d="M 0 0 L 9 -19 L 18 -10 L 5 -3 Z"
              fill="white"
              stroke="black"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <line x1={0} y1={0} x2={5} y2={-3} stroke="black" strokeWidth={0.8} />
            <circle cx={0} cy={0} r={1.6} fill={nearFirst ? "var(--s-accent)" : "black"} />
          </g>
        )}
      </svg>
    </div>
  );
};
