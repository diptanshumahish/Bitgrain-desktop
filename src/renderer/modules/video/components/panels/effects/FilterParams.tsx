import React from "react";
import type { EffectApplication, EffectParams } from "../../../types";
import type { TransformMode } from "../../../../../engine/types";
import { HalftoneParams } from "./halftone-params";
import { PopartParams } from "./popart-params";
import { AsciiParams, BrailleParams } from "./ascii-params";
import { DitherParams } from "./dither-params";
import {
  ContourParams,
  PhotocopyParams,
  MisprintParams,
  FoldParams,
  DustParams,
} from "./print-params";
import {
  ScanlinesParams,
  CrosshatchParams,
  HazeBloomParams,
  GrainParams,
  ColorGradeParams,
  DuotoneParams,
  ColorWashParams,
  VignetteParams,
  PosterizeParams,
  SharpenParams,
} from "./simple-params";

interface FilterParamsProps {
  fx: EffectApplication;
  onChange: (patch: Partial<EffectParams>) => void;
}

export const FilterParams: React.FC<FilterParamsProps> = ({ fx, onChange }) => {
  const params = fx.params;
  const mode = fx.mode as TransformMode;

  switch (mode) {
    case "halftone":
      return <HalftoneParams params={params} onChange={onChange} />;
    case "dither":
      return <DitherParams params={params} onChange={onChange} />;
    case "ascii":
      return <AsciiParams params={params} onChange={onChange} />;
    case "braille":
      return <BrailleParams params={params} onChange={onChange} />;
    case "contour":
      return <ContourParams params={params} onChange={onChange} />;
    case "photocopy":
      return <PhotocopyParams params={params} onChange={onChange} />;
    case "misprint":
      return <MisprintParams params={params} onChange={onChange} />;
    case "fold":
      return <FoldParams params={params} onChange={onChange} />;
    case "dust":
      return <DustParams params={params} onChange={onChange} />;
    case "scanlines":
      return <ScanlinesParams params={params} onChange={onChange} />;
    case "crosshatch":
      return <CrosshatchParams params={params} onChange={onChange} />;
    case "popart":
      return <PopartParams params={params} onChange={onChange} />;
    case "haze-bloom":
      return <HazeBloomParams params={params} onChange={onChange} />;
    case "grain":
      return <GrainParams params={params} onChange={onChange} />;
    case "colorgrade":
      return <ColorGradeParams params={params} onChange={onChange} />;
    case "duotone":
      return <DuotoneParams params={params} onChange={onChange} />;
    case "colorwash":
      return <ColorWashParams params={params} onChange={onChange} />;
    case "vignette":
      return <VignetteParams params={params} onChange={onChange} />;
    case "posterize":
      return <PosterizeParams params={params} onChange={onChange} />;
    case "sharpen":
      return <SharpenParams params={params} onChange={onChange} />;
    default:
      return null;
  }
};
