import { runBand, type BandTransformSpec } from "./band-runner";

interface BandJobMessage {
  id: number;
  pixels: ArrayBuffer;
  cols: number;
  bandRows: number;
  spec: BandTransformSpec;
}

self.onmessage = (event: MessageEvent<BandJobMessage>) => {
  const { id, pixels, cols, bandRows, spec } = event.data;
  const bandColor = runBand(new Float32Array(pixels), cols, bandRows, spec);
  const buffer = bandColor.buffer as ArrayBuffer;
  (self as unknown as Worker).postMessage({ id, color: buffer }, [buffer]);
};
