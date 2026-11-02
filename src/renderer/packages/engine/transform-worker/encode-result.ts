import type { TransformationResult } from "../core/types";

const SOLID_BLOCK = "█";

interface ResultLayout {
  id: unknown;
  lastModeKeepsGrid: boolean;
  isDither: boolean;
  cols: number;
  rows: number;
  charWidth: number;
  charHeight: number;
  sampleWidth: number;
  sampleHeight: number;
  targetWidth: number;
  targetHeight: number;
}

interface EncodedResult {
  message: Record<string, unknown>;
  transfer: Transferable[];
}

const encodeDitherMask = (charData: string[], size: number): Uint8Array => {
  const mask = new Uint8Array(size);
  for (let index = 0; index < charData.length; index++) mask[index] = charData[index] === SOLID_BLOCK ? 1 : 0;
  return mask;
};

const transferablesOf = (result: TransformationResult, ditherMask: Uint8Array | null): Transferable[] => {
  const buffers = [ditherMask, result.colorData, result.baseData, result.effectAlpha, result.overlayAlpha];
  return buffers.flatMap((buffer) => (buffer ? [buffer.buffer as ArrayBuffer] : []));
};

export const encodeResult = (result: TransformationResult, layout: ResultLayout): EncodedResult => {
  const ditherMask = layout.isDither && result.charData ? encodeDitherMask(result.charData, layout.cols * layout.rows) : null;
  const charData = !ditherMask && result.charData ? result.charData : null;
  return {
    transfer: transferablesOf(result, ditherMask),
    message: {
      type: "result",
      id: layout.id,
      colorData: result.colorData || null,
      charData,
      ditherMask,
      cols: layout.lastModeKeepsGrid && result.gridWidth ? result.gridWidth : layout.cols,
      rows: layout.lastModeKeepsGrid && result.gridHeight ? result.gridHeight : layout.rows,
      charWidth: layout.charWidth,
      charHeight: layout.charHeight,
      isDither: layout.isDither,
      baseData: result.baseData ?? null,
      effectAlpha: result.effectAlpha ?? null,
      overlayAlpha: result.overlayAlpha ?? null,
      baseCols: layout.sampleWidth,
      baseRows: layout.sampleHeight,
      targetWidth: layout.targetWidth,
      targetHeight: layout.targetHeight,
    },
  };
};
