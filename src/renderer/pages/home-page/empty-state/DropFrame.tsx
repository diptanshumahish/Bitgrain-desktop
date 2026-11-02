import React from "react";
import { ImagePlus } from "lucide-react";
import { CropMarks } from "./CropMarks";
import { IMAGE_ACCEPT } from "../accept-formats";

interface DropFrameProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DropFrame: React.FC<DropFrameProps> = ({ onUpload }) => (
  <label
    className="group relative mt-8 w-full flex flex-col items-center justify-center gap-4 min-h-[clamp(180px,30vh,300px)] cursor-pointer rounded-sm border border-[var(--s-border)] bg-[var(--s-bg-panel)]/70 backdrop-blur-sm px-6 py-10 transition-colors hover:bg-[var(--s-bg-panel)] focus-within:ring-2 focus-within:ring-violet-500"
  >
    <CropMarks />
    <input type="file" className="sr-only" aria-label="Choose an image" onChange={onUpload} accept={IMAGE_ACCEPT} />
    <ImagePlus size={28} strokeWidth={1.5} className="text-[var(--s-text-muted)] transition-colors group-hover:text-[var(--s-text)]" />
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-[17px] font-medium text-[var(--s-text)] pointer-coarse:hidden">drop a photo anywhere on the page</span>
      <span className="hidden pointer-coarse:inline text-[17px] font-medium text-[var(--s-text)]">tap to choose a photo</span>
      <span className="text-[13px] text-[var(--s-text-muted)] pointer-coarse:hidden">
        or <span className="underline underline-offset-4 decoration-[var(--s-border-strong)]/30 group-hover:decoration-[var(--s-border-strong)]">browse your files</span>, or paste one from your clipboard
      </span>
    </div>
    <span className="text-[12px] text-[var(--s-text-muted)] opacity-70">jpg, png, webp, heic and camera raw</span>
  </label>
);
