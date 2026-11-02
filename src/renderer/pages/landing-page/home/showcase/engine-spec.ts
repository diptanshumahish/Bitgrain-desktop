import type { PrerenderSpec } from "../../../../components/prerendered-preview/prerender-cache";

const BASE_SPEC: Omit<PrerenderSpec, "image"> = {
  resolution: 2.5,
  contrast: 1.2,
  brightness: 1,
  saturation: 1,
  mode: ["halftone"],
  ditherMethod: "floyd-steinberg",
  ditherFactor: 1,
  isColor: true,
  noise: 0,
  halftoneCell: 5,
  halftoneAngle: 15,
  halftoneStyle: "mono",
  halftoneInvert: false,
};

export const engineSpec = (image: string, overrides: Partial<PrerenderSpec>): PrerenderSpec => ({
  ...BASE_SPEC,
  image,
  ...overrides,
});

export const BARCODE =
  "bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_3px,#111_3px_4px,transparent_4px_7px,#111_7px_10px,transparent_10px_12px)]";

export const PAPER_GRAIN =
  "bg-[radial-gradient(circle,rgba(0,0,0,0.08)_0.6px,transparent_1px)] bg-[size:3px_3px]";
