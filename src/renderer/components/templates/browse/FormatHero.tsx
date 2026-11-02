import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import type { TemplateCategory } from "../../../data/templates/categories";
import { relatedFormats } from "../../../data/templates/related-formats";
import { HeroCollage } from "../header/HeroCollage";
import { TemplateCountPill } from "../header/TemplateCountPill";
import { trackEvent } from "../../../lib/tracker";
import { accentTone } from "./accent-tone";

interface FormatHeroProps {
  category: TemplateCategory;
  templates: TemplateSummary[];
  total: number;
  isPending: boolean;
}

export const FormatHero: React.FC<FormatHeroProps> = ({ category, templates, total, isPending }) => {
  const siblings = relatedFormats(category.key);
  const tone = accentTone(category.accent);

  return (
    <section className={`w-full ${category.accent}`}>
      <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-6 pb-14 pt-20 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-16 md:pt-24">
        <div>
          <p className={`text-[12px] font-semibold ${tone.body}`}>Browse by format</p>
          <h1 className={`mt-2 text-4xl font-extrabold leading-[1.02] md:text-[52px] ${tone.title}`}>{category.label}</h1>
          <p className={`mt-4 max-w-[480px] text-[14px] leading-[1.6] md:text-[16px] ${tone.body}`}>
            {category.description}
          </p>
          <div className="mt-6">
            <TemplateCountPill
              total={total}
              isPending={isPending}
              className={`inline-block rounded-full border border-current/15 bg-white/10 px-3 py-1 text-[11px] font-semibold ${tone.body}`}
            />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className={`text-[12px] font-semibold ${tone.body}`}>Related formats</span>
            {siblings.map((sibling) => (
              <Link
                key={sibling.key}
                to={`/templates/${sibling.key}`}
                onClick={() => trackEvent("templates", "format_sibling_clicked", { details: { category: sibling.key } })}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${tone.chip}`}
              >
                {sibling.label}
                <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            ))}
          </div>
        </div>

        <HeroCollage templates={templates} isPending={isPending} />
      </div>
    </section>
  );
};
