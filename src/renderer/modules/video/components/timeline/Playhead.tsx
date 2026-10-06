import React from "react";
import { TRACK_HEADER_WIDTH } from "../../constants";
import { useSignalValue } from "../../../../lib/signal";
import { currentTimeSignal } from "../../store/timeline-store";

interface PlayheadProps {
  pxPerSecond: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ pxPerSecond }) => {
  const time = useSignalValue(currentTimeSignal);
  const left = TRACK_HEADER_WIDTH + time * pxPerSecond;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-35"
      style={{ left }}
    >
      <div className="absolute top-0 -translate-x-1/2 w-2 h-3 bg-amber-400" />
      <div className="absolute top-0 left-0 w-px h-full bg-amber-400/80" />
    </div>
  );
};
