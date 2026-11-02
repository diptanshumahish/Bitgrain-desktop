import React from "react";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { TemplateThumbnail } from "@bitgrain/studio/templates/TemplateThumbnail";
import { TemplateCardImage } from "@bitgrain/studio/templates/card/TemplateCardImage";
import { getSlideTemplates } from "../slides/slide-templates";
import { SlideCarousel } from "../slides/SlideCarousel";

const MAX_RENDER_VIEWPORT_HEIGHT = 70;

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
        className="relative w-full overflow-hidden rounded-[6px] bg-white ring-1 ring-ink-soft/5 dark:bg-zinc-900 dark:ring-white/10"
        style={{ maxWidth: `calc(${MAX_RENDER_VIEWPORT_HEIGHT}vh * ${aspect})` }}
      >
        {full ? <FullRender full={full} /> : <TemplateCardImage template={summary} eager />}
      </div>
    </div>
  );
};
