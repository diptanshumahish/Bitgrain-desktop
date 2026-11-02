import React from "react";
import { lanePercent } from "./lane-time";

interface LaneBackdropProps {
  frameStarts: number[];
  totalMs: number;
  playheadMs: number;
}

export const LaneBackdrop: React.FC<LaneBackdropProps> = ({ frameStarts, totalMs, playheadMs }) => (
  <>
    <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--s-border)] pointer-events-none" />
    {frameStarts.map((start, index) => (
      <div
        key={index}
        className="absolute top-1 bottom-1 w-px bg-[var(--s-border)] opacity-60 pointer-events-none"
        style={{ left: lanePercent(start, totalMs) }}
      />
    ))}
    <div
      className="absolute top-0 bottom-0 w-px bg-[var(--s-accent)] pointer-events-none"
      style={{ left: lanePercent(playheadMs, totalMs) }}
    />
  </>
);
