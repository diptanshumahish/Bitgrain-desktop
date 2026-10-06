import type { EncodeRequest, EncodeResponse } from "./export-types";
import { MIME_BY_FORMAT } from "./export-types";
import { applyTransparencyKey, encodePng, encodeHdrPngWithProgress } from "./encode-image";

const PROGRESS_START = 0.1;
const PROGRESS_PAINTED = 0.5;
const PROGRESS_DONE = 1;

const post = (message: EncodeResponse, transfer?: Transferable[]): void => {
  (self as unknown as Worker).postMessage(message, transfer ?? []);
};

const toArrayBuffer = (bytes: Uint8Array<ArrayBuffer>): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

const encodeViaCanvas = async (
  id: number,
  data: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  height: number,
  mime: string,
  quality: number,
): Promise<ArrayBuffer> => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  post({ type: "progress", id, value: PROGRESS_PAINTED });
  const blob = await canvas.convertToBlob({ type: mime, quality });
  return blob.arrayBuffer();
};

self.onmessage = async (event: MessageEvent<EncodeRequest>): Promise<void> => {
  const request = event.data;
  const { id, format, width, height, quality, transparent, bgColor } = request;
  try {
    const data = new Uint8ClampedArray(request.buffer);
    if (transparent && format !== "jpeg") {
      applyTransparencyKey(data, bgColor);
    }
    post({ type: "progress", id, value: PROGRESS_START });

    if (format === "png") {
      const bytes = encodePng(data, width, height, quality, request.lossless ?? false, (value) =>
        post({ type: "progress", id, value }),
      );
      const buffer = toArrayBuffer(bytes);
      post({ type: "done", id, bytes: buffer, mime: MIME_BY_FORMAT.png }, [buffer]);
      return;
    }

    if (format === "png-hdr") {
      const bytes = encodeHdrPngWithProgress(data, width, height, request.peakNits, (value) =>
        post({ type: "progress", id, value }),
      );
      const buffer = toArrayBuffer(bytes);
      post({ type: "done", id, bytes: buffer, mime: MIME_BY_FORMAT["png-hdr"] }, [buffer]);
      return;
    }

    const mime = MIME_BY_FORMAT[format];
    const buffer = await encodeViaCanvas(id, data, width, height, mime, quality);
    post({ type: "progress", id, value: PROGRESS_DONE });
    post({ type: "done", id, bytes: buffer, mime }, [buffer]);
  } catch (error) {
    post({ type: "error", id, message: error instanceof Error ? error.message : String(error) });
  }
};
