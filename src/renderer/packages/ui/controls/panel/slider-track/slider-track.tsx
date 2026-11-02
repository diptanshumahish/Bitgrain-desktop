import React, { useRef } from "react";
import { snapToStep, valueForKey } from "./slider-value";
import { releaseStretch, stretchElement } from "../../../motion/rubber-band/rubber-stretch";
import { hapticEdge, hapticStep } from "../../../../../shell/haptics";

// Desktop (PORTED.md deviation 8): a Force Touch tick as the value steps and a
// stronger one at the min/max edge. The value itself is unchanged.
const withHaptics = (onChange: (value: number) => void, value: number, min: number, max: number) =>
  (next: number): void => {
    if (next !== value) {
      if (next <= min || next >= max) hapticEdge();
      else hapticStep();
    }
    onChange(next);
  };

const SLIDER_DOT_COUNT = 11;
const PERCENT = 100;
const DOT_NEAR_RANGE = 1 / (SLIDER_DOT_COUNT - 1);
const DOT_NEAR_CLASS = "scale-[1.9] opacity-100";
const DOT_FAR_CLASS = "opacity-50";

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

const overshootPx = (rawRatio: number, width: number): number => {
  if (rawRatio < 0) return rawRatio * width;
  if (rawRatio > 1) return (rawRatio - 1) * width;
  return 0;
};

const dotClass = (dot: number, ratio: number): string =>
  Math.abs(dot / (SLIDER_DOT_COUNT - 1) - ratio) < DOT_NEAR_RANGE ? DOT_NEAR_CLASS : DOT_FAR_CLASS;

export const SliderTrack: React.FC<SliderTrackProps> = ({
  value,
  min,
  max,
  step,
  onChange: rawOnChange,
  onCommit,
  disabled,
  ariaLabel,
}) => {
  const onChange = withHaptics(rawOnChange, value, min, max);
  const trackRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
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
    const rawRatio = (clientX - rect.left) / rect.width;
    if (dragging.current) stretchElement(visualRef.current, overshootPx(rawRatio, rect.width), rect.width);
    onChange(snapToStep(min + Math.min(1, Math.max(0, rawRatio)) * range, min, max, step));
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
        releaseStretch(visualRef.current);
        event.currentTarget.releasePointerCapture(event.pointerId);
        onCommit?.();
      }}
    >
      <div ref={visualRef} className="absolute inset-0 flex items-center">
        <div className="absolute inset-x-0 h-[5px] rounded-full bg-[var(--s-bg-input-hover)]" />
        <div className="absolute inset-x-0 flex items-center justify-between px-[3px]">
          {DOT_KEYS.map((dot) => (
            <span key={dot} className={`w-[3px] h-[3px] rounded-full bg-[var(--s-text-subtle)] transition-[transform,opacity] duration-150 ${dotClass(dot, ratio)}`} />
          ))}
        </div>
        <div className="absolute left-0 h-[5px] rounded-full bg-[var(--s-accent)]" style={{ width: fillWidth }} />
      </div>
    </div>
  );
};
