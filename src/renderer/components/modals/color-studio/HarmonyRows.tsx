import React from "react";
import { harmonies, tintsShades } from "../../../utils/color-theory";
import { ColorChip } from "./ColorChip";

const ROWS: { key: keyof ReturnType<typeof harmonies>; label: string }[] = [
  { key: "complementary", label: "Complementary" },
  { key: "analogous", label: "Analogous" },
  { key: "triadic", label: "Triadic" },
  { key: "splitComplementary", label: "Split complementary" },
  { key: "tetradic", label: "Tetradic" },
];

export const HarmonyRows: React.FC<{ base: string }> = ({ base }) => {
  const sets = harmonies(base);
  const ramp = tintsShades(base, 9);

  return (
    <div className="flex flex-col gap-3.5">
      {ROWS.map((row) => (
        <div key={row.key} className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-[var(--s-text-muted)]">{row.label}</span>
          <div className="flex flex-wrap gap-2">
            {sets[row.key].map((hex, i) => (
              <ColorChip key={`${hex}-${i}`} hex={hex} size={30} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--s-text-muted)]">Tints & shades</span>
        <div className="flex rounded-lg overflow-hidden border border-black/10 dark:border-white/15">
          {ramp.map((hex, i) => (
            <button
              key={`${hex}-${i}`}
              title={`Copy ${hex}`}
              onClick={() => navigator.clipboard.writeText(hex).catch(() => {})}
              className="h-9 flex-1 transition-transform hover:scale-y-110"
              style={{ background: hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
