import React from "react";
import { Lock } from "lucide-react";
import type { TemplateSummary } from "../../../../lib/template-cards/template-summary";
import { TemplateCardImage } from "../../../templates/card/TemplateCardImage";

export interface TemplateThumbProps {
  template: TemplateSummary;
  selected: boolean;
  index: number;
  locked: boolean;
  onClick: () => void;
}

export const TemplateThumb: React.FC<TemplateThumbProps> = ({
  template,
  selected,
  locked,
  onClick,
}) => (
  <button
    onClick={onClick}
    title={template.name}
    className="group flex flex-col items-stretch gap-1.5 bg-transparent border-none cursor-pointer p-0 w-full text-left break-inside-avoid mb-4"
  >
    <div
      className={`w-full relative overflow-hidden transition-all duration-200 rounded-sm ${
        selected
          ? "ring-2 ring-[var(--s-accent)] ring-offset-2 ring-offset-[var(--s-bg-panel)]"
          : "border border-[var(--s-border)] hover:border-[var(--s-text)] hover:-translate-y-0.5"
      }`}
      style={{
        aspectRatio: `${template.width} / ${template.height}`,
      }}
    >
      <TemplateCardImage template={template} fill />

      {selected && (
        <div className="absolute top-2 right-2 bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[9px] px-2 py-0.5 font-semibold rounded-sm">
          ACTIVE
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Lock size={14} className="text-white" />
          <span className="text-[9px] text-white font-bold">Unlock (Free)</span>
        </div>
      )}
    </div>

    <div className="flex items-center justify-between gap-2 mt-1 px-0.5">
      <span
        className={`text-[10px] truncate font-medium flex-1 transition-colors duration-150 ${
          selected
            ? "text-[var(--s-accent)]"
            : "text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)]"
        }`}
      >
        {template.name}
      </span>
      {locked && (
        <Lock size={8} className="text-[var(--s-text-muted)] shrink-0" />
      )}
    </div>
  </button>
);
