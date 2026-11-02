import { useEffect, useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { MaskBounds } from "@bitgrain/studio-core/mask/mask-bounds";
import { maskResolution, renderMaskImage } from "./render-mask-image";

const HIDDEN_MASK = "linear-gradient(transparent, transparent)";

interface MaskInput {
  mask: Layer;
  bounds: MaskBounds;
  resolution: number;
  pageImage: string | null;
}

const applyMask = (element: HTMLDivElement | null, image: string): void => {
  if (!element) return;
  element.style.maskImage = image;
  element.style.webkitMaskImage = image;
};

export const useMaskImage = (
  mask: Layer,
  bounds: MaskBounds,
  scale: number,
  pageImage: string | null,
): React.RefObject<HTMLDivElement | null> => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const resolution = maskResolution(bounds, scale, window.devicePixelRatio || 1);
  const inputRef = useRef<MaskInput>({ mask, bounds, resolution, pageImage });
  const maskKey = `${JSON.stringify(mask)}|${JSON.stringify(bounds)}|${resolution}|${pageImage ?? ""}`;

  useEffect(() => {
    inputRef.current = { mask, bounds, resolution, pageImage };
  });

  useEffect(() => {
    const token = ++tokenRef.current;
    const input = inputRef.current;
    if (!urlRef.current) applyMask(wrapperRef.current, HIDDEN_MASK);
    renderMaskImage(input.mask, input.bounds, input.resolution, input.pageImage)
      .then((url) => {
        if (token !== tokenRef.current) {
          URL.revokeObjectURL(url);
          return;
        }
        applyMask(wrapperRef.current, `url("${url}")`);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
      })
      .catch((error: unknown) => console.error("Mask render failed", error));
  }, [maskKey]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return wrapperRef;
};
