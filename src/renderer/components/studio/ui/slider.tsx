import React, { useRef } from "react";
import { ScrubField } from "./panelPrimitives";

const SLIDER_DOT_COUNT = 11;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  decimals?: number;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  onCommit,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  suffix,
  decimals,
  disabled,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const range = max - min;
  const safeValue = Number.isFinite(value) ? value : min;
  const ratio = range > 0 ? (safeValue - min) / range : 0;
  const fillWidth = `${Math.min(100, Math.max(0, ratio * 100))}%`;

  const applyClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || range <= 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const localRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const stepped = Math.round((min + localRatio * range) / step) * step;
    onChange(Math.min(max, Math.max(min, stepped)));
  };

  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-35 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">
          {label}
        </span>
        <ScrubField
          compact
          label={null}
          value={value}
          min={min}
          max={max}
          step={step}
          suffix={suffix}
          decimals={decimals}
          disabled={disabled}
          onChange={onChange}
          onCommit={onCommit}
        />
      </div>

      <div
        ref={trackRef}
        className="relative h-[14px] flex items-center touch-none cursor-pointer"
        onPointerDown={(e) => {
          if (disabled) return;
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          applyClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          applyClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          if (!dragging.current) return;
          dragging.current = false;
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          onCommit?.();
        }}
      >
        <div className="absolute inset-x-0 h-[5px] rounded-full bg-[var(--s-bg-input-hover)]" />
        <div className="absolute inset-x-0 flex items-center justify-between px-[3px]">
          {Array.from({ length: SLIDER_DOT_COUNT }).map((_, index) => (
            <span key={index} className="w-[3px] h-[3px] rounded-full bg-[var(--s-text-subtle)] opacity-50" />
          ))}
        </div>
        <div
          className="absolute left-0 h-[5px] rounded-full bg-[var(--s-accent)]"
          style={{ width: fillWidth }}
        />
      </div>
    </div>
  );
};
