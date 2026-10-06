import { useEffect } from "react";
import { clipboardHasImage, ingestClipboardImages } from "./studio-image-intake";

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export const useStudioPaste = (): void => {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) return;
      if (!clipboardHasImage(event.clipboardData)) return;
      event.preventDefault();
      ingestClipboardImages(event.clipboardData);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);
};
