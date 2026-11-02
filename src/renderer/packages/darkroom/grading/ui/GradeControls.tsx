import React from "react";
import { RotateCcw } from "lucide-react";
import type { ColorGrade } from "@bitgrain/engine/grading/engine/grade-types";
import { DEFAULT_COLOR_GRADE } from "@bitgrain/engine/grading/engine/grade-defaults";
import { isNeutralGrade } from "@bitgrain/engine/grading/engine/grade-checks";
import { GradeSection } from "./grade-section";
import { GradeSliderList } from "./grade-slider-list";
import { COLOR_FIELDS, LIGHT_FIELDS } from "./grade-slider-fields";
import { CurveControls } from "./curves/curve-controls";
import { HslControls } from "./hsl-controls";
import { WheelControls } from "./wheel-controls";
import { trackEvent } from "@bitgrain/platform/tracker";

interface GradeControlsProps {
  grade: ColorGrade | undefined;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

export const GradeControls: React.FC<GradeControlsProps> = ({ grade = DEFAULT_COLOR_GRADE, onChange, onCommit }) => {
  const resetAll = (): void => {
    onChange(DEFAULT_COLOR_GRADE);
    onCommit?.();
    trackEvent("grading", "grade_reset");
  };

  return (
    <div className="flex flex-col">
      <GradeSection title="Light" defaultOpen>
        <GradeSliderList fields={LIGHT_FIELDS} grade={grade} onChange={onChange} onCommit={onCommit} />
      </GradeSection>
      <GradeSection title="White balance">
        <GradeSliderList fields={COLOR_FIELDS} grade={grade} onChange={onChange} onCommit={onCommit} />
      </GradeSection>
      <GradeSection title="Curves">
        <CurveControls grade={grade} onChange={onChange} onCommit={onCommit} />
      </GradeSection>
      <GradeSection title="Color mixer">
        <HslControls grade={grade} onChange={onChange} onCommit={onCommit} />
      </GradeSection>
      <GradeSection title="Color wheels">
        <WheelControls grade={grade} onChange={onChange} onCommit={onCommit} />
      </GradeSection>
      {!isNeutralGrade(grade) && (
        <button
          type="button"
          onClick={resetAll}
          className="mt-1 flex items-center gap-1.5 w-fit text-[11px] text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] bg-transparent border-none cursor-pointer"
        >
          <RotateCcw size={11} strokeWidth={2} /> Reset grade
        </button>
      )}
    </div>
  );
};
