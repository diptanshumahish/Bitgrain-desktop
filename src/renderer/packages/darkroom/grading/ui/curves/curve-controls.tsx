import React, { useState } from "react";
import { BtnGroup } from "@bitgrain/ui/controls/panel/panelPrimitives";
import type { ColorGrade, CurveChannel, CurvePoint } from "@bitgrain/engine/grading/engine/grade-types";
import { IDENTITY_CURVE } from "@bitgrain/engine/grading/engine/grade-defaults";
import { isIdentityCurve } from "@bitgrain/engine/grading/engine/grade-checks";
import { CurveEditor } from "./curve-editor";
import { trackEvent } from "@bitgrain/platform/tracker";

interface CurveControlsProps {
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

const CHANNEL_OPTIONS: Array<{ value: CurveChannel; label: string }> = [
  { value: "master", label: "RGB" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

export const CurveControls: React.FC<CurveControlsProps> = ({ grade, onChange, onCommit }) => {
  const [channel, setChannel] = useState<CurveChannel>("master");
  const points = grade.curves[channel];

  const updatePoints = (next: CurvePoint[]): void => {
    onChange({ ...grade, curves: { ...grade.curves, [channel]: next } });
  };

  const resetChannel = (): void => {
    updatePoints([...IDENTITY_CURVE]);
    onCommit?.();
    trackEvent("grading", "curve_reset", { details: { channel } });
  };

  return (
    <div className="flex flex-col gap-2">
      <BtnGroup options={CHANNEL_OPTIONS} value={channel} onChange={(value) => setChannel(value as CurveChannel)} />
      <CurveEditor channel={channel} points={points} onChange={updatePoints} onCommit={onCommit} />
      <div className="flex items-center justify-between text-[10.5px] text-[var(--s-text-subtle)]">
        <span>Click to add a point, double click to remove it</span>
        {!isIdentityCurve(points) && (
          <button
            type="button"
            onClick={resetChannel}
            className="bg-transparent border-none cursor-pointer text-[var(--s-text-subtle)] hover:text-[var(--s-accent)]"
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
};
