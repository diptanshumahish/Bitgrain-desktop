import React from "react";
import { Popover, PopoverSection } from "../Popover";
import type { Palette } from "../../../engine/types";
import { PALETTES } from "../../../engine/palettes";
import { Pipette } from "lucide-react";
import { extractPalette } from "../../../engine/ColorAnalysis";

interface PalettePopoverProps {
  palette: Palette | null;
  setPalette: (p: Palette | null) => void;
  onClose: () => void;
  static?: boolean;
}

export const PalettePopover: React.FC<PalettePopoverProps> = ({
  palette,
  setPalette,
  onClose,
  static: isStatic,
}) => {
  const handleAura = () => {
    const canvas = document.getElementById("transformation-output-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const colors = extractPalette(canvas, 8);
    setPalette({
      id: `aura-${Date.now()}`,
      name: "Aura Gen",
      colors: colors.map((hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ] as [number, number, number]),
    });
  };

  return (
    <Popover onClose={onClose} className="w-48" static={isStatic}>
      <PopoverSection title="Palette">
        <div className="max-h-44 overflow-y-auto">
          <button
            onClick={() => setPalette(null)}
            className={`flex items-center w-full px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              !palette ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
            }`}
          >
            No palette
          </button>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                palette?.id === p.id ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
              }`}
            >
              <div className="flex -space-x-0.5 shrink-0">
                {p.colors.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20"
                    style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }}
                  />
                ))}
              </div>
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleAura}
          className="mt-1 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] text-[var(--s-text-subtle)] transition-all"
        >
          <Pipette size={10} /> Generate from image
        </button>
      </PopoverSection>
    </Popover>
  );
};
