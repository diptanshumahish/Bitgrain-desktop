import React from "react";
import { ImagePlus } from "lucide-react";

interface TopBarOpenPhotoProps {
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageAccept: string;
}

export const TopBarOpenPhoto: React.FC<TopBarOpenPhotoProps> = ({ onImageUpload, imageAccept }) => (
  <label data-tutorial="home-upload"
    className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-[var(--s-border)] text-[13px] font-semibold text-[var(--s-text)] hover:bg-[var(--s-bg-input)] cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[var(--s-accent)]">
    <ImagePlus size={14} strokeWidth={1.75} />
    Open photo
    <input type="file" className="sr-only" onChange={onImageUpload} accept={imageAccept} aria-label="Open a photo" />
  </label>
);
