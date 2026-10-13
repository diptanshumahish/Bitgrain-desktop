import React, { useState } from "react";
import { BtnGroup } from "../../../../components/studio/ui/panelPrimitives";
import type { ColorGrade, CurveChannel, CurvePoint } from "../../engine/grade-types";
import { IDENTITY_CURVE } from "../../engine/grade-defaults";
import { isIdentityCurve } from "../../engine/grade-checks";
import { CurveEditor } from "./curve-editor";
import { trackEvent } from "../../../../lib/tracker";

interface CurveControlsProps {
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

const CHANNEL_OPTIONS: Array<{ value: CurveChannel; label: string }> = [
  { value: "master", label: "rgb" },
  { value: "red", label: "red" },
  { value: "green", label: "green" },
  { value: "blue", label: "blue" },
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
        <span>click to add a point, double click to remove it</span>
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
