import React from "react";
import { LandingNav } from "../../../landing/LandingNav";
import { MARINE_DISPLAY_CLASS, MARINE_SECTION_INNER_CLASS } from "../../../landing/marketing/marine/marine-classes";
import { PrintWallBand } from "../print-wall/PrintWallBand";
import { POSTER_PRINTS, shiftPrints } from "../print-wall/print-wall-prints";
import { HERO_SERIF_ACCENT_CLASS } from "./marine-library-classes";

const SECOND_ROW_OFFSET = 6;
const WALL_ROWS = [POSTER_PRINTS, shiftPrints(POSTER_PRINTS, SECOND_ROW_OFFSET)];
const WALL_PRINT_HEIGHT = "h-[clamp(8.5rem,12.5vw,11.5rem)]";

export const TemplatesWallHero: React.FC = () => (
  <header className="relative w-full overflow-hidden bg-apricot">
    <LandingNav variant="paper" />
    <div
      className={`${MARINE_SECTION_INNER_CLASS} grid items-end gap-6 pb-10 pt-8 sm:pb-12 sm:pt-12 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-12`}
    >
      <div>
        <p className="text-[14px] text-ink-soft/70">Template library</p>
        <h1 className={`mt-4 text-ultramarine text-[clamp(2.6rem,5vw,4.5rem)] ${MARINE_DISPLAY_CLASS}`}>
          Start from a designer's <span className={HERO_SERIF_ACCENT_CLASS}>template</span>
        </h1>
      </div>
      <div className="md:pb-2">
        <p className="max-w-[440px] text-[16px] leading-[1.5] text-ink-soft/80 sm:text-[17px]">
          Album covers, posters, wallpapers, social cards and more. Open one in the studio and change the type, colours and texture.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 md:hidden">
          <span className="rounded-lg bg-ultramarine/10 px-3 py-1.5 text-[13px] font-medium text-ultramarine">
            Desktop recommended for editing
          </span>
        </div>
      </div>
    </div>
    <PrintWallBand rows={WALL_ROWS} heightClass={WALL_PRINT_HEIGHT} />
  </header>
);
