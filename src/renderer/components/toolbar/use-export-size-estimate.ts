import { useEffect, useRef, useState } from "react";
import { getExportImageData } from "../../engine/Exporter";
import { encodeImage } from "../../engine/export/export-client";
import { imageMetaSignal } from "../../store/image-store";
import type { ExportFormat } from "../../engine/export/export-types";

const CANVAS_ID = "transformation-output-canvas";
const DEBOUNCE_MS = 350;
const PREVIEW_BG = "#fdf6e3";

interface EstimateInput {
  format: ExportFormat;
  qualityFraction: number;
  scale: number;
  transparent: boolean;
  enabled: boolean;
}

interface EstimateResult {
  bytes: number | null;
  loading: boolean;
}

const nativeScale = (canvasWidth: number, userScale: number): number => {
  const meta = imageMetaSignal.value;
  if (!meta || canvasWidth <= 0) return userScale;
  return (meta.width / canvasWidth) * userScale;
};

export function useExportSizeEstimate(input: EstimateInput): EstimateResult {
  const { format, qualityFraction, scale, transparent, enabled } = input;
  const [bytes, setBytes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    const timer = window.setTimeout(() => {
      const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
      if (!canvas) {
        setBytes(null);
        return;
      }
      setLoading(true);
      void (async () => {
        try {
          const { data, width, height } = await getExportImageData(
            canvas,
            nativeScale(canvas.width, scale),
            false,
          );
          const blob = await encodeImage({
            format,
            quality: qualityFraction,
            transparent: transparent && format !== "jpeg",
            bgColor: PREVIEW_BG,
            width,
            height,
            data,
          });
          if (requestRef.current === requestId) {
            setBytes(blob.size);
            setLoading(false);
          }
        } catch {
          if (requestRef.current === requestId) {
            setBytes(null);
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [format, qualityFraction, scale, transparent, enabled]);

  return { bytes, loading };
}
