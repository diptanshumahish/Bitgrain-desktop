import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FONT_PAIRINGS } from "../../../../data/studioTypes";

interface PairingsPanelProps {
  current: string;
  onApply: (v: string) => void;
}

const applyButtonClass = (active: boolean) =>
  `px-2 h-6 rounded-md border-none cursor-pointer text-[10px] font-editorial font-medium transition-colors ${
    active
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : "bg-[var(--s-bg-panel)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
  }`;

export const PairingsPanel: React.FC<PairingsPanelProps> = ({ current, onApply }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between bg-transparent border-none cursor-pointer p-0 text-left"
      >
        <span className="flex flex-col">
          <span className="text-[11px] text-[var(--s-text)] font-medium">Font pairings</span>
          <span className="text-[10px] text-[var(--s-text-subtle)]">Curated heading and body fonts</span>
        </span>
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          className={`text-[var(--s-text-subtle)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-1.5">
          {FONT_PAIRINGS.map((pair) => (
            <div key={pair.name} className="flex items-center gap-2 bg-[var(--s-bg-input)] rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] text-[var(--s-text)] truncate leading-tight"
                  style={{ fontFamily: pair.heading.value }}
                >
                  {pair.name}
                </div>
                <div
                  className="text-[10px] text-[var(--s-text-subtle)] truncate"
                  style={{ fontFamily: pair.body.value }}
                >
                  {pair.heading.label} + {pair.body.label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onApply(pair.heading.value)}
                className={applyButtonClass(current === pair.heading.value)}
              >
                Heading
              </button>
              <button
                type="button"
                onClick={() => onApply(pair.body.value)}
                className={applyButtonClass(current === pair.body.value)}
              >
                Body
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
