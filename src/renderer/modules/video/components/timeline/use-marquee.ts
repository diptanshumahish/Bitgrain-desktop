import React, { useRef, useState } from "react";
import {
  currentProjectSignal,
  setClipSelection,
  clearClipSelection,
} from "../../store/project-store";
import { setCurrentTime } from "../../store/timeline-store";
import { pxToTime, timeToPx } from "./timeline-math";

export interface MarqueeBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const CLICK_THRESHOLD_PX = 4;

function clipsInRect(rect: Rect, pxPerSecond: number): string[] {
  const project = currentProjectSignal.value;
  if (!project) return [];
  const ids: string[] = [];
  let top = 0;
  for (const track of project.tracks) {
    const trackTop = top;
    const trackBottom = top + track.height;
    top = trackBottom;
    if (track.locked) continue;
    if (rect.y2 < trackTop || rect.y1 > trackBottom) continue;
    for (const clip of track.clips) {
      const clipLeft = timeToPx(clip.trackStart, pxPerSecond);
      const clipRight = clipLeft + timeToPx(clip.duration, pxPerSecond);
      if (rect.x2 < clipLeft || rect.x1 > clipRight) continue;
      ids.push(clip.id);
    }
  }
  return ids;
}

interface MarqueeStart {
  x: number;
  y: number;
}

export interface MarqueeHandlers {
  containerRef: React.RefObject<HTMLDivElement | null>;
  box: MarqueeBox | null;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function useMarquee(pxPerSecond: number): MarqueeHandlers {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<MarqueeStart | null>(null);
  const [box, setBox] = useState<MarqueeBox | null>(null);

  const localPoint = (e: React.PointerEvent<HTMLDivElement>): MarqueeStart => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !containerRef.current) return;
    e.stopPropagation();
    startRef.current = localPoint(e);
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start) return;
    const point = localPoint(e);
    setBox({
      left: Math.min(start.x, point.x),
      top: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    startRef.current = null;
    setBox(null);
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    if (!start) return;
    const point = localPoint(e);
    const moved =
      Math.abs(point.x - start.x) > CLICK_THRESHOLD_PX ||
      Math.abs(point.y - start.y) > CLICK_THRESHOLD_PX;
    if (!moved) {
      clearClipSelection();
      setCurrentTime(pxToTime(point.x, pxPerSecond));
      return;
    }
    const ids = clipsInRect(
      {
        x1: Math.min(start.x, point.x),
        y1: Math.min(start.y, point.y),
        x2: Math.max(start.x, point.x),
        y2: Math.max(start.y, point.y),
      },
      pxPerSecond,
    );
    setClipSelection(ids);
  };

  return { containerRef, box, onPointerDown, onPointerMove, onPointerUp };
}
