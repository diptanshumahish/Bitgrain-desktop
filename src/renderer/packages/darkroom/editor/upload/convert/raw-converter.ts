const RAW_EXTENSIONS = [
  "dng", "cr2", "cr3", "crw", "nef", "nrw", "arw", "srf", "sr2",
  "raf", "rw2", "orf", "pef", "ptx", "srw", "x3f", "raw", "3fr",
  "mrw", "mef", "mos", "kdc", "dcr", "erf", "rwl", "iiq", "fff",
] as const;

const JPEG_QUALITY = 0.95;
const DEFAULT_COLORS = 3;
const DEFAULT_BITS = 8;
const MIN_USABLE_DIMENSION = 256;

export const isRawFile = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  return RAW_EXTENSIONS.some((ext) => lower.endsWith(`.${ext}`));
};

const isDngFile = (file: File): boolean =>
  file.name.toLowerCase().endsWith(".dng");

type AnyRecord = Record<string, unknown>;

type RawDims = {
  width: number;
  height: number;
  colors: number;
  bits: number;
  pixels: Uint8Array | Uint16Array;
};

const readNumber = (obj: AnyRecord, key: string): number | undefined => {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
};

const isTypedView = (value: unknown): value is ArrayBufferView =>
  value !== null && typeof value === "object" && ArrayBuffer.isView(value as ArrayBufferView);

const resolveDims = (raw: unknown, meta: AnyRecord): RawDims => {
  if (raw && typeof raw === "object" && !isTypedView(raw)) {
    const obj = raw as AnyRecord;
    const data = obj.data as Uint8Array | Uint16Array | undefined;
    if (data && isTypedView(data)) {
      return {
        width: readNumber(obj, "width") ?? 0,
        height: readNumber(obj, "height") ?? 0,
        colors: readNumber(obj, "colors") ?? readNumber(obj, "channels") ?? DEFAULT_COLORS,
        bits: readNumber(obj, "bits") ?? DEFAULT_BITS,
        pixels: data,
      };
    }
  }
  const sizes = (meta.sizes as AnyRecord | undefined) ?? meta;
  const width =
    readNumber(sizes, "iwidth") ??
    readNumber(sizes, "width") ??
    readNumber(meta, "width") ??
    0;
  const height =
    readNumber(sizes, "iheight") ??
    readNumber(sizes, "height") ??
    readNumber(meta, "height") ??
    0;
  return {
    width,
    height,
    colors:
      readNumber(meta, "colors") ?? readNumber(meta, "channels") ?? DEFAULT_COLORS,
    bits: readNumber(meta, "bits") ?? readNumber(meta, "outputBps") ?? DEFAULT_BITS,
    pixels: raw as Uint8Array | Uint16Array,
  };
};

const renderRawDimsToCanvas = (dims: RawDims): HTMLCanvasElement => {
  const { width, height, pixels, colors, bits } = dims;
  if (!width || !height) throw new Error("raw-missing-dimensions");
  if (!pixels || typeof pixels.length !== "number") throw new Error("raw-missing-pixels");

  const expectedLength = width * height * colors;
  if (pixels.length < expectedLength) {
    throw new Error(
      `raw-buffer-too-small:expected=${expectedLength}:actual=${pixels.length}:w=${width}:h=${height}:colors=${colors}`,
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-2d-unavailable");
  const out = ctx.createImageData(width, height);
  const pixelCount = width * height;
  const is16Bit = bits > 8 || pixels instanceof Uint16Array;
  const shift = is16Bit ? Math.max(0, bits - 8) || 8 : 0;
  for (let i = 0; i < pixelCount; i++) {
    const srcIdx = i * colors;
    const dstIdx = i * 4;
    const r = pixels[srcIdx];
    const g = colors > 1 ? pixels[srcIdx + 1] : r;
    const b = colors > 2 ? pixels[srcIdx + 2] : r;
    out.data[dstIdx] = shift ? r >> shift : r;
    out.data[dstIdx + 1] = shift ? g >> shift : g;
    out.data[dstIdx + 2] = shift ? b >> shift : b;
    out.data[dstIdx + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
};

const canvasToJpegFile = (canvas: HTMLCanvasElement, name: string): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("canvas-toBlob-failed"));
          return;
        }
        const jpegName = name.replace(/\.[^.]+$/, ".jpg");
        resolve(new File([blob], jpegName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

type UtifIfd = AnyRecord & {
  width?: number;
  height?: number;
  data?: Uint8Array;
  subIFD?: UtifIfd[];
};

type UtifModule = {
  decode: (buf: ArrayBuffer) => UtifIfd[];
  decodeImage: (buf: ArrayBuffer, ifd: UtifIfd) => void;
  toRGBA8: (ifd: UtifIfd) => Uint8Array;
};

const PHOTOMETRIC_CFA = 32803;
const PHOTOMETRIC_LINEAR_RAW = 34892;

const flattenIfds = (ifds: UtifIfd[]): UtifIfd[] => {
  const out: UtifIfd[] = [];
  const visit = (entries: UtifIfd[]): void => {
    for (const ifd of entries) {
      out.push(ifd);
      if (Array.isArray(ifd.subIFD)) visit(ifd.subIFD);
    }
  };
  visit(ifds);
  return out;
};

const readIfdDim = (ifd: UtifIfd, tag: string): number => {
  const value = ifd[tag];
  if (Array.isArray(value) && typeof value[0] === "number") return value[0];
  return 0;
};

const isRawPhotometricIfd = (ifd: UtifIfd): boolean => {
  const photometric = readIfdDim(ifd, "t262");
  return photometric === PHOTOMETRIC_CFA || photometric === PHOTOMETRIC_LINEAR_RAW;
};

const tryDecodeDngWithUtif = async (file: File): Promise<HTMLCanvasElement | null> => {
  const mod = (await import("utif")) as unknown as { default?: UtifModule } & UtifModule;
  const UTIF: UtifModule = mod.default ?? mod;
  const buffer = await file.arrayBuffer();

  let ifds: UtifIfd[];
  try {
    ifds = UTIF.decode(buffer);
  } catch {
    return null;
  }
  if (!ifds.length) return null;

  const candidates = flattenIfds(ifds)
    .filter((ifd) => !isRawPhotometricIfd(ifd))
    .map((ifd) => ({
      ifd,
      width: readIfdDim(ifd, "t256"),
      height: readIfdDim(ifd, "t257"),
    }))
    .filter((entry) => entry.width >= MIN_USABLE_DIMENSION && entry.height >= MIN_USABLE_DIMENSION)
    .sort((a, b) => b.width * b.height - a.width * a.height);

  for (const candidate of candidates) {
    try {
      UTIF.decodeImage(buffer, candidate.ifd);
      const rgba = UTIF.toRGBA8(candidate.ifd);
      const width = candidate.ifd.width ?? candidate.width;
      const height = candidate.ifd.height ?? candidate.height;
      if (!width || !height) continue;
      if (rgba.length < width * height * 4) continue;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      const clamped = new Uint8ClampedArray(rgba.byteLength);
      clamped.set(rgba);
      ctx.putImageData(new ImageData(clamped, width, height), 0, 0);
      return canvas;
    } catch {
      continue;
    }
  }
  return null;
};

type LibRawInstance = {
  open: (buf: Uint8Array, opts?: Record<string, unknown>) => Promise<void>;
  metadata: (full?: boolean) => Promise<AnyRecord>;
  imageData: () => Promise<unknown>;
};

const decodeWithLibRaw = async (file: File): Promise<HTMLCanvasElement> => {
  const mod: unknown = await import("libraw-wasm");
  const LibRawCtor =
    (mod as { default?: new () => LibRawInstance }).default ??
    (mod as new () => LibRawInstance);
  const libraw = new LibRawCtor();
  const buffer = await file.arrayBuffer();
  await libraw.open(new Uint8Array(buffer), {
    useCameraWb: true,
    outputBps: 8,
    outputColor: 1,
  });
  const meta = await libraw.metadata(true);
  const raw = await libraw.imageData();
  const dims = resolveDims(raw, meta);
  return renderRawDimsToCanvas(dims);
};

export const convertRawToJpeg = async (file: File): Promise<File> => {
  if (isDngFile(file)) {
    const utifCanvas = await tryDecodeDngWithUtif(file);
    if (utifCanvas) return canvasToJpegFile(utifCanvas, file.name);
  }
  const canvas = await decodeWithLibRaw(file);
  return canvasToJpegFile(canvas, file.name);
};
