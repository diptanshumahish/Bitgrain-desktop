import { useEffect, useRef, type RefObject } from "react";
import { handleImageUploadFile } from "../upload/handle-image-upload";
import { isFileDrag, firstDroppedFile, isTypingTarget, firstPastedImage } from "./window-file-events";

const setOverlayActive = (overlay: HTMLElement | null, active: boolean): void => {
  if (overlay) overlay.dataset.active = active ? "true" : "false";
};

export const useWindowImageIntake = (overlayRef: RefObject<HTMLDivElement | null>): void => {
  const dragDepthRef = useRef(0);

  useEffect(() => {
    const handleDragEnter = (event: DragEvent): void => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setOverlayActive(overlayRef.current, true);
    };
    const handleDragOver = (event: DragEvent): void => {
      if (isFileDrag(event)) event.preventDefault();
    };
    const handleDragLeave = (event: DragEvent): void => {
      if (!isFileDrag(event)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setOverlayActive(overlayRef.current, false);
    };
    const handleDrop = (event: DragEvent): void => {
      if (!isFileDrag(event)) return;
      dragDepthRef.current = 0;
      setOverlayActive(overlayRef.current, false);
      if (event.defaultPrevented) return;
      event.preventDefault();
      const file = firstDroppedFile(event);
      if (file) void handleImageUploadFile(file, "drop");
    };
    const handlePaste = (event: ClipboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      const file = firstPastedImage(event);
      if (!file) return;
      event.preventDefault();
      void handleImageUploadFile(file, "paste");
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
    };
  }, [overlayRef]);
};
