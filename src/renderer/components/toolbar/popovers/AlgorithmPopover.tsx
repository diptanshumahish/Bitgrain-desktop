import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { DitherMethod } from "../../../engine/types";

interface AlgorithmPopoverProps {
  ditherMethod: DitherMethod;
  setDitherMethod: (m: DitherMethod) => void;
  ditherFactor: number;
  setDitherFactor: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const DITHER_GROUPS = [
  {
    label: "Error Diffusion",
    options: [
      "floyd-steinberg",
      "atkinson",
      "sierra",
      "sierra-2",
      "sierra-lite",
      "stucki",
      "burkes",
      "jjn",
    ],
  },
  {
    label: "Ordered",
    options: [
      "bayer-2",
      "bayer-4",
      "bayer-8",
      "blue-noise",
      "threshold",
      "random",
    ],
  },
];

const GLYPHS: Record<string, string> = {
  "floyd-steinberg": "▒░▓▒",
  atkinson: "·∷∵·",
  sierra: "╬╪╫╬",
  "sierra-2": "╫╪╬╫",
  "sierra-lite": "∙░∙░",
  stucki: "▓▒░▓",
  burkes: "⁚∶⁚∶",
  jjn: "▞▚▞▚",
  "bayer-2": "▖▗▘▙",
  "bayer-4": "▛▜▟▙",
  "bayer-8": "█▉▊▋",
  "blue-noise": "∿∾∿∾",
  threshold: "━┅━┅",
  random: "⁂※⁂※",
};

export const AlgorithmPopover: React.FC<AlgorithmPopoverProps> = ({
  ditherMethod,
  setDitherMethod,
  ditherFactor,
  setDitherFactor,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => (
  <Popover onClose={onClose} className="w-48" static={isStatic}>
    <PopoverSection title="Algorithm">
      <div className={isStatic ? "" : "max-h-52 overflow-y-auto"}>
        {DITHER_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-[var(--s-text-subtle)] px-2 pt-1 pb-0.5     ">
              {group.label}
            </p>
            {group.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setDitherMethod(opt as DitherMethod)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all flex items-center justify-between ${
                  ditherMethod === opt
                    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                    : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
                }`}
              >
                <span>{opt.replace(/-/g, " ")}</span>
                <span
                  className={`text-[9px]     shrink-0 ml-1 ${ditherMethod === opt ? "text-[var(--s-accent-text)]" : "text-[var(--s-text-subtle)]"}`}
                >
                  {GLYPHS[opt]}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </PopoverSection>
    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Factor">
      <div className="grid grid-cols-[1fr_28px] items-center gap-x-2 px-1">
        <Slider
          min={0.1}
          max={2.0}
          step={0.05}
          value={ditherFactor}
          onChange={setDitherFactor}
          onDone={onStateChangeFinished}
        />
        <EditableValue
          value={ditherFactor}
          min={0.1}
          max={2.0}
          step={0.05}
          scale={100}
          suffix="%"
          onChange={setDitherFactor}
          onCommit={onStateChangeFinished}
        />
      </div>
    </PopoverSection>
  </Popover>
);
