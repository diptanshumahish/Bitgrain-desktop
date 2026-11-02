import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TemplateCategory } from "../../data/categories";
import { relatedFormats } from "../../data/related-formats";
import { trackEvent } from "@bitgrain/platform/tracker";
import { MARINE_DISPLAY_CLASS } from "../../../landing/marketing/marine/marine-classes";

interface FormatHeroIntroProps {
  category: TemplateCategory;
}

export const FormatHeroIntro: React.FC<FormatHeroIntroProps> = ({ category }) => {
  const siblings = relatedFormats(category.key);
  return (
    <>
      <Link
        to="/templates"
        className="inline-flex items-center gap-1.5 text-[14px] text-ink-soft/70 no-underline transition-colors hover:text-ultramarine app-dark:text-white/60 app-dark:hover:text-apricot"
      >
        <ArrowLeft size={14} strokeWidth={2.25} />
        All formats
      </Link>
      <div className="mt-4 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
        <div>
          <h1 className={`text-ultramarine text-[clamp(2.75rem,6vw,5.25rem)] app-dark:text-apricot ${MARINE_DISPLAY_CLASS}`}>{category.label}</h1>
          <p className="mt-4 max-w-[480px] text-[16px] leading-[1.5] text-ink-soft/80 sm:text-[17px] app-dark:text-white/65">{category.description}</p>
        </div>
        <div className="md:pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[14px] text-ink-soft/60 app-dark:text-white/50">Related formats</span>
            {siblings.map((sibling) => (
              <Link
                key={sibling.key}
                to={`/templates/${sibling.key}`}
                onClick={() => trackEvent("templates", "format_sibling_clicked", { details: { category: sibling.key } })}
                className="inline-flex items-center gap-1 rounded-lg bg-ultramarine/10 px-3 py-1.5 text-[13px] font-medium text-ultramarine no-underline transition-colors hover:bg-ultramarine hover:text-white app-dark:bg-white/10 app-dark:text-apricot app-dark:hover:bg-apricot app-dark:hover:text-ultramarine-deep"
              >
                {sibling.label}
                <ArrowRight size={12} strokeWidth={2.25} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
