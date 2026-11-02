import { useEffect, useRef, useState } from "react";
import { orientImage, type OrientAction } from "./orient-image";
import { canvasToBlob } from "../../../editor/image-edits/canvas-to-blob";

interface OrientedSource {
  displayUrl: string | null;
  orienting: boolean;
  orient: (source: HTMLImageElement, action: OrientAction) => Promise<void>;
  resetOrientation: () => void;
}

export const useOrientedSource = (originalUrl: string | null): OrientedSource => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(originalUrl);
  const [orienting, setOrienting] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const showPreview = (nextUrl: string | null): void => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setDisplayUrl(nextUrl ?? originalUrl);
  };

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const orient = async (source: HTMLImageElement, action: OrientAction): Promise<void> => {
    setOrienting(true);
    try {
      const blob = await canvasToBlob(orientImage(source, action));
      showPreview(URL.createObjectURL(blob));
    } finally {
      setOrienting(false);
    }
  };

  return { displayUrl, orienting, orient, resetOrientation: () => showPreview(null) };
};
