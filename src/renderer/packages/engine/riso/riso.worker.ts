import { separateRisoPixels } from "./riso-separation";

interface RisoRequest {
  id: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  inks: number[][];
}

interface RisoResponse {
  id: number;
  width: number;
  height: number;
  preview: ArrayBuffer;
  layers: ArrayBuffer[];
}

self.onmessage = (event: MessageEvent<RisoRequest>) => {
  const { id, buffer, width, height, inks } = event.data;
  const separated = separateRisoPixels({ source: new Uint8ClampedArray(buffer), width, height, inks });
  const layerBuffers = separated.layers.map((layer) => layer.buffer);
  const response: RisoResponse = { id, width, height, preview: separated.preview.buffer, layers: layerBuffers };
  (self as unknown as Worker).postMessage(response, [separated.preview.buffer, ...layerBuffers]);
};
