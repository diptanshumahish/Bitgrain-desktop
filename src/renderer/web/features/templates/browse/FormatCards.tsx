import React from "react";
import { Link } from "react-router-dom";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import type { TemplateCategory } from "../data/categories";
import { TemplateCardImage } from "@bitgrain/studio/templates/card/TemplateCardImage";
import { trackEvent } from "@bitgrain/platform/tracker";

interface FormatCardsProps {
  categories: TemplateCategory[];
  previews: Map<string, TemplateSummary>;
  isPending: boolean;
}

const CARD_CLASS =
  "group relative block h-[124px] w-[156px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[20px] border border-stone bg-paper p-4 text-left no-underline transition-colors hover:border-ultramarine dark:border-white/10 dark:bg-white/5 dark:hover:border-white/40";

const PREVIEW_FRAME =
  "absolute -bottom-3 -right-2 block w-[70px] rotate-6 overflow-hidden rounded-md border border-ultramarine/15 transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3";

interface FormatCardProps {
  category: TemplateCategory;
  preview?: TemplateSummary;
  isPending: boolean;
}

const FormatCard: React.FC<FormatCardProps> = ({ category, preview, isPending }) => (
  <Link
    to={`/templates/${category.key}`}
    onClick={() => trackEvent("templates", "format_card_clicked", { details: { category: category.key } })}
    className={CARD_CLASS}
  >
    <span className="block font-display text-[15px] font-medium text-ultramarine dark:text-white">{category.label}</span>
    <span className="mt-1 block max-w-[58%] text-[12px] leading-snug text-ink-soft/65 dark:text-white/60">
      {category.blurb}
    </span>
    {preview ? (
      <span className={`template-card-in ${PREVIEW_FRAME}`}>
        <TemplateCardImage template={preview} />
      </span>
    ) : (
      isPending && <span className={`h-[86px] bg-stone ${PREVIEW_FRAME}`} />
    )}
  </Link>
);

export const FormatCards: React.FC<FormatCardsProps> = ({ categories, previews, isPending }) => (
  <>
    {categories.map((category) => (
      <FormatCard key={category.key} category={category} preview={previews.get(category.key)} isPending={isPending} />
    ))}
  </>
);
