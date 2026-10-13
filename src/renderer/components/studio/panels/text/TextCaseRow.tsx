import React from "react";
import type { TextLayer } from "../../../../data/studioTypes";
import { BtnGroup } from "../../ui/panelPrimitives";

interface TextCaseRowProps {
  value: string;
  onChange: (transform: TextLayer["textTransform"]) => void;
}

const CASE_OPTIONS = [
  { label: "Aa", value: "none", title: "As typed" },
  { label: "AA", value: "uppercase", title: "Uppercase" },
  { label: "aa", value: "lowercase", title: "Lowercase" },
  { label: "Ab", value: "capitalize", title: "Capitalise each word" },
];

export const TextCaseRow: React.FC<TextCaseRowProps> = ({ value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Case</span>
    <div className="w-[148px]">
      <BtnGroup options={CASE_OPTIONS} value={value} onChange={(next) => onChange(next as TextLayer["textTransform"])} />
    </div>
  </div>
);
