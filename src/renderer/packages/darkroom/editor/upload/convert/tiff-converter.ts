const TIFF_EXTENSIONS = ["tif", "tiff"] as const;
const JPEG_QUALITY = 0.95;

export const isTiffFile = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  if (file.type === "image/tiff" || file.type === "image/tif") return true;
  return TIFF_EXTENSIONS.some((ext) => lower.endsWith(`.${ext}`));
};

type UtifModule = {
  decode: (buf: ArrayBuffer) => Array<{ width: number; height: number }>;
  decodeImage: (
    buf: ArrayBuffer,
    ifd: { width: number; height: number },
  ) => void;
  toRGBA8: (ifd: { width: number; height: number }) => Uint8Array;
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

export const convertTiffToJpeg = async (file: File): Promise<File> => {
  const mod = (await import("utif")) as unknown as { default?: UtifModule } & UtifModule;
  const UTIF: UtifModule = mod.default ?? mod;
  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  if (!ifds.length) throw new Error("tiff-no-frames");
  const first = ifds[0];
  UTIF.decodeImage(buffer, first);
  const rgba = UTIF.toRGBA8(first);
  const canvas = document.createElement("canvas");
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-2d-unavailable");
  const clamped = new Uint8ClampedArray(rgba.byteLength);
  clamped.set(rgba);
  const imgData = new ImageData(clamped, first.width, first.height);
  ctx.putImageData(imgData, 0, 0);
  return canvasToJpegFile(canvas, file.name);
};
