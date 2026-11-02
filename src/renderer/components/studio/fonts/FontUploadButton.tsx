import React, { useRef } from "react";
import type { CustomFontEntry } from "../../../data/studioTypes";
import { emitModal } from "../../../lib/event-bus";
import { storeCustomFont, toFontEntry } from "./custom-font-storage";
import { ACCEPTED_FONT_TYPES, isFontFile, readFontFile } from "./read-font-file";

interface FontUploadButtonProps {
  className: string;
  title: string;
  children: React.ReactNode;
  onUploaded: (font: CustomFontEntry) => void;
}

const showFontError = (message: string): void => {
  emitModal({
    type: "confirm",
    title: "Font not added",
    message,
    confirmLabel: "Ok",
    onConfirm: () => undefined,
  });
};

export const FontUploadButton: React.FC<FontUploadButtonProps> = ({ className, title, children, onUploaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isFontFile(file)) {
      showFontError("Pick a TTF, OTF, WOFF or WOFF2 file.");
      return;
    }
    try {
      const font = await readFontFile(file);
      storeCustomFont(font);
      onUploaded(toFontEntry(font.label));
    } catch {
      showFontError("We could not read that font, or it is too large to keep in this browser.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={title}
        className={className}
      >
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FONT_TYPES}
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
};
