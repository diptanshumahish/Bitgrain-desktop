import { SmartObjectRenderer } from "./warp-renderer";
import type { MockupQuad, SmartObjectSettings } from "./mockup-types";

export interface ComposeRequest {
  base: TexImageSource;
  artwork: TexImageSource;
  corners: MockupQuad;
  settings: SmartObjectSettings;
  width: number;
  height: number;
}

export const composeSmartObject = (request: ComposeRequest): HTMLCanvasElement | null => {
  const renderer = new SmartObjectRenderer();
  try {
    renderer.setBase(request.base);
    renderer.setArtwork(request.artwork);
    const rendered = renderer.render(request.corners, request.settings, request.width, request.height);
    if (!rendered) return null;

    const output = document.createElement("canvas");
    output.width = request.width;
    output.height = request.height;
    const context = output.getContext("2d");
    if (!context) return null;
    context.drawImage(rendered, 0, 0);
    return output;
  } finally {
    renderer.dispose();
  }
};
