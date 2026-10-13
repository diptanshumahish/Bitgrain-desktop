import React from "react";
import type { ColorGrade, ToneRange, ToneWheel as ToneWheelValue } from "../engine/grade-types";
import { ToneWheel } from "./tone-wheel";
import { GradeSliderList } from "./grade-slider-list";
import { BALANCE_FIELD } from "./grade-slider-fields";

interface WheelControlsProps {
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

const TONE_RANGES: ToneRange[] = ["shadows", "midtones", "highlights"];

export const WheelControls: React.FC<WheelControlsProps> = ({ grade, onChange, onCommit }) => {
  const updateWheel = (range: ToneRange, wheel: ToneWheelValue): void => {
    onChange({ ...grade, wheels: { ...grade.wheels, [range]: wheel } });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {TONE_RANGES.map((range) => (
          <ToneWheel
            key={range}
            label={range}
            wheel={grade.wheels[range]}
            onChange={(wheel) => updateWheel(range, wheel)}
            onCommit={onCommit}
          />
        ))}
      </div>
      <GradeSliderList fields={[BALANCE_FIELD]} grade={grade} onChange={onChange} onCommit={onCommit} />
    </div>
  );
};
