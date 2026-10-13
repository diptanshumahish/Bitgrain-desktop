import React from "react";
import { TextSpecimenArt } from "./text-specimen-art";

interface TextSpecimenCardProps {
  fontFamily: string;
  mixedFonts: boolean;
  content: string;
}

interface SpecimenStatProps {
  value: string;
  label: string;
}

const SPECIMEN_GLYPHS = "Ag";

const primaryFontName = (fontFamily: string): string =>
  fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") || "Font";

const countWords = (content: string): number => content.trim().split(/\s+/).filter(Boolean).length;

const countCharacters = (content: string): number => content.replace(/\s/g, "").length;

const SpecimenStat: React.FC<SpecimenStatProps> = ({ value, label }) => (
  <div className="px-2.5 py-2.5 flex flex-col gap-0.5 min-w-0">
    <span className="text-[13px] leading-tight font-semibold text-[var(--s-text)] truncate [font-variant-numeric:tabular-nums]">
      {value}
    </span>
    <span className="text-[10.5px] text-[var(--s-text-subtle)] truncate">{label}</span>
  </div>
);

export const TextSpecimenCard: React.FC<TextSpecimenCardProps> = ({ fontFamily, mixedFonts, content }) => (
  <div className="px-4 pt-4">
    <div className="rounded-xl border border-[var(--s-border)] overflow-hidden">
      <div className="relative h-[72px] bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]">
        <TextSpecimenArt />
        <span
          className="absolute left-7 bottom-[13px] text-[44px] leading-none text-[var(--s-text)]"
          style={{ fontFamily }}
          aria-hidden="true"
        >
          {SPECIMEN_GLYPHS}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.3fr)] divide-x divide-[var(--s-border)]">
        <SpecimenStat value={mixedFonts ? "Mixed" : primaryFontName(fontFamily)} label="Font" />
        <SpecimenStat value={String(countWords(content))} label="Words" />
        <SpecimenStat value={String(countCharacters(content))} label="Characters" />
      </div>
    </div>
  </div>
);
