import React, { useRef } from "react";
import { Upload } from "lucide-react";
import type { CustomFontEntry } from "../../../data/studioTypes";
import { emitModal } from "../../../lib/event-bus";
import { storeCustomFont, toFontEntry } from "./custom-font-storage";
import { ACCEPTED_FONT_TYPES, isFontFile, readFontFile } from "./read-font-file";

interface FontUploadButtonProps {
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

export const FontUploadButton: React.FC<FontUploadButtonProps> = ({ onUploaded }) => {
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
        className="flex items-center gap-1.5 text-[10px] text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] transition-colors bg-transparent border-none cursor-pointer w-fit"
      >
        <Upload size={11} strokeWidth={1.5} />
        Upload a font
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
