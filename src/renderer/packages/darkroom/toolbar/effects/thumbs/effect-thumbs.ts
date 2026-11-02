import type React from "react";
import { OriginalThumb } from "./OriginalThumb";
import { DitherThumb } from "./DitherThumb";
import { HalftoneThumb } from "./HalftoneThumb";
import { PopArtThumb } from "./PopArtThumb";
import { AsciiThumb } from "./AsciiThumb";
import { BrailleThumb } from "./BrailleThumb";
import { ContourThumb } from "./ContourThumb";
import { InkWashThumb } from "./InkWashThumb";
import { MangaThumb } from "./MangaThumb";

export const EFFECT_THUMBS: Record<string, React.FC> = {
  original: OriginalThumb,
  algorithm: DitherThumb,
  halftone: HalftoneThumb,
  popart: PopArtThumb,
  ascii: AsciiThumb,
  braille: BrailleThumb,
  contour: ContourThumb,
  inkwash: InkWashThumb,
  manga: MangaThumb,
};
