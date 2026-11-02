import React from "react";
import { ImagePlus } from "lucide-react";
import { MOBILE_IMAGE_ACCEPT } from "../accept-formats";

const ICON_SIZE = 20;

interface MobilePhotoPickerProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MobilePhotoPicker: React.FC<MobilePhotoPickerProps> = ({ onUpload }) => (
  <div className="md:hidden mt-7 w-full flex flex-col items-center gap-2.5">
    <label className="w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[16px] font-medium cursor-pointer transition-transform active:scale-[0.98] focus-within:ring-2 focus-within:ring-violet-500">
      <ImagePlus size={ICON_SIZE} strokeWidth={1.75} />
      choose a photo
      <input type="file" className="sr-only" aria-label="Choose a photo" onChange={onUpload} accept={MOBILE_IMAGE_ACCEPT} />
    </label>
    <span className="text-[12px] text-[var(--s-text-muted)]">from your library or straight from the camera</span>
  </div>
);
