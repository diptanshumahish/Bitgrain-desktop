import React, { useMemo } from "react";
import type { BezierCurve } from "@bitgrain/studio-core/model/animation-types";
import { setSignal, signal, useSignalValue } from "@bitgrain/core/signal";
import { BezierCurveEditor } from "./BezierCurveEditor";
import { EasingPreviewDot } from "./EasingPreviewDot";
import { DecimalField } from "./DecimalField";
import { EasingGlyph } from "./EasingGlyph";
import {
  EASING_PRESETS,
  customValue,
  displayCurve,
  easingLabel,
  matchPreset,
  type EasingValue,
} from "./easing-presets";

export interface EasingEditorProps {
  title: string;
  initial: EasingValue;
  onCommit: (value: EasingValue) => void;
  footer?: React.ReactNode;
}

const FIELD_LABELS = ["x1", "y1", "x2", "y2"] as const;
const Y_LIMIT_LOW = -1;
const Y_LIMIT_HIGH = 2;

const clampField = (index: number, value: number): number =>
  index % 2 === 0 ? Math.min(1, Math.max(0, value)) : Math.min(Y_LIMIT_HIGH, Math.max(Y_LIMIT_LOW, value));

export const EasingEditor: React.FC<EasingEditorProps> = ({ title, initial, onCommit, footer }) => {
  const valueSignal = useMemo(() => signal<EasingValue>(initial), [initial]);
  const value = useSignalValue(valueSignal);
  const curve = displayCurve(value);
  const activePreset = matchPreset(value)?.id;

  const preview = (next: BezierCurve): void => {
    setSignal(valueSignal, customValue(next));
  };

  const commit = (next: EasingValue): void => {
    setSignal(valueSignal, next);
    onCommit(next);
  };

  const commitField = (index: number, fieldValue: number): void => {
    if (!curve) return;
    const next: BezierCurve = [...curve];
    next[index] = clampField(index, fieldValue);
    commit(customValue(next));
  };

  return (
    <div className="w-[248px] p-2.5 flex flex-col gap-2 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-[var(--s-text)]">{title}</span>
        <span className="text-[12px] text-[var(--s-text-subtle)]">{easingLabel(value)}</span>
      </div>
      <BezierCurveEditor curve={curve} onChange={preview} onCommit={(next) => commit(customValue(next))} />
      <EasingPreviewDot value={value} />
      <div className="grid grid-cols-4 gap-1">
        {FIELD_LABELS.map((label, index) => (
          <DecimalField
            key={label}
            label={label}
            value={curve ? curve[index] : 0}
            disabled={!curve}
            onCommit={(fieldValue) => commitField(index, fieldValue)}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 max-h-[132px] overflow-y-auto no-scrollbar">
        {EASING_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => commit(preset.value)}
            className={`flex items-center gap-1.5 h-6 px-1.5 rounded-md text-[12px] text-left transition-colors ${
              preset.id === activePreset
                ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
                : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
            }`}
          >
            <EasingGlyph curve={displayCurve(preset.value)} />
            <span className="truncate">{preset.label}</span>
          </button>
        ))}
      </div>
      {footer}
    </div>
  );
};
