import { convertedSourceSignal } from "./converted-source-store";
import type { ConversionFormat } from "../../upload/upload-errors";

export const CONVERTED_SOURCE_KEY = "imgi_converted_source";

const CONVERSION_FORMATS: readonly ConversionFormat[] = ["heic", "raw", "tiff"];

const isConversionFormat = (value: string | null): value is ConversionFormat =>
  CONVERSION_FORMATS.some((format) => format === value);

export const setConvertedSource = (format: ConversionFormat | null): void => {
  convertedSourceSignal.value = format;
  if (format) localStorage.setItem(CONVERTED_SOURCE_KEY, format);
  else localStorage.removeItem(CONVERTED_SOURCE_KEY);
};

export const restoreConvertedSource = (): void => {
  const stored = localStorage.getItem(CONVERTED_SOURCE_KEY);
  convertedSourceSignal.value = isConversionFormat(stored) ? stored : null;
};
