import { useEffect, useRef, useState } from "react";
import { encodeImage } from "@bitgrain/engine/export/export-client";
import { resolveRenderScale } from "../editor/download-handlers";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";
import { sampleExportPixels } from "./export-estimate/sample-export-pixels";

const CANVAS_ID = "transformation-output-canvas";
const DEBOUNCE_MS = 350;
const PREVIEW_BG = "#fdf6e3";

interface EstimateInput {
  format: ExportFormat;
  qualityFraction: number;
  scale: number;
  transparent: boolean;
  enabled: boolean;
  plan: string;
}

interface EstimateResult {
  bytes: number | null;
  loading: boolean;
}

export function useExportSizeEstimate(input: EstimateInput): EstimateResult {
  const { format, qualityFraction, scale, transparent, enabled, plan } = input;
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
          const sample = sampleExportPixels(canvas, resolveRenderScale(plan, scale));
          if (!sample) throw new Error("export estimate could not sample the preview");
          const { data, width, height } = sample;
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
            setBytes(Math.round(blob.size * sample.areaRatio));
            setLoading(false);
          }
        } catch (error) {
          console.error("export size estimate failed:", error);
          if (requestRef.current === requestId) {
            setBytes(null);
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [format, qualityFraction, scale, transparent, enabled, plan]);

  return { bytes, loading };
}
