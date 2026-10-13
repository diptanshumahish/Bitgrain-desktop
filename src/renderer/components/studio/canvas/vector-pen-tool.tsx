import React, { useRef, useState, useEffect, useCallback } from "react";
import type { BezierAnchor, VectorSettings } from "../../../data/studioTypes";
import { dist } from "../../../utils/vector-utils";
import { quantizeRenderScale } from "../../../utils/render-scale";
import { PEN_ADD_CURSOR, PEN_CLOSE_CURSOR, PEN_CURSOR } from "../layers/vector-cursors";
import { PenPathPreview } from "./pen-path-preview";
import { notePenInput, shouldDrawWith } from "./pen-input";

const CLOSE_RADIUS = 12;
const DRAG_MIN = 5;

interface Point { x: number; y: number; }

interface VectorPenToolProps {
  active: boolean;
  canvasW: number;
  canvasH: number;
  zoom: number;
  isSpacePressed: () => boolean;
  settings: VectorSettings;
  isActivePage: boolean;
  flushRef: React.MutableRefObject<(() => void) | null>;
  onActivatePage: () => void;
  onFinish: (anchors: BezierAnchor[], closed: boolean) => void;
}

export const VectorPenTool: React.FC<VectorPenToolProps> = ({
  active,
  canvasW,
  canvasH,
  zoom,
  isSpacePressed,
  settings,
  isActivePage,
  flushRef,
  onActivatePage,
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
    if (!isActivePage) return;
    const flush = () => commitCurrentPath(false);
    flushRef.current = flush;
    return () => {
      if (flushRef.current === flush) flushRef.current = null;
    };
  }, [isActivePage, flushRef, commitCurrentPath]);

  useEffect(() => {
    if (!active || !isActivePage) return;
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
  }, [active, isActivePage, commitCurrentPath]);

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
    const pt = toCanvas(e.clientX, e.clientY);
    isPointerDownRef.current = true;
    pointerDownPosRef.current = pt;

    const isClosing = anchorsRef.current.length >= 2 && dist(pt, anchorsRef.current[0]) < CLOSE_RADIUS / zoom;
    if (isClosing) {
      commitCurrentPath(true);
      return;
    }
    setPendingAnchor({ x: pt.x, y: pt.y });
  }, [active, isSpacePressed, isActivePage, onActivatePage, toCanvas, zoom, commitCurrentPath]);

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

  const renderScale = quantizeRenderScale(zoom);
  const cursor = nearFirst ? PEN_CLOSE_CURSOR : anchors.length === 0 ? PEN_ADD_CURSOR : PEN_CURSOR;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[200] touch-none"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => setMousePos(null)}
      onDoubleClick={handleDoubleClick}
    >
      <svg
        width={canvasW * renderScale}
        height={canvasH * renderScale}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        className="absolute top-0 left-0 origin-top-left pointer-events-none overflow-visible"
        style={{ transform: `scale(${1 / renderScale})` }}
      >
        <PenPathPreview
          anchors={anchors}
          pendingAnchor={pendingAnchor}
          mousePos={mousePos}
          nearFirst={nearFirst}
          settings={settings}
          zoom={zoom}
        />
      </svg>
    </div>
  );
};
