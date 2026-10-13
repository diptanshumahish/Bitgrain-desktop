import type React from "react";
import type { PrerenderSpec } from "../../../prerendered-preview/prerender-cache";
import { prerender } from "../../../prerendered-preview/prerender-cache";
import { isLowEndDevice } from "../../../../lib/device-capability";
import { FestivalPoster } from "../../../../pages/landing-page/home/showcase/FestivalPoster";
import { NovelCover } from "../../../../pages/landing-page/home/showcase/NovelCover";
import { MagazineCover } from "../../../../pages/landing-page/home/showcase/MagazineCover";
import {
  HILL_SPEC,
  READER_SPEC,
  RED_DRESS_SPEC,
} from "../../../../pages/landing-page/home/showcase/showcase-specs";

export interface ShowcasePiece {
  id: string;
  name: string;
  process: string;
  aspectClass: string;
  visibilityClass: string;
  Design: React.FC;
}

export const SHOWCASE_PIECES: ShowcasePiece[] = [
  {
    id: "festival",
    name: "Film festival poster",
    process: "Black halftone on red",
    aspectClass: "aspect-[4/5]",
    visibilityClass: "block",
    Design: FestivalPoster,
  },
  {
    id: "novel",
    name: "Book cover",
    process: "Crosshatch etching",
    aspectClass: "aspect-[2/3]",
    visibilityClass: "hidden md:block",
    Design: NovelCover,
  },
  {
    id: "magazine",
    name: "Magazine cover",
    process: "CMYK halftone",
    aspectClass: "aspect-[3/4]",
    visibilityClass: "hidden lg:block",
    Design: MagazineCover,
  },
];

const WARM_SPECS: PrerenderSpec[] = [HILL_SPEC, READER_SPEC, RED_DRESS_SPEC];

export const warmShowcasePieces = (): void => {
  if (isLowEndDevice()) return;
  for (const spec of WARM_SPECS) void prerender(spec);
};
