import React from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { categoryLabel } from "../../../data/templates/categories";
import { describeTemplateSize } from "../../../data/templates/size-names";

interface CardCaptionProps {
  template: TemplateSummary;
  isNew: boolean;
}

export const CardCaption: React.FC<CardCaptionProps> = ({ template, isNew }) => (
  <div className="pt-2.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="truncate text-[12.5px] font-semibold text-zinc-800 dark:text-zinc-200">
        {template.name}
      </span>
      {isNew && (
        <span className="shrink-0 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">New</span>
      )}
    </div>
    <span className="mt-0.5 block truncate text-[10.5px] text-zinc-500 dark:text-zinc-400">
      {describeTemplateSize(template, template.category, categoryLabel(template.category))}
    </span>
  </div>
);
