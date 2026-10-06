import React from "react";
import {
  relativeLuminance,
  hexToHsl,
  contrastRatio,
  contrastBadge,
  readableTextOn,
} from "../../../utils/color-theory";

interface Roles {
  bg: string;
  surface: string;
  text: string;
  primary: string;
  accent: string;
}

const buildRoles = (palette: string[]): Roles => {
  const byLum = [...palette].sort((a, b) => relativeLuminance(a) - relativeLuminance(b));
  const bySat = [...palette].sort((a, b) => hexToHsl(b)[1] - hexToHsl(a)[1]);
  const bg = byLum[byLum.length - 1] ?? "#ffffff";
  const text = byLum[0] ?? "#111111";
  const surface = byLum[byLum.length - 2] ?? bg;
  const primary = bySat[0] ?? text;
  const accent = bySat.find((c) => c !== primary) ?? primary;
  return { bg, surface, text, primary, accent };
};

const ROLE_LABELS: [keyof Roles, string][] = [
  ["bg", "Background"],
  ["surface", "Surface"],
  ["text", "Text"],
  ["primary", "Primary"],
  ["accent", "Accent"],
];

export const BrandBoard: React.FC<{ palette: string[] }> = ({ palette }) => {
  if (palette.length === 0) return null;
  const roles = buildRoles(palette);
  const onPrimary = readableTextOn(roles.primary);
  const textBg = contrastRatio(roles.text, roles.bg);

  const cssVars =
    `:root {\n  --brand-bg: ${roles.bg};\n  --brand-surface: ${roles.surface};\n` +
    `  --brand-text: ${roles.text};\n  --brand-primary: ${roles.primary};\n  --brand-accent: ${roles.accent};\n}`;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-5 gap-1.5">
        {ROLE_LABELS.map(([key, label]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span
              className="w-full h-9 rounded-md border border-black/10 dark:border-white/15"
              style={{ background: roles[key] }}
            />
            <span className="text-[9px] text-[var(--s-text-subtle)]">{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/15" style={{ background: roles.bg }}>
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold" style={{ color: roles.text }}>
              Brand
            </span>
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: roles.accent, color: readableTextOn(roles.accent) }}
            >
              new
            </span>
          </div>
          <div className="rounded-lg p-3 flex flex-col gap-1.5" style={{ background: roles.surface }}>
            <span className="text-[12.5px] font-semibold" style={{ color: roles.text }}>
              A headline in your palette
            </span>
            <span className="text-[10.5px] leading-relaxed" style={{ color: roles.text, opacity: 0.72 }}>
              Body copy sampled straight from the image colors, paired with a primary call to action.
            </span>
            <button
              className="self-start mt-1 px-3 py-1.5 rounded-md text-[11px] font-semibold"
              style={{ background: roles.primary, color: onPrimary }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[var(--s-text-muted)]">
        <span>Text on background</span>
        <span className="font-mono text-[var(--s-text)]">{textBg.toFixed(1)}:1</span>
        <span className="px-1.5 py-0.5 rounded bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] font-semibold">
          {contrastBadge(textBg)}
        </span>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => navigator.clipboard.writeText(cssVars).catch(() => {})}
          className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-[var(--s-bg-input)] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] transition-all"
        >
          Copy CSS variables
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(palette.join("\n")).catch(() => {})}
          className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-[var(--s-bg-input)] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] transition-all"
        >
          Copy all hex
        </button>
      </div>
    </div>
  );
};
