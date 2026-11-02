import React, { useEffect, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { styleThumbsSignal } from "./style-thumbs";

interface StyleThumbProps {
  styleId: string;
  className?: string;
}

export const StyleThumb: React.FC<StyleThumbProps> = ({ styleId, className = "" }) => {
  const thumbs = useSignalValue(styleThumbsSignal);
  const bitmap = thumbs.get(styleId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bitmap) return;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  return bitmap
    ? <canvas ref={canvasRef} aria-hidden="true" className={`block w-full h-full object-cover ${className}`} />
    : <div aria-hidden="true" className={`w-full h-full animate-pulse bg-[var(--s-bg-input)] ${className}`} />;
};
