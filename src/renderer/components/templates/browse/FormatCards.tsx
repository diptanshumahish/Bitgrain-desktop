import React from "react";
import { Link } from "react-router-dom";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import type { TemplateCategory } from "../../../data/templates/categories";
import { TemplateCardImage } from "../card/TemplateCardImage";
import { trackEvent } from "../../../lib/tracker";
import { accentTone } from "./accent-tone";

interface FormatCardsProps {
  categories: TemplateCategory[];
  previews: Map<string, TemplateSummary>;
  isPending: boolean;
}

const PREVIEW_FRAME =
  "absolute -bottom-3 -right-2 block w-[70px] rotate-6 overflow-hidden rounded-md border border-zinc-900/15 transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3";

interface FormatCardProps {
  category: TemplateCategory;
  preview?: TemplateSummary;
  isPending: boolean;
}

const FormatCard: React.FC<FormatCardProps> = ({ category, preview, isPending }) => (
  <Link
    to={`/templates/${category.key}`}
    onClick={() => trackEvent("templates", "format_card_clicked", { details: { category: category.key } })}
    className={`group relative block h-[124px] w-[156px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl border border-zinc-900/10 p-4 text-left transition-colors hover:border-zinc-900/35 dark:border-white/5 dark:hover:border-white/25 ${category.accent}`}
  >
    <span className={`block text-[14px] font-semibold ${accentTone(category.accent).title}`}>{category.label}</span>
    <span className={`mt-1 block max-w-[58%] text-[11px] leading-snug ${accentTone(category.accent).body}`}>
      {category.blurb}
    </span>
    {preview ? (
      <span className={`template-card-in ${PREVIEW_FRAME}`}>
        <TemplateCardImage template={preview} />
      </span>
    ) : (
      isPending && <span className={`h-[86px] bg-white/40 ${PREVIEW_FRAME}`} />
    )}
  </Link>
);

export const FormatCards: React.FC<FormatCardsProps> = ({ categories, previews, isPending }) => (
  <>
    {categories.map((category) => (
      <FormatCard
        key={category.key}
        category={category}
        preview={previews.get(category.key)}
        isPending={isPending}
      />
    ))}
  </>
);
