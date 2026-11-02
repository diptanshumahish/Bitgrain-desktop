import React from "react";
import type { ToneWheel as ToneWheelValue } from "../engine/grade-types";
import { useWheelDrag } from "./use-wheel-drag";
import { trackEvent } from "../../../lib/tracker";

interface ToneWheelProps {
  label: string;
  wheel: ToneWheelValue;
  onChange: (wheel: ToneWheelValue) => void;
  onCommit?: () => void;
}

const PERCENT = 100;
const HALF = 50;
const NEUTRAL_WHEEL: ToneWheelValue = { hue: 0, amount: 0 };

const puckOffset = (wheel: ToneWheelValue): { left: string; top: string } => {
  const radians = (wheel.hue * Math.PI) / 180;
  const reach = (wheel.amount / PERCENT) * HALF;
  return {
    left: `${HALF + Math.cos(radians) * reach}%`,
    top: `${HALF + Math.sin(radians) * reach}%`,
  };
};

export const ToneWheel: React.FC<ToneWheelProps> = ({ label, wheel, onChange, onCommit }) => {
  const drag = useWheelDrag(onChange, onCommit);

  const reset = (): void => {
    onChange(NEUTRAL_WHEEL);
    onCommit?.();
    trackEvent("grading", "wheel_reset", { details: { range: label } });
  };

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div
        ref={drag.wheelRef}
        role="slider"
        aria-label={`${label} color`}
        aria-valuenow={wheel.amount}
        title="drag to tint, double click to reset"
        className="relative w-full max-w-[76px] aspect-square rounded-full touch-none cursor-crosshair bg-[conic-gradient(from_90deg,hsl(0_85%_58%),hsl(60_85%_58%),hsl(120_85%_58%),hsl(180_85%_58%),hsl(240_85%_58%),hsl(300_85%_58%),hsl(360_85%_58%))]"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onDoubleClick={reset}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,var(--s-bg-panel),transparent)] pointer-events-none" />
        <div
          className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)] pointer-events-none"
          style={puckOffset(wheel)}
        />
      </div>
      <span className="text-[10.5px] text-[var(--s-text-subtle)]">{label}</span>
      <span className="text-[10px] text-[var(--s-text-muted)] tabular-nums">{wheel.amount}</span>
    </div>
  );
};
