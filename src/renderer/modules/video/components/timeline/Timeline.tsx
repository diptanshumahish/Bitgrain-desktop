import React, { useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Magnet } from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import { currentProjectSignal, updateProject } from "../../store/project-store";
import { dropLockedFromSelection } from "../../utils/clip-edits/drop-locked-selection";
import {
  timelineZoomSignal,
  snapEnabledSignal,
  snapIndicatorSignal,
  setCurrentTime,
  setTimelineZoom,
  toggleSnap,
} from "../../store/timeline-store";
import {
  TRACK_HEADER_WIDTH,
  TIME_RULER_HEIGHT,
  TIMELINE_MIN_VISIBLE_SECONDS,
  TIMELINE_TAIL_SECONDS,
} from "../../constants";
import { TimeRuler } from "./TimeRuler";
import { CacheBar } from "./CacheBar";
import { ToolBar } from "./ToolBar";
import { Playhead } from "./Playhead";
import { TrackHeader } from "./TrackHeader";
import { TrackRow } from "./TrackRow";
import { AddTrackButton } from "./AddTrackButton";
import { nextZoomLevel, pxToTime } from "./timeline-math";
import { useMarquee } from "./use-marquee";
import { projectMarkers, projectRangeIn, projectRangeOut } from "../../store/markers-store";
import { trackEvent } from "../../../../lib/tracker";

const ZOOM_IN_FACTOR = 1.25;
const ZOOM_OUT_FACTOR = 0.8;

interface TimelineProps {
  height: number;
}

export const Timeline: React.FC<TimelineProps> = ({ height }) => {
  const project = useSignalValue(currentProjectSignal);
  const pxPerSecond = useSignalValue(timelineZoomSignal);
  const snapEnabled = useSignalValue(snapEnabledSignal);
  const snapIndicator = useSignalValue(snapIndicatorSignal);
  const markers = projectMarkers(project);
  const rangeIn = projectRangeIn(project);
  const rangeOut = projectRangeOut(project);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const {
    containerRef: marqueeRef,
    box: marqueeBox,
    onPointerDown: onMarqueeDown,
    onPointerMove: onMarqueeMove,
    onPointerUp: onMarqueeUp,
  } = useMarquee(pxPerSecond);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorTimePx =
        e.clientX - rect.left + el.scrollLeft - TRACK_HEADER_WIDTH;
      const cursorTime = pxToTime(cursorTimePx, timelineZoomSignal.value);
      const factor = e.deltaY < 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR;
      const newZoom = nextZoomLevel(timelineZoomSignal.value, factor);
      setTimelineZoom(newZoom);
      requestAnimationFrame(() => {
        const newCursorPx = cursorTime * newZoom + TRACK_HEADER_WIDTH;
        el.scrollLeft = newCursorPx - (e.clientX - rect.left);
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  if (!project) return <div className="flex-1 bg-[var(--s-bg-canvas)] opacity-50" />;

  const contentSeconds =
    Math.max(project.duration, TIMELINE_MIN_VISIBLE_SECONDS) +
    TIMELINE_TAIL_SECONDS;
  const contentWidthPx = contentSeconds * pxPerSecond;

  const toggleLocked = (id: string) => {
    updateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id === id ? ({ ...t, locked: !t.locked } as typeof t) : t,
      ),
    }));
    dropLockedFromSelection();
    trackEvent("video", "track_locked_toggle", { details: { track_id: id } });
  };
  const toggleMuted = (id: string) =>
    updateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id === id ? ({ ...t, muted: !t.muted } as typeof t) : t,
      ),
    }));
  const toggleVisible = (id: string) =>
    updateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id === id ? ({ ...t, visible: !t.visible } as typeof t) : t,
      ),
    }));

  const handleScrub = (e: React.MouseEvent | React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft - TRACK_HEADER_WIDTH;
    setCurrentTime(Math.max(0, pxToTime(x, pxPerSecond)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".cursor-grab")) return;

    scrubbingRef.current = true;
    handleScrub(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (scrubbingRef.current) {
      handleScrub(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    scrubbingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore release errors */
    }
  };

  const handleZoom = (factor: number) => {
    setTimelineZoom(nextZoomLevel(pxPerSecond, factor));
  };

  return (
    <div
      style={{ height }}
      className="shrink-0 flex flex-col bg-[var(--s-bg-panel)] min-h-0 overflow-hidden"
    >
      <div className="h-7 shrink-0 flex items-center justify-between px-3 border-b border-[var(--s-border)] bg-[var(--s-bg-panel-alt)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--s-text-subtle)]">timeline</span>
          <ToolBar />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSnap}
            aria-pressed={snapEnabled}
            className={`w-6 h-6 rounded flex items-center justify-center mr-1 ${
              snapEnabled
                ? "text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
                : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
            }`}
            aria-label={snapEnabled ? "Snapping on" : "Snapping off"}
          >
            <Magnet size={11} />
          </button>
          <button
            onClick={() => handleZoom(ZOOM_OUT_FACTOR)}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
            aria-label="Zoom out"
          >
            <ZoomOut size={11} />
          </button>
          <span className="text-[9px] text-[var(--s-text-subtle)] tabular-nums w-10 text-right">
            {Math.round(pxPerSecond)}px/s
          </span>
          <button
            onClick={() => handleZoom(ZOOM_IN_FACTOR)}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
            aria-label="Zoom in"
          >
            <ZoomIn size={11} />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="relative overflow-auto no-scrollbar flex-1 bg-[var(--s-bg-canvas)] select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="min-w-max min-h-full flex flex-col">
          {/* Sticky Ruler Row */}
          <div className="sticky top-0 z-30 flex bg-[var(--s-bg-panel)]">
            <div
              className="sticky left-0 z-50 bg-[var(--s-bg-panel)] border-r border-b border-[var(--s-border)] shrink-0"
              style={{ width: TRACK_HEADER_WIDTH, height: TIME_RULER_HEIGHT }}
            />
            <div className="flex-1 relative" style={{ minWidth: contentWidthPx }}>
              <TimeRuler
                pxPerSecond={pxPerSecond}
                durationSec={contentSeconds}
                markers={markers}
                rangeIn={rangeIn}
                rangeOut={rangeOut}
              />
              <CacheBar pxPerSecond={pxPerSecond} fps={project.fps || 30} />
            </div>
          </div>

          <div className="flex flex-1">
            {/* Sticky Track Headers Column */}
            <div className="sticky left-0 z-40 shrink-0 bg-[var(--s-bg-panel)] border-r border-[var(--s-border)]">
              {project.tracks.map((track, idx) => (
                <TrackHeader
                  key={track.id}
                  track={track}
                  index={idx}
                  total={project.tracks.length}
                  onToggleLocked={toggleLocked}
                  onToggleMuted={toggleMuted}
                  onToggleVisible={toggleVisible}
                />
              ))}
              <AddTrackButton />
            </div>

            {/* Track Content Area */}
            <div
              ref={marqueeRef}
              className="flex-1 relative"
              style={{ minWidth: contentWidthPx }}
              onPointerDown={onMarqueeDown}
              onPointerMove={onMarqueeMove}
              onPointerUp={onMarqueeUp}
            >
              {project.tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  pxPerSecond={pxPerSecond}
                />
              ))}
              {marqueeBox && (
                <div
                  className="absolute z-30 pointer-events-none border border-[var(--s-accent)] bg-[var(--s-accent-soft)]"
                  style={{
                    left: marqueeBox.left,
                    top: marqueeBox.top,
                    width: marqueeBox.width,
                    height: marqueeBox.height,
                  }}
                />
              )}
              {snapIndicator !== null && (
                <div
                  className="absolute top-0 bottom-0 z-40 w-0 border-l border-dashed border-[var(--s-accent)] pointer-events-none"
                  style={{ left: snapIndicator * pxPerSecond }}
                />
              )}
              {(rangeIn !== null || rangeOut !== null) && (
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none bg-[var(--s-accent)]/5"
                  style={{
                    left: (rangeIn ?? 0) * pxPerSecond,
                    width: Math.max(
                      0,
                      ((rangeOut ?? contentSeconds) - (rangeIn ?? 0)) * pxPerSecond,
                    ),
                  }}
                />
              )}
              {rangeIn !== null && (
                <div
                  className="absolute top-0 bottom-0 z-30 w-0 border-l-2 border-emerald-400 pointer-events-none"
                  style={{ left: rangeIn * pxPerSecond }}
                />
              )}
              {rangeOut !== null && (
                <div
                  className="absolute top-0 bottom-0 z-30 w-0 border-l-2 border-rose-400 pointer-events-none"
                  style={{ left: rangeOut * pxPerSecond }}
                />
              )}
              {markers.map((markerTime) => (
                <div
                  key={`marker-${markerTime}`}
                  className="absolute top-0 bottom-0 z-30 w-0 border-l border-yellow-400 pointer-events-none"
                  style={{ left: markerTime * pxPerSecond }}
                />
              ))}
            </div>
          </div>
          <Playhead pxPerSecond={pxPerSecond} />
        </div>
      </div>
    </div>
  );
};
