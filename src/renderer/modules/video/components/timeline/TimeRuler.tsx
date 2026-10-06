import React from "react";
import { TIME_RULER_HEIGHT } from "../../constants";
import { formatShortTime } from "../../utils/time-format";
import { pickTickInterval } from "./timeline-math";
import { setCurrentTime } from "../../store/timeline-store";

interface TimeRulerProps {
  pxPerSecond: number;
  durationSec: number;
  markers: number[];
  rangeIn: number | null;
  rangeOut: number | null;
}

export const TimeRuler: React.FC<TimeRulerProps> = ({
  pxPerSecond,
  durationSec,
  markers,
  rangeIn,
  rangeOut,
}) => {
  const visibleEnd = Math.max(durationSec, 30);
  const interval = pickTickInterval(pxPerSecond);
  const minorInterval = interval / 5;
  const ticks: number[] = [];
  for (let t = 0; t <= visibleEnd; t += interval) {
    ticks.push(t);
  }
  const minorTicks: number[] = [];
  for (let t = 0; t <= visibleEnd; t += minorInterval) {
    if (Math.abs((t / interval) - Math.round(t / interval)) > 0.01) {
      minorTicks.push(t);
    }
  }

  return (
    <div
      className="relative shrink-0 border-b border-[var(--s-border)] bg-transparent"
      style={{
        height: TIME_RULER_HEIGHT,
      }}
    >
      {minorTicks.map((t) => (
        <div
          key={`m-${t}`}
          className="absolute bottom-0 w-px h-1 bg-[var(--s-border)]/50"
          style={{ left: t * pxPerSecond }}
        />
      ))}
      {ticks.map((t) => (
        <div
          key={t}
          className="absolute top-0 bottom-0 flex flex-col items-start"
          style={{ left: t * pxPerSecond }}
        >
          <div className="w-px h-3 bg-[var(--s-text-subtle)]/60" />
          <span className="text-[9px] text-[var(--s-text-subtle)] mt-0.5 ml-1 tabular-nums">
            {formatShortTime(t)}
          </span>
        </div>
      ))}
      {rangeIn !== null && (
        <div
          className="absolute top-0 w-0 border-l-2 border-emerald-400"
          style={{ left: rangeIn * pxPerSecond, height: TIME_RULER_HEIGHT }}
        />
      )}
      {rangeOut !== null && (
        <div
          className="absolute top-0 w-0 border-l-2 border-rose-400"
          style={{ left: rangeOut * pxPerSecond, height: TIME_RULER_HEIGHT }}
        />
      )}
      {markers.map((markerTime) => (
        <button
          key={`flag-${markerTime}`}
          onClick={() => setCurrentTime(markerTime)}
          aria-label="Jump to marker"
          className="absolute top-0 w-2 h-2 -translate-x-1/2 bg-yellow-400 hover:scale-125 transition-transform [clip-path:polygon(0_0,100%_0,50%_100%)]"
          style={{ left: markerTime * pxPerSecond }}
        />
      ))}
    </div>
  );
};
