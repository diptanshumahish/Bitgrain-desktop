import React from "react";
import { Wand2 } from "lucide-react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { richStripUpdate } from "../multi-select/shared/rich-strip";
import { useTextBackdrop, type BackdropView } from "./use-text-backdrop";
import { AA_LARGE, AA_NORMAL, fixTextColor, gradeContrast, isLargeText } from "./wcag-contrast";
import { effectiveTextColor, numericWeight } from "./text-color-math";
import { ContrastGradeTable } from "./contrast-grade-table";

const RATIO_DECIMALS = 2;

const SOURCE_LABEL: Record<string, string> = {
  page: "Against the page background",
  shape: "Against the shape behind it",
  frame: "Against the frame behind it",
  sampled: "Sampled from the image behind it",
};

interface ContrastSectionProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const backdropColor = (view: BackdropView): string | null =>
  view.state === "solid" || view.state === "sampled" ? view.color : null;

const sourceLabel = (view: BackdropView): string =>
  view.state === "solid" ? SOURCE_LABEL[view.source] : SOURCE_LABEL.sampled;

const ContrastNote: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-[12px] text-[var(--s-text-subtle)] leading-snug">{text}</p>
);

interface ContrastReadoutProps {
  layer: TextLayer;
  view: BackdropView;
  background: string;
  foreground: string;
  onChange: (updates: Partial<TextLayer>) => void;
}

const ContrastReadout: React.FC<ContrastReadoutProps> = ({ layer, view, background, foreground, onChange }) => {
  const grades = gradeContrast(foreground, background);
  const large = isLargeText(layer.fontSize, numericWeight(layer));
  const target = large ? AA_LARGE : AA_NORMAL;
  const fixed = grades.ratio < target ? fixTextColor(foreground, background, target) : null;
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span
          className="w-9 h-9 rounded-md border border-[var(--s-border)] flex items-center justify-center text-[14px] font-semibold shrink-0"
          style={{ background, color: foreground }}
        >
          Aa
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] text-[var(--s-text)] font-medium [font-variant-numeric:tabular-nums]">
            {grades.ratio.toFixed(RATIO_DECIMALS)}:1
          </span>
          <span className="text-[12px] text-[var(--s-text-subtle)] truncate">{sourceLabel(view)}</span>
        </div>
      </div>
      <ContrastGradeTable grades={grades} large={large} />
      {fixed && (
        <button
          type="button"
          onClick={() => onChange({ color: fixed, colorVar: undefined, ...richStripUpdate(layer, "color") })}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--s-bg-input)] text-[12px] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors"
        >
          <Wand2 size={12} strokeWidth={1.75} /> Fix contrast
        </button>
      )}
    </>
  );
};

const noteFor = (layer: TextLayer, view: BackdropView): string | null => {
  if (layer.gradientText?.enabled) return "Gradient text, check contrast by eye.";
  if (view.state === "sampling") return "Checking what sits behind this text...";
  if (view.state === "manual") return "Over an image, check contrast manually.";
  return null;
};

export const ContrastSection: React.FC<ContrastSectionProps> = ({ layer, onChange }) => {
  const view = useTextBackdrop(layer.id);
  const background = backdropColor(view);
  const foreground = background ? effectiveTextColor(layer, background) : null;
  const note = noteFor(layer, view);

  return (
    <PanelGroup title="Contrast">
      {note || !background || !foreground ? (
        <ContrastNote text={note ?? "Could not read the text color, check contrast manually."} />
      ) : (
        <ContrastReadout layer={layer} view={view} background={background} foreground={foreground} onChange={onChange} />
      )}
    </PanelGroup>
  );
};
