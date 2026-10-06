import React from "react";
import type { DashStyle } from "../../../data/studioTypes";

interface DashStyleToggleProps {
  value: DashStyle;
  onChange: (style: DashStyle) => void;
}

const STYLES: { value: DashStyle; dash: string }[] = [
  { value: "solid", dash: "0" },
  { value: "dashed", dash: "5 3" },
  { value: "dotted", dash: "0.5 3" },
];

export const DashStyleToggle: React.FC<DashStyleToggleProps> = ({ value, onChange }) => (
  <div className="flex flex-row items-center gap-1 bg-[var(--s-bg-input)] rounded-lg p-0.5">
    {STYLES.map((style) => (
      <button
        key={style.value}
        onClick={() => onChange(style.value)}
        title={style.value}
        className={`w-7 h-6 flex items-center justify-center rounded-md border-none outline-none cursor-pointer ${
          value === style.value ? "bg-[var(--s-bg-panel)]" : "bg-transparent"
        }`}
      >
        <svg viewBox="0 0 20 6" width="20" height="6">
          <line
            x1="1"
            y1="3"
            x2="19"
            y2="3"
            stroke="var(--s-text)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={style.dash}
          />
        </svg>
      </button>
    ))}
  </div>
);
