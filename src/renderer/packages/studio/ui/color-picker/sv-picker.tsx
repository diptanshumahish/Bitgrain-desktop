import React, { useRef, useEffect, useCallback } from "react";

const PERCENT = 100;

interface SvPickerProps {
  hue: number;
  sat: number;
  val: number;
  onChange: (sat: number, val: number) => void;
}

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value));

export const SvPicker: React.FC<SvPickerProps> = ({ hue, sat, val, onChange }) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const pick = useCallback(
    (event: React.PointerEvent | PointerEvent) => {
      const area = areaRef.current;
      if (!area) return;
      const rect = area.getBoundingClientRect();
      const nextSat = clampUnit((event.clientX - rect.left) / rect.width);
      const nextVal = clampUnit(1 - (event.clientY - rect.top) / rect.height);
      onChange(nextSat, nextVal);
    },
    [onChange],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      if (draggingRef.current) pick(event);
    };
    const onUp = (): void => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pick]);

  return (
    <div
      ref={areaRef}
      className="relative w-full h-[160px] rounded-lg cursor-crosshair overflow-hidden shrink-0"
      style={{ background: `hsl(${hue}, 100%, 50%)` }}
      onPointerDown={(event) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div
        className="absolute w-4 h-4 rounded-full border-[3px] border-white ring-1 ring-black/25 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ left: `${sat * PERCENT}%`, top: `${(1 - val) * PERCENT}%` }}
      />
    </div>
  );
};
