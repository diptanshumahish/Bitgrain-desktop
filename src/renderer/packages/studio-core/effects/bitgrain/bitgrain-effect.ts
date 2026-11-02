import type { BitgrainEffect } from "../../model/studio-types";
import { fitWithin } from "./bitgrain-effect-core";
import { runBitgrainTransform } from "./bitgrain-worker-client";
import { modernAsciiStyle } from "@bitgrain/engine/preview/modern-ascii";
import { applyPrintFinish, buildPrintFinishOptions } from "@bitgrain/engine/finish/print-finish";
import { printFinishSignal, printFinishStrengthSignal } from "@bitgrain/engine/finish/print-finish-state";

export {
  BITGRAIN_EFFECTS,
  BITGRAIN_GROUPS,
  BITGRAIN_GROUP_ORDER,
  findEffectSpec,
  defaultParamsFor,
} from "./bitgrain-effect-core";

const MAX_PROCESS_DIMENSION = 1200;

const asStyleEffect = (effect: BitgrainEffect): BitgrainEffect => {
  if (effect.kind !== "ascii") return effect;
  const charset = typeof effect.params.asciiCharset === "string" ? effect.params.asciiCharset : undefined;
  return { kind: "style", params: {}, style: modernAsciiStyle({ asciiCharset: charset, isColor: effect.params.isColor === true }) };
};

export const applyBitgrainEffectAsync = async (
  source: HTMLImageElement | HTMLCanvasElement,
  requested: BitgrainEffect,
  options?: { maxDimension?: number },
): Promise<HTMLCanvasElement> => {
  const effect = asStyleEffect(requested);

  const srcW = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth || source.width;
  const srcH = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight || source.height;

  const limit = options?.maxDimension ?? MAX_PROCESS_DIMENSION;
  const { w: processW, h: processH } = fitWithin(srcW, srcH, limit);

  const stagingCanvas = document.createElement("canvas");
  stagingCanvas.width = processW;
  stagingCanvas.height = processH;
  const stagingCtx = stagingCanvas.getContext("2d", { willReadFrequently: true });
  if (!stagingCtx) return stagingCanvas;

  stagingCtx.imageSmoothingEnabled = true;
  stagingCtx.drawImage(source, 0, 0, processW, processH);
  const imageData = stagingCtx.getImageData(0, 0, processW, processH);

  const colorData = await runBitgrainTransform(imageData.data, processW, processH, effect);
  const bytes = new Uint8ClampedArray(colorData);
  if (printFinishSignal.value) {
    applyPrintFinish(bytes, processW, processH, buildPrintFinishOptions(printFinishStrengthSignal.value));
  }
  stagingCtx.putImageData(new ImageData(bytes, processW, processH), 0, 0);
  return stagingCanvas;
};
