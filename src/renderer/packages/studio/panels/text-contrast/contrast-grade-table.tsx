import React from "react";
import { Check, X } from "lucide-react";
import type { ContrastGrades } from "./wcag-contrast";

interface GradeMarkProps {
  pass: boolean;
}

const GradeMark: React.FC<GradeMarkProps> = ({ pass }) => (
  <span className={`flex items-center justify-center ${pass ? "text-[var(--s-text)]" : "text-red-500"}`}>
    {pass ? <Check size={12} strokeWidth={2} /> : <X size={12} strokeWidth={2} />}
  </span>
);

interface GradeRowProps {
  label: string;
  current: boolean;
  aa: boolean;
  aaa: boolean;
}

const GradeRow: React.FC<GradeRowProps> = ({ label, current, aa, aaa }) => (
  <>
    <span className={current ? "text-[var(--s-text)] font-medium" : "text-[var(--s-text-subtle)]"}>{label}</span>
    <GradeMark pass={aa} />
    <GradeMark pass={aaa} />
  </>
);

interface ContrastGradeTableProps {
  grades: ContrastGrades;
  large: boolean;
}

export const ContrastGradeTable: React.FC<ContrastGradeTableProps> = ({ grades, large }) => (
  <div className="grid grid-cols-[1fr_36px_36px] gap-y-1.5 items-center text-[12px]">
    <span />
    <span className="text-center text-[var(--s-text-subtle)]" title="Meets the WCAG AA readability standard">Good</span>
    <span className="text-center text-[var(--s-text-subtle)]" title="Meets the stricter WCAG AAA standard">Best</span>
    <GradeRow label="Normal text" current={!large} aa={grades.normalAA} aaa={grades.normalAAA} />
    <GradeRow label="Large text" current={large} aa={grades.largeAA} aaa={grades.largeAAA} />
  </div>
);
