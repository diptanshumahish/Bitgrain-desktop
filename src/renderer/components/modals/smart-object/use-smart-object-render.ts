import { useEffect, useRef } from "react";
import { SmartObjectRenderer } from "../../../engine/mockup/warp-renderer";
import type { MockupQuad, SmartObjectSettings } from "../../../engine/mockup/mockup-types";

const PREVIEW_MAX_EDGE = 2200;

export interface PreviewSize {
  width: number;
  height: number;
}

export const fitPreviewSize = (width: number, height: number): PreviewSize => {
  const longest = Math.max(width, height);
  if (longest <= PREVIEW_MAX_EDGE) return { width, height };
  const scale = PREVIEW_MAX_EDGE / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

export const useSmartObjectRender = (
  base: HTMLImageElement | null,
  artwork: HTMLCanvasElement | null,
  corners: MockupQuad,
  settings: SmartObjectSettings,
  previewRef: React.RefObject<HTMLCanvasElement | null>,
): void => {
  const rendererRef = useRef<SmartObjectRenderer | null>(null);

  useEffect(() => () => {
    rendererRef.current?.dispose();
    rendererRef.current = null;
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!base || !artwork || !preview) return;

    if (!rendererRef.current) {
      try {
        rendererRef.current = new SmartObjectRenderer();
      } catch {
        return;
      }
    }
    const renderer = rendererRef.current;
    renderer.setBase(base);
    renderer.setArtwork(artwork);

    const size = fitPreviewSize(base.naturalWidth, base.naturalHeight);
    const rendered = renderer.render(corners, settings, size.width, size.height);
    if (!rendered) return;

    if (preview.width !== size.width || preview.height !== size.height) {
      preview.width = size.width;
      preview.height = size.height;
    }
    const context = preview.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, size.width, size.height);
    context.drawImage(rendered, 0, 0);
  }, [base, artwork, corners, settings, previewRef]);
};
