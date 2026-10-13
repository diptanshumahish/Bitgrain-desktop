import React, { useEffect, useRef } from "react";
import { usePreviewZoom } from "./use-preview-zoom";
import { fitPreview, refitIfFitting, PREVIEW_STAGE_ID } from "./preview-zoom-store";

interface ZoomStageProps {
  resetKey: string;
  children: React.ReactNode;
}

const observeForRefit = (stage: HTMLElement): (() => void) => {
  const observer = new ResizeObserver(refitIfFitting);
  observer.observe(stage);
  const canvas = stage.querySelector("canvas");
  if (canvas) observer.observe(canvas);
  return () => observer.disconnect();
};

export const ZoomStage: React.FC<ZoomStageProps> = ({ resetKey, children }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  usePreviewZoom(stageRef, contentRef);

  useEffect(() => {
    fitPreview();
  }, [resetKey]);

  useEffect(() => {
    const stage = stageRef.current;
    return stage ? observeForRefit(stage) : undefined;
  }, []);

  return (
    <div
      ref={stageRef}
      id={PREVIEW_STAGE_ID}
      className="relative w-full h-full overflow-hidden data-[zoomed=true]:cursor-grab data-[panning=ready]:cursor-grab data-[panning=dragging]:cursor-grabbing"
    >
      <div ref={contentRef} className="w-full h-full origin-center will-change-transform">
        {children}
      </div>
    </div>
  );
};
