import React from "react";
import type { TemplateDef } from "../../../data/studioTypes";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { TemplateThumbnail } from "../TemplateThumbnail";
import { TemplateCardImage } from "../card/TemplateCardImage";
import { getSlideTemplates } from "../slides/slide-templates";
import { SlideCarousel } from "../slides/SlideCarousel";

const MAX_RENDER_VIEWPORT_HEIGHT = 62;

interface PreviewRenderProps {
  summary: TemplateSummary;
  full: TemplateDef | null;
}

const FullRender: React.FC<{ full: TemplateDef }> = ({ full }) => {
  const slides = getSlideTemplates(full);
  if (slides.length === 0) return <TemplateThumbnail template={full} />;
  return <SlideCarousel slides={slides} locked={false} />;
};

export const PreviewRender: React.FC<PreviewRenderProps> = ({ summary, full }) => {
  const aspect = summary.width / summary.height;
  return (
    <div className="flex w-full justify-center">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ maxWidth: `calc(${MAX_RENDER_VIEWPORT_HEIGHT}vh * ${aspect})` }}
      >
        {full ? <FullRender full={full} /> : <TemplateCardImage template={summary} eager />}
      </div>
    </div>
  );
};
