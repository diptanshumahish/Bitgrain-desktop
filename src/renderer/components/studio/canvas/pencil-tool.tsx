import React, { useRef, useState, useEffect, useCallback } from "react";
import type { VectorSettings, InkPoint } from "../../../data/studioTypes";
import { simplifyPoints, pointsToAnchors } from "../../../utils/vector-utils";
import { inkStrokeToPath } from "../../../utils/ink-stroke";
import { notePenInput, shouldDrawWith } from "./pen-input";

const polylinePath = (pts: { x: number; y: number }[]): string =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

const MIN_DIST = 3;
const SIMPLIFY_EPSILON = 2.5;

const PENCIL_CURSOR = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" fill="white" stroke="black" stroke-width="1.2"/><path d="m15 5 4 4" stroke="black" stroke-width="1.2"/></svg>')}") 2 22, crosshair`;

const pressureOf = (event: { pressure: number; pointerType: string }): number => {
  if (event.pointerType === "pen" && event.pressure > 0) return event.pressure;
  return 0.5;
};

interface PencilToolProps {
  active: boolean;
  canvasW: number;
  canvasH: number;
  zoom: number;
  isSpacePressed: () => boolean;
  settings: VectorSettings;
  inkMode: boolean;
  isActivePage: boolean;
  flushRef: React.MutableRefObject<(() => void) | null>;
  onActivatePage: () => void;
  onStrokeFinished: (anchors: ReturnType<typeof pointsToAnchors>) => void;
  onInkFinish: (strokes: InkPoint[][]) => void;
}

export const PencilTool: React.FC<PencilToolProps> = ({
  active,
  canvasW,
  canvasH,
  zoom,
  isSpacePressed,
  settings,
  inkMode,
  isActivePage,
  flushRef,
  onActivatePage,
  onStrokeFinished,
  onInkFinish,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const pointsRef = useRef<InkPoint[]>([]);
  const sessionStrokesRef = useRef<InkPoint[][]>([]);
  const [displayPoints, setDisplayPoints] = useState<InkPoint[]>([]);
  const [sessionStrokes, setSessionStrokes] = useState<InkPoint[][]>([]);

  const onInkFinishRef = useRef(onInkFinish);
  useEffect(() => {
    onInkFinishRef.current = onInkFinish;
  }, [onInkFinish]);
  useEffect(() => {
    return () => {
      if (sessionStrokesRef.current.length > 0) onInkFinishRef.current(sessionStrokesRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActivePage) return;
    const flush = () => {
      if (sessionStrokesRef.current.length === 0) return;
      onInkFinishRef.current(sessionStrokesRef.current);
      sessionStrokesRef.current = [];
      setSessionStrokes([]);
    };
    flushRef.current = flush;
    return () => {
      if (flushRef.current === flush) flushRef.current = null;
    };
  }, [isActivePage, flushRef]);

  const toCanvas = useCallback((clientX: number, clientY: number, pressure: number): InkPoint => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom, pressure };
  }, [zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!active || isSpacePressed() || e.button !== 0) return;
    notePenInput(e.pointerType);
    if (!shouldDrawWith(e.pointerType)) return;
    if (activePointerIdRef.current !== null) return;
    e.stopPropagation();
    e.preventDefault();
    if (!isActivePage) onActivatePage();
    overlayRef.current!.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    isDrawingRef.current = true;
    const pt = toCanvas(e.clientX, e.clientY, pressureOf(e));
    pointsRef.current = [pt];
    setDisplayPoints([pt]);
  }, [active, isSpacePressed, isActivePage, onActivatePage, toCanvas]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current || e.pointerId !== activePointerIdRef.current) return;
    const native = e.nativeEvent;
    const samples =
      typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const moves = samples.length > 0 ? samples : [native];
    const additions: InkPoint[] = [];
    let last = pointsRef.current[pointsRef.current.length - 1];
    for (const sample of moves) {
      const pt = toCanvas(sample.clientX, sample.clientY, pressureOf(sample));
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) continue;
      additions.push(pt);
      last = pt;
    }
    if (additions.length === 0) return;
    pointsRef.current = [...pointsRef.current, ...additions];
    setDisplayPoints(pointsRef.current);
  }, [toCanvas]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== activePointerIdRef.current) return;
    activePointerIdRef.current = null;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const raw = pointsRef.current;
    pointsRef.current = [];
    setDisplayPoints([]);
    if (raw.length < 2) return;
    if (inkMode) {
      sessionStrokesRef.current = [...sessionStrokesRef.current, raw];
      setSessionStrokes(sessionStrokesRef.current);
      return;
    }
    const simplified = simplifyPoints(raw, SIMPLIFY_EPSILON);
    onStrokeFinished(pointsToAnchors(simplified));
  }, [inkMode, onStrokeFinished]);

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[200] touch-none"
      style={{ cursor: PENCIL_CURSOR }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg width={canvasW} height={canvasH} className="absolute inset-0 pointer-events-none overflow-visible">
        {inkMode ? (
          <>
            {sessionStrokes.map((stroke, index) => (
              <path key={index} d={inkStrokeToPath(stroke, settings.strokeWidth)} fill={settings.strokeColor} />
            ))}
            {displayPoints.length > 0 && (
              <path d={inkStrokeToPath(displayPoints, settings.strokeWidth)} fill={settings.strokeColor} opacity={0.85} />
            )}
          </>
        ) : (
          displayPoints.length > 1 && (
            <path
              d={polylinePath(displayPoints)}
              fill="none"
              stroke={settings.strokeColor}
              strokeWidth={settings.strokeWidth}
              strokeLinecap={settings.lineCap}
              strokeLinejoin={settings.lineJoin}
              opacity={0.85}
            />
          )
        )}
      </svg>
    </div>
  );
};
