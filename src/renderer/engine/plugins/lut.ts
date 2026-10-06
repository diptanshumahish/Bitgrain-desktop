import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { getLUT } from '../luts';

export const LUTPlugin: ImagePlugin = {
  id: 'lut',
  name: 'Color Grade (LUT)',
  category: 'Filters',
  transform(ctx: TransformContext): TransformationResult {
    const { data, width, height, lutId } = ctx;
    const lut = lutId ? getLUT(lutId) : undefined;

    const colorData = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.max(0, Math.min(255, data[i]));
      const g = Math.max(0, Math.min(255, data[i + 1]));
      const b = Math.max(0, Math.min(255, data[i + 2]));

      if (lut) {
        const [nr, ng, nb] = lut.apply(r, g, b);
        colorData[i] = nr;
        colorData[i + 1] = ng;
        colorData[i + 2] = nb;
      } else {
        colorData[i] = r;
        colorData[i + 1] = g;
        colorData[i + 2] = b;
      }
      colorData[i + 3] = 255;
    }

    return { colorData };
  },
};
