import React from "react";
import { TEXT_TEMPLATES } from "../../../templates/text-templates";
import { applyTextTemplate } from "../../../templates/apply-text";
import { emitPopover } from "../../../../../lib/event-bus";
import { TextAnimationPreview } from "../previews/TextAnimationPreview";

function yAnchorFromY(y: number): "top" | "middle" | "bottom" {
  if (y < 0.33) return "top";
  if (y > 0.66) return "bottom";
  return "middle";
}

export const TitlesTab: React.FC = () => (
  <div className="grid grid-cols-2 gap-1.5 p-1">
    {TEXT_TEMPLATES.map((template) => (
      <button
        key={template.id}
        type="button"
        onClick={() => {
          applyTextTemplate(template);
          emitPopover(null);
        }}
        className="flex flex-col items-stretch gap-1 px-2 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] text-left transition-colors"
      >
        <TextAnimationPreview
          text={template.text}
          animation={template.animation}
          align={template.align}
          yAnchor={yAnchorFromY(template.position.y)}
        />
        <span className="text-[11px] text-[var(--s-text)] font-medium leading-tight">
          {template.label}
        </span>
        <span className="text-[9.5px] text-[var(--s-text-subtle)] leading-snug">
          {template.description}
        </span>
      </button>
    ))}
  </div>
);
