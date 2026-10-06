import type { FrameEncodeOptions } from "./export-frames";

const GIF_MAX_EDGE = 480;

interface ColorBox {
  pixels: number[];
}

const median = (samples: number[]): number[] => {
  const boxes: ColorBox[] = [{ pixels: samples }];
  while (boxes.length < 256) {
    let target = -1;
    let widest = -1;
    let channel = 0;
    for (let index = 0; index < boxes.length; index += 1) {
      const box = boxes[index];
      if (box.pixels.length < 2) continue;
      let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
      for (const packed of box.pixels) {
        const r = (packed >> 16) & 255;
        const g = (packed >> 8) & 255;
        const b = packed & 255;
        if (r < rMin) rMin = r; if (r > rMax) rMax = r;
        if (g < gMin) gMin = g; if (g > gMax) gMax = g;
        if (b < bMin) bMin = b; if (b > bMax) bMax = b;
      }
      const ranges = [rMax - rMin, gMax - gMin, bMax - bMin];
      const maxRange = Math.max(ranges[0], ranges[1], ranges[2]);
      if (maxRange > widest) {
        widest = maxRange;
        target = index;
        channel = ranges.indexOf(maxRange);
      }
    }
    if (target < 0) break;
    const shift = channel === 0 ? 16 : channel === 1 ? 8 : 0;
    const box = boxes[target];
    box.pixels.sort((a, b) => ((a >> shift) & 255) - ((b >> shift) & 255));
    const mid = box.pixels.length >> 1;
    const left = box.pixels.slice(0, mid);
    const right = box.pixels.slice(mid);
    boxes.splice(target, 1, { pixels: left }, { pixels: right });
  }
  const palette: number[] = [];
  for (const box of boxes) {
    let r = 0, g = 0, b = 0;
    for (const packed of box.pixels) {
      r += (packed >> 16) & 255;
      g += (packed >> 8) & 255;
      b += packed & 255;
    }
    const count = box.pixels.length || 1;
    palette.push(Math.round(r / count), Math.round(g / count), Math.round(b / count));
  }
  while (palette.length < 256 * 3) palette.push(0);
  return palette;
};

const nearestIndex = (palette: number[], packed: number, cache: Map<number, number>): number => {
  const cached = cache.get(packed);
  if (cached !== undefined) return cached;
  const r = (packed >> 16) & 255;
  const g = (packed >> 8) & 255;
  const b = packed & 255;
  let best = 0;
  let bestDist = Infinity;
  for (let index = 0; index < 256; index += 1) {
    const dr = r - palette[index * 3];
    const dg = g - palette[index * 3 + 1];
    const db = b - palette[index * 3 + 2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  }
  cache.set(packed, best);
  return best;
};

class ByteWriter {
  bytes: number[] = [];
  byte(value: number): void {
    this.bytes.push(value & 255);
  }
  word(value: number): void {
    this.bytes.push(value & 255, (value >> 8) & 255);
  }
  raw(values: number[]): void {
    for (const value of values) this.bytes.push(value & 255);
  }
}

const lzwEncode = (indices: Uint8Array, minCodeSize: number): number[] => {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let dict = new Map<string, number>();
  let next = endCode + 1;
  const reset = (): void => {
    dict = new Map();
    for (let index = 0; index < clearCode; index += 1) dict.set(String(index), index);
    next = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  const out: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const emit = (code: number): void => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      out.push(bitBuffer & 255);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  reset();
  emit(clearCode);
  let current = String(indices[0]);
  for (let index = 1; index < indices.length; index += 1) {
    const next2 = String(indices[index]);
    const combined = `${current},${next2}`;
    if (dict.has(combined)) {
      current = combined;
    } else {
      emit(dict.get(current)!);
      dict.set(combined, next);
      next += 1;
      if (next > (1 << codeSize) && codeSize < 12) codeSize += 1;
      if (next >= 4096) {
        emit(clearCode);
        reset();
      }
      current = next2;
    }
  }
  emit(dict.get(current)!);
  emit(endCode);
  if (bitCount > 0) out.push(bitBuffer & 255);
  return out;
};

const writeImageData = (writer: ByteWriter, indices: Uint8Array): void => {
  const minCodeSize = 8;
  writer.byte(minCodeSize);
  const data = lzwEncode(indices, minCodeSize);
  let offset = 0;
  while (offset < data.length) {
    const chunk = Math.min(255, data.length - offset);
    writer.byte(chunk);
    writer.raw(data.slice(offset, offset + chunk));
    offset += chunk;
  }
  writer.byte(0);
};

export async function encodeFramesGif(options: FrameEncodeOptions): Promise<Blob> {
  const { width, height, fps, frameCount, renderFrame, onProgress } = options;
  const scale = Math.min(1, GIF_MAX_EDGE / Math.max(width, height));
  const gifW = Math.max(1, Math.round(width * scale));
  const gifH = Math.max(1, Math.round(height * scale));

  const scratch = document.createElement("canvas");
  scratch.width = gifW;
  scratch.height = gifH;
  const ctx = scratch.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const frames: Uint8ClampedArray[] = [];
  for (let frame = 0; frame < frameCount; frame += 1) {
    const rendered = await renderFrame(frame);
    ctx.clearRect(0, 0, gifW, gifH);
    ctx.drawImage(rendered, 0, 0, gifW, gifH);
    frames.push(ctx.getImageData(0, 0, gifW, gifH).data);
    onProgress?.(((frame + 1) / frameCount) * 0.7);
  }

  const samples: number[] = [];
  const first = frames[0];
  for (let index = 0; index < first.length; index += 16) {
    samples.push((first[index] << 16) | (first[index + 1] << 8) | first[index + 2]);
  }
  const palette = median(samples);
  const cache = new Map<number, number>();

  const writer = new ByteWriter();
  writer.raw([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  writer.word(gifW);
  writer.word(gifH);
  writer.byte(0xf7);
  writer.byte(0);
  writer.byte(0);
  writer.raw(palette);
  writer.raw([0x21, 0xff, 0x0b]);
  writer.raw([0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30]);
  writer.raw([0x03, 0x01, 0x00, 0x00, 0x00]);

  const delay = Math.max(2, Math.round(100 / fps));
  for (let frame = 0; frame < frames.length; frame += 1) {
    const pixels = frames[frame];
    const indices = new Uint8Array(gifW * gifH);
    for (let pixel = 0; pixel < indices.length; pixel += 1) {
      const offset = pixel * 4;
      const packed = (pixels[offset] << 16) | (pixels[offset + 1] << 8) | pixels[offset + 2];
      indices[pixel] = nearestIndex(palette, packed, cache);
    }
    writer.raw([0x21, 0xf9, 0x04, 0x00]);
    writer.word(delay);
    writer.raw([0x00, 0x00]);
    writer.byte(0x2c);
    writer.word(0);
    writer.word(0);
    writer.word(gifW);
    writer.word(gifH);
    writer.byte(0);
    writeImageData(writer, indices);
    onProgress?.(0.7 + ((frame + 1) / frames.length) * 0.3);
  }
  writer.byte(0x3b);

  return new Blob([new Uint8Array(writer.bytes)], { type: "image/gif" });
}
