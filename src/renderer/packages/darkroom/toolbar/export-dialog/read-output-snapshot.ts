import { imageMetaSignal } from "../../state/image-store";

const OUTPUT_CANVAS_ID = "transformation-output-canvas";
const SNAPSHOT_MAX_EDGE = 560;

export interface OutputSnapshot {
  src: string;
  width: number;
  height: number;
}

const drawScaled = (source: HTMLCanvasElement): string => {
  const scale = Math.min(1, SNAPSHOT_MAX_EDGE / Math.max(source.width, source.height));
  const target = document.createElement("canvas");
  target.width = Math.max(1, Math.round(source.width * scale));
  target.height = Math.max(1, Math.round(source.height * scale));
  target.getContext("2d")?.drawImage(source, 0, 0, target.width, target.height);
  return target.toDataURL("image/png");
};

export const readOutputSnapshot = (): OutputSnapshot | null => {
  const source = document.getElementById(OUTPUT_CANVAS_ID);
  if (!(source instanceof HTMLCanvasElement) || source.width === 0) return null;
  const meta = imageMetaSignal.value;
  const width = meta?.width ?? source.width;
  const height = meta?.height ?? source.height;
  return { src: drawScaled(source), width, height };
};
