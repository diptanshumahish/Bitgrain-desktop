import { callApi } from "../../lib/api-client";
import type { MockupQuad } from "../../engine/mockup/mockup-types";
import type { LegacyMockupSlot } from "../../engine/mockup/slot-corners";

export interface MockupSlot extends LegacyMockupSlot {
  corners?: MockupQuad;
}

export interface BackendMockup {
  id: string;
  name: string;
  category: string;
  baseAssetId: string;
  overlayAssetId: string | null;
  slot: MockupSlot;
  outputWidth: number;
  outputHeight: number;
}

export const fetchMockups = () => callApi<{ items: BackendMockup[] }>("/api/mockups");

export const assetUrl = (id: string): string => `/api/assets/${id}`;

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
