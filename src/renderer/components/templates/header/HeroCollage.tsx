import React from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { TemplateCardImage } from "../card/TemplateCardImage";
import { HeroCollageFallback } from "./HeroCollageFallback";
import { COLLAGE_POSITIONS } from "./collage-positions";

const COLLAGE_LIMIT = 3;
const SHIMMER_HEIGHTS = ["h-[200px]", "h-[230px]", "h-[200px]"];
const COLLAGE_FRAME = "hidden h-[280px] items-center justify-center md:flex";

interface HeroCollageProps {
  templates: TemplateSummary[];
  isPending: boolean;
}

const CollageShimmer: React.FC = () => (
  <>
    {COLLAGE_POSITIONS.map((position, index) => (
      <span
        key={position}
        className={`skeleton-shimmer block shrink-0 rounded-xl border border-zinc-900/10 ${position} ${SHIMMER_HEIGHTS[index]}`}
      />
    ))}
  </>
);

export const HeroCollage: React.FC<HeroCollageProps> = ({ templates, isPending }) => {
  const collage = templates.slice(0, COLLAGE_LIMIT);
  if (collage.length === 0) {
    return (
      <div className={COLLAGE_FRAME} aria-hidden="true">
        {isPending ? <CollageShimmer /> : <HeroCollageFallback />}
      </div>
    );
  }

  return (
    <div className={COLLAGE_FRAME} aria-hidden="true">
      {collage.map((template, index) => (
        <span
          key={template.id}
          className={`template-card-in block shrink-0 overflow-hidden rounded-xl border border-zinc-900/15 shadow-lg shadow-zinc-900/10 transition-transform duration-200 hover:-translate-y-1 ${COLLAGE_POSITIONS[index]}`}
        >
          <TemplateCardImage template={template} eager />
        </span>
      ))}
    </div>
  );
};
