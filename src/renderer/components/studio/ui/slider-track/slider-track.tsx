import React, { useRef } from "react";
import { snapToStep, valueForKey } from "./slider-value";

const SLIDER_DOT_COUNT = 11;
const PERCENT = 100;

interface SliderTrackProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const DOT_KEYS = Array.from({ length: SLIDER_DOT_COUNT }, (_, index) => index);

export const SliderTrack: React.FC<SliderTrackProps> = ({
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
  disabled,
  ariaLabel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const range = max - min;
  const safeValue = Number.isFinite(value) ? value : min;
  const ratio = range > 0 ? (safeValue - min) / range : 0;
  const fillWidth = `${Math.min(PERCENT, Math.max(0, ratio * PERCENT))}%`;

  const applyClientX = (clientX: number): void => {
    const track = trackRef.current;
    if (!track || range <= 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const localRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(snapToStep(min + localRatio * range, min, max, step));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const next = valueForKey(event.key, safeValue, min, max, step);
    if (next === null) return;
    event.preventDefault();
    onChange(next);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      aria-disabled={disabled}
      className={`relative h-[14px] w-full flex items-center touch-none cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-accent)]/40 ${
        disabled ? "pointer-events-none" : ""
      }`}
      onKeyDown={handleKeyDown}
      onKeyUp={() => onCommit?.()}
      onPointerDown={(event) => {
        if (disabled) return;
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        applyClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        applyClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        if (!dragging.current) return;
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
        onCommit?.();
      }}
    >
      <div className="absolute inset-x-0 h-[5px] rounded-full bg-[var(--s-bg-input-hover)]" />
      <div className="absolute inset-x-0 flex items-center justify-between px-[3px]">
        {DOT_KEYS.map((dot) => (
          <span key={dot} className="w-[3px] h-[3px] rounded-full bg-[var(--s-text-subtle)] opacity-50" />
        ))}
      </div>
      <div className="absolute left-0 h-[5px] rounded-full bg-[var(--s-accent)]" style={{ width: fillWidth }} />
    </div>
  );
};
