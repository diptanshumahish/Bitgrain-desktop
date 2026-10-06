import React from "react";
import { Diamond, Link2 } from "lucide-react";
import { ScrubField } from "./panelPrimitives";
import { useAspectLocked, toggleAspectLock } from "../../../store/aspect-lock-store";

const MIN_DIMENSION = 10;
const MAX_RADIUS = 400;

const cornerRadiusIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 5h-9a7 7 0 0 0-7 7v8" />
  </svg>
);

export interface PositionSizeValues {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  borderRadius: number;
}

interface PositionSizeFieldsProps {
  values: PositionSizeValues;
  onChange: (updates: Partial<PositionSizeValues>) => void;
  showRadius?: boolean;
}

export const PositionSizeFields: React.FC<PositionSizeFieldsProps> = ({
  values,
  onChange,
  showRadius = true,
}) => {
  const lockAspect = useAspectLocked();

  const changeWidth = (width: number) => {
    if (lockAspect && values.width > 0) {
      const ratio = values.height / values.width;
      onChange({ width, height: Math.round(width * ratio) });
      return;
    }
    onChange({ width });
  };

  const changeHeight = (height: number) => {
    if (lockAspect && values.height > 0) {
      const ratio = values.width / values.height;
      onChange({ height, width: Math.round(height * ratio) });
      return;
    }
    onChange({ height });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="X" value={values.x} onChange={(v) => onChange({ x: v })} />
        <ScrubField label="Y" value={values.y} onChange={(v) => onChange({ y: v })} />
      </div>

      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <ScrubField label="W" value={values.width} min={MIN_DIMENSION} onChange={changeWidth} />
          <ScrubField label="H" value={values.height} min={MIN_DIMENSION} onChange={changeHeight} />
        </div>
        <button
          type="button"
          title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
          onClick={toggleAspectLock}
          className={`w-8 h-[28px] rounded-md border flex items-center justify-center transition-colors shrink-0 ${
            lockAspect
              ? "border-[var(--s-accent)] text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
              : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
          }`}
        >
          <Link2 size={13} strokeWidth={1.75} />
        </button>
      </div>

      {showRadius ? (
        <div className="grid grid-cols-2 gap-2">
          <ScrubField
            label={cornerRadiusIcon}
            value={values.borderRadius}
            min={0}
            max={MAX_RADIUS}
            onChange={(v) => onChange({ borderRadius: v })}
          />
          <ScrubField
            label={<Diamond size={12} strokeWidth={1.75} />}
            value={values.rotation}
            min={-360}
            max={360}
            step={1}
            suffix="°"
            onChange={(v) => onChange({ rotation: v })}
          />
        </div>
      ) : (
        <ScrubField
          label={<Diamond size={12} strokeWidth={1.75} />}
          value={values.rotation}
          min={-360}
          max={360}
          step={1}
          suffix="°"
          onChange={(v) => onChange({ rotation: v })}
        />
      )}
    </div>
  );
};
