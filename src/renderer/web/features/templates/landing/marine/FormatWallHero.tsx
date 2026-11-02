import React from "react";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import type { TemplateCategory } from "../../data/categories";
import { LandingNav } from "../../../landing/LandingNav";
import { MARINE_SECTION_INNER_CLASS } from "../../../landing/marketing/marine/marine-classes";
import { PrintWallBand } from "../print-wall/PrintWallBand";
import { POSTER_PRINTS } from "../print-wall/print-wall-prints";
import { templateWallPrints } from "../print-wall/template-prints";
import { FormatHeroIntro } from "./FormatHeroIntro";

interface FormatWallHeroProps {
  category: TemplateCategory;
  templates: TemplateSummary[];
}

const FORMAT_PRINT_HEIGHT = "h-[clamp(7rem,10vw,9.5rem)]";

export const FormatWallHero: React.FC<FormatWallHeroProps> = ({ category, templates }) => {
  const categoryPrints = templateWallPrints(templates);
  const wallRow = categoryPrints.length > 0 ? categoryPrints : POSTER_PRINTS;
  return (
    <section className="relative w-full overflow-hidden bg-apricot">
      <LandingNav variant="paper" />
      <div className={`${MARINE_SECTION_INNER_CLASS} pb-9 pt-6 sm:pb-10 sm:pt-10`}>
        <FormatHeroIntro category={category} />
      </div>
      <PrintWallBand rows={[wallRow]} heightClass={FORMAT_PRINT_HEIGHT} />
    </section>
  );
};
