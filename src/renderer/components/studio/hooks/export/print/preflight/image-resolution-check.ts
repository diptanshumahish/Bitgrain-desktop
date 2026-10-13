import { fittedRect } from "../../../../../../utils/image-crop";
import type { ImageLayer, Layer, TemplatePage, UploadLayer } from "../../../../../../data/studioTypes";
import { MM_PER_INCH, PRINT_DPI } from "../paper-sizes";
import { resolvePrintSize } from "../print-geometry";
import { loadNaturalSize } from "./natural-size";
import type { NaturalSize } from "./natural-size";
import type { PreflightInput, PreflightItem } from "./preflight-types";

const SOFT_DPI = 150;
const PASS_ID = "image-resolution-pass";

type PhotoLayer = ImageLayer | UploadLayer;

interface PlacedPhoto {
  layer: PhotoLayer;
  page: TemplatePage;
  src: string;
}

const flattenLayers = (layers: Layer[]): Layer[] =>
  layers.flatMap((layer) =>
    layer.type === "group" || layer.type === "frame" ? [layer, ...flattenLayers(layer.layers)] : [layer],
  );

const isPhotoLayer = (layer: Layer): layer is PhotoLayer =>
  (layer.type === "image" || layer.type === "upload") && layer.visible;

const photoSource = (layer: PhotoLayer, page: TemplatePage, fallback: string | null): string | null =>
  layer.type === "image" ? layer.src ?? page.image ?? fallback : layer.src;

const collectPhotos = (input: PreflightInput): PlacedPhoto[] =>
  input.pages.flatMap((page) =>
    flattenLayers(page.layers)
      .filter(isPhotoLayer)
      .map((layer) => ({ layer, page, src: photoSource(layer, page, input.fallbackImage) }))
      .filter((photo): photo is PlacedPhoto => typeof photo.src === "string" && photo.src.length > 0),
  );

const displayScale = (layer: PhotoLayer, natural: NaturalSize): [number, number] => {
  const rect = fittedRect(layer.fit, natural.width, natural.height, { x: 0, y: 0, width: layer.width, height: layer.height }, layer.crop);
  return [rect.width / natural.width, rect.height / natural.height];
};

const effectiveDpi = (photo: PlacedPhoto, natural: NaturalSize): number => {
  const inchesPerUnit = resolvePrintSize(photo.page.width, photo.page.height).widthMm / MM_PER_INCH / photo.page.width;
  const [scaleX, scaleY] = displayScale(photo.layer, natural);
  return Math.round(1 / (Math.max(scaleX, scaleY) * inchesPerUnit));
};

const itemFor = (photo: PlacedPhoto, dpi: number): PreflightItem | null => {
  if (dpi >= PRINT_DPI) return null;
  const isSoft = dpi < SOFT_DPI;
  const tail = isSoft ? "It will look soft or pixelated in print." : "Aim for 300 for crisp print.";
  return {
    id: `image-resolution-${photo.page.id}-${photo.layer.id}`,
    level: isSoft ? "fail" : "warn",
    message: `"${photo.layer.name}" on ${photo.page.name} prints at about ${dpi} dpi. ${tail}`,
  };
};

const checkPhoto = async (photo: PlacedPhoto): Promise<PreflightItem | null> => {
  const natural = await loadNaturalSize(photo.src);
  if (!natural || natural.width === 0 || natural.height === 0) return null;
  return itemFor(photo, effectiveDpi(photo, natural));
};

export const checkImageResolution = async (input: PreflightInput): Promise<PreflightItem[]> => {
  const results = await Promise.all(collectPhotos(input).map(checkPhoto));
  const issues = results.filter((item): item is PreflightItem => item !== null);
  if (issues.length > 0) return issues;
  return [{ id: PASS_ID, level: "pass", message: "Images are sharp enough for 300 dpi print." }];
};
