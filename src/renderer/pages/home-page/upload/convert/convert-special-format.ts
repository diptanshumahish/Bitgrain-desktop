import { emitModal } from "../../../../lib/event-bus";
import { trackEvent as trackPosthog } from "../../../../lib/analytics";
import { isRawFile, convertRawToJpeg } from "./raw-converter";
import { isTiffFile, convertTiffToJpeg } from "./tiff-converter";
import { isHeicFile, convertHeicToJpeg } from "./convert-heic";
import { ConversionFailedError, type ConversionFormat } from "../upload-errors";
import { isLatestUpload } from "../upload-sequence";

const BYTES_PER_KB = 1024;

type Converter = (file: File) => Promise<File>;

const CONVERTERS: Record<ConversionFormat, Converter> = {
  heic: convertHeicToJpeg,
  raw: convertRawToJpeg,
  tiff: convertTiffToJpeg,
};

const detectFormat = (file: File): ConversionFormat | null => {
  if (isHeicFile(file)) return "heic";
  if (isRawFile(file)) return "raw";
  if (isTiffFile(file)) return "tiff";
  return null;
};

const finishToast = (format: ConversionFormat, token: number, succeeded: boolean): void => {
  if (!isLatestUpload(token)) return;
  emitModal({ type: "heic-status", status: succeeded ? "done" : "failed", format });
};

export const convertSpecialFormat = async (file: File, token: number): Promise<File> => {
  const format = detectFormat(file);
  if (!format) return file;
  trackPosthog(`${format}_conversion_started`, { file_size_kb: Math.round(file.size / BYTES_PER_KB) });
  emitModal({ type: "heic-status", status: "converting", format });
  let succeeded = false;
  try {
    const converted = await CONVERTERS[format](file);
    succeeded = true;
    trackPosthog(`${format}_conversion_completed`);
    return converted;
  } catch (error) {
    trackPosthog(`${format}_conversion_failed`, { error: String(error) });
    throw new ConversionFailedError(format, error);
  } finally {
    finishToast(format, token, succeeded);
  }
};
