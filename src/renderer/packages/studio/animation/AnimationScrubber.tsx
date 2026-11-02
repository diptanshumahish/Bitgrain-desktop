import React, { useRef } from "react";

interface AnimationScrubberProps {
  totalMs: number;
  playheadMs: number;
  starts: number[];
  onScrub: (ms: number) => void;
}

export const AnimationScrubber: React.FC<AnimationScrubberProps> = ({
  totalMs,
  playheadMs,
  starts,
  onScrub,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const msFromEvent = (clientX: number): number => {
    const el = trackRef.current;
    if (!el || totalMs <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * totalMs;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(msFromEvent(event.clientX));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    onScrub(msFromEvent(event.clientX));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const playheadRatio = totalMs > 0 ? Math.min(playheadMs / totalMs, 1) : 0;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative flex-1 h-8 flex items-center cursor-pointer select-none"
    >
      <div className="absolute left-0 right-0 h-1 rounded-full bg-[var(--s-bg-input)]" />
      <div
        className="absolute h-1 rounded-full bg-[var(--s-text-subtle)]"
        style={{ width: `${playheadRatio * 100}%` }}
      />
      {starts.map((start, index) => (
        <div
          key={index}
          className="absolute w-px h-2.5 bg-[var(--s-border)]"
          style={{ left: `${totalMs > 0 ? Math.min((start / totalMs) * 100, 100) : 0}%` }}
        />
      ))}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-[var(--s-text)] -translate-x-1/2"
        style={{ left: `${playheadRatio * 100}%` }}
      />
    </div>
  );
};
