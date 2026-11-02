import React from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";

interface TextAlignButtonsProps {
  value: TextLayer["align"];
  onChange: (align: TextLayer["align"]) => void;
}

const ICON_SIZE = 18;

const ALIGNMENTS: { value: TextLayer["align"]; label: string; icon: React.ReactNode }[] = [
  { value: "left", label: "Align left", icon: <AlignLeft size={ICON_SIZE} strokeWidth={2} /> },
  { value: "center", label: "Align center", icon: <AlignCenter size={ICON_SIZE} strokeWidth={2} /> },
  { value: "right", label: "Align right", icon: <AlignRight size={ICON_SIZE} strokeWidth={2} /> },
];

export const TextAlignButtons: React.FC<TextAlignButtonsProps> = ({ value, onChange }) => (
  <div className="flex items-center rounded-xl bg-[var(--s-bg-input)] p-0.5">
    {ALIGNMENTS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-label={option.label}
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={`w-11 h-10 flex items-center justify-center rounded-[10px] transition-colors ${
          value === option.value ? "bg-[var(--s-bg-panel)] text-[var(--s-text)] " : "text-[var(--s-text-muted)]"
        }`}
      >
        {option.icon}
      </button>
    ))}
  </div>
);
