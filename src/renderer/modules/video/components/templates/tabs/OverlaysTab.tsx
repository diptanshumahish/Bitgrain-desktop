import React from "react";
import { OVERLAY_TEMPLATES } from "../../../templates/overlay-templates";
import { applyOverlayParts } from "../../../templates/apply-text";
import { emitPopover } from "../../../../../lib/event-bus";
import { OverlayPreview } from "../previews/OverlayPreview";

export const OverlaysTab: React.FC = () => (
  <div className="grid grid-cols-2 gap-1.5 p-1">
    {OVERLAY_TEMPLATES.map((template) => (
      <button
        key={template.id}
        type="button"
        onClick={() => {
          applyOverlayParts(template.parts);
          emitPopover(null);
        }}
        className="flex flex-col items-stretch gap-1 px-2 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] text-left transition-colors"
      >
        <OverlayPreview parts={template.parts} />
        <div className="flex items-baseline justify-between w-full gap-2">
          <span className="text-[11px] text-[var(--s-text)] font-medium leading-tight">
            {template.label}
          </span>
          <span className="text-[9px] text-[var(--s-text-subtle)] font-mono">
            {template.totalDuration.toFixed(1)}s
          </span>
        </div>
        <span className="text-[9.5px] text-[var(--s-text-subtle)] leading-snug">
          {template.description}
        </span>
      </button>
    ))}
  </div>
);
