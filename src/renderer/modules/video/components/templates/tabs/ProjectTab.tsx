import React from "react";
import { PROJECT_TEMPLATES } from "../../../templates/project-templates";
import { applyProjectTemplate } from "../../../templates/apply-project";
import { emitPopover } from "../../../../../lib/event-bus";
import { ProjectPreview } from "../previews/ProjectPreview";

export const ProjectTab: React.FC = () => (
  <div className="flex flex-col gap-1.5 p-1">
    {PROJECT_TEMPLATES.map((template) => (
      <button
        key={template.id}
        type="button"
        onClick={() => {
          applyProjectTemplate(template);
          emitPopover(null);
        }}
        className="flex flex-col items-stretch gap-1.5 px-2 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] text-left transition-colors"
      >
        <ProjectPreview duration={template.duration} titles={template.titles} />
        <div className="flex items-baseline justify-between w-full gap-2">
          <span className="text-[11.5px] text-[var(--s-text)] font-medium">
            {template.label}
          </span>
          <span className="text-[9px] text-[var(--s-text-subtle)] font-mono">
            {template.duration.toFixed(1)}s
          </span>
        </div>
        <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
          {template.description}
        </span>
      </button>
    ))}
  </div>
);
