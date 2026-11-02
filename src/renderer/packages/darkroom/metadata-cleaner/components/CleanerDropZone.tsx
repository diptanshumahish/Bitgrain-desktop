import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { cleanFiles } from "../store/clean-files";

const ACCEPTED_TYPES = "image/*";

const imageFiles = (list: FileList | null): File[] =>
  Array.from(list ?? []).filter((file) => file.type.startsWith("image/") || file.type === "");

export const CleanerDropZone: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    void cleanFiles(imageFiles(event.dataTransfer.files));
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    void cleanFiles(imageFiles(event.target.files));
    event.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="w-full flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--s-border)] px-4 py-8 text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors"
      >
        <Upload size={16} />
        <span className="text-[13px] font-medium">Drop images here or click to choose</span>
        <span className="text-[11.5px]">JPEG, PNG and WebP are cleaned without touching a single pixel</span>
      </button>
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} multiple className="hidden" onChange={handleInput} />
    </>
  );
};
