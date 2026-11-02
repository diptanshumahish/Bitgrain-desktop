import React, { useState } from "react";
import type { ColorGrade } from "../engine/grade-types";
import type { MaskLayer } from "../mask/mask-types";
import { ScopedGradePanel } from "../mask-ui/ScopedGradePanel";

interface StudioScopedGradeProps {
  grade: ColorGrade | undefined;
  masks: MaskLayer[] | undefined;
  sourceUrl: string | null;
  hasEffect: boolean;
  onChange: (updates: { colorGrade?: ColorGrade; masks?: MaskLayer[] }) => void;
}

export const StudioScopedGrade: React.FC<StudioScopedGradeProps> = ({ grade, masks, sourceUrl, hasEffect, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <ScopedGradePanel
      grade={grade}
      masks={masks}
      selectedId={selectedId}
      sourceUrl={sourceUrl}
      hasEffect={hasEffect}
      onGradeChange={(colorGrade) => onChange({ colorGrade })}
      onMasksChange={(next) => onChange({ masks: next })}
      onSelect={setSelectedId}
    />
  );
};
