import { zipSync } from "fflate";
import { separateRiso } from "@bitgrain/engine/riso/riso-client";
import type { RisoInk } from "@bitgrain/engine/riso/riso-inks";
import { capLongEdgeForPlan } from "@bitgrain/platform/plans/gate/plan-long-edge";
import { buildWorkingImageData } from "./build-working-image-data";
import { imageDataToPng } from "./image-data-to-png";

const ZIP_LEVEL = 6;

const layerFileName = (index: number, ink: RisoInk): string => `${String(index + 1).padStart(2, "0")}-${ink.id}.png`;

export async function buildRisoZip(img: HTMLImageElement, inks: RisoInk[], plan: string, maxLongEdge: number): Promise<Blob> {
  const working = buildWorkingImageData(img, capLongEdgeForPlan(plan, maxLongEdge));
  if (!working) throw new Error("This browser couldn't read the image for print layers.");
  const separated = await separateRiso(working, inks.map((ink) => ink.rgb));
  const files: Record<string, Uint8Array> = { "preview.png": await imageDataToPng(separated.preview, plan) };
  for (let layer = 0; layer < separated.layers.length; layer += 1) {
    files[layerFileName(layer, inks[layer])] = await imageDataToPng(separated.layers[layer], plan);
  }
  const zipped = zipSync(files, { level: ZIP_LEVEL });
  return new Blob([new Uint8Array(zipped)], { type: "application/zip" });
}
