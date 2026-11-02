import React from "react";
import { Slider } from "../../../components/studio/ui/slider";
import type { ColorGrade } from "../engine/grade-types";
import type { GradeSliderField } from "./grade-slider-fields";

interface GradeSliderListProps {
  fields: readonly GradeSliderField[];
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

export const GradeSliderList: React.FC<GradeSliderListProps> = ({ fields, grade, onChange, onCommit }) => (
  <>
    {fields.map((field) => (
      <Slider
        key={field.key}
        label={field.label}
        value={grade[field.key]}
        min={field.min}
        max={field.max}
        step={field.step}
        decimals={field.decimals}
        onChange={(value) => onChange({ ...grade, [field.key]: value })}
        onCommit={onCommit}
      />
    ))}
  </>
);
