import React from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { TemplateCardImage } from "../card/TemplateCardImage";
import { CardCaption } from "../card/CardCaption";
import { LockBadge, OpenAffordance, PageCountBadge } from "../card/CardOverlays";

export const ROW_CARD_HEIGHT = 232;

const MULTI_PAGE_MIN = 2;

const FIGURE_CLASS =
  "relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 transition-colors duration-150 group-hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:border-zinc-600";

interface CardFigureProps {
  template: TemplateSummary;
  locked: boolean;
  fixedHeight?: number;
}

const CardFigure: React.FC<CardFigureProps> = ({ template, locked, fixedHeight }) => (
  <div className={FIGURE_CLASS} style={fixedHeight ? { height: fixedHeight } : undefined}>
    <TemplateCardImage template={template} fill={!!fixedHeight} />
    {locked ? <LockBadge /> : <OpenAffordance />}
    {template.pageCount >= MULTI_PAGE_MIN && <PageCountBadge count={template.pageCount} />}
  </div>
);

interface TemplateCardProps {
  template: TemplateSummary;
  locked: boolean;
  isNew: boolean;
  onOpen: () => void;
  variant?: "grid" | "row";
}

const CARD_BUTTON_CLASS = "group block w-full cursor-pointer border-none bg-transparent p-0 text-left";

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, locked, isNew, onOpen, variant = "grid" }) => {
  const isRow = variant === "row";
  const rowWidth = Math.round((ROW_CARD_HEIGHT * template.width) / template.height);
  return (
    <div
      className={isRow ? "shrink-0" : "mb-4 break-inside-avoid"}
      style={isRow ? { width: rowWidth } : undefined}
    >
      <button type="button" onClick={onOpen} aria-label={`Preview ${template.name}`} className={CARD_BUTTON_CLASS}>
        <CardFigure template={template} locked={locked} fixedHeight={isRow ? ROW_CARD_HEIGHT : undefined} />
        <CardCaption template={template} isNew={isNew} />
      </button>
    </div>
  );
};
