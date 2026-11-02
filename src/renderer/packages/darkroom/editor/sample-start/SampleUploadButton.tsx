import React from "react";
import { ImagePlus } from "lucide-react";
import { isMobileNow } from "@bitgrain/ui/hooks/use-is-mobile";
import { IMAGE_ACCEPT, MOBILE_IMAGE_ACCEPT } from "../accept-formats";
import { handleImageUploadFile } from "../upload/handle-image-upload";

const ICON_SIZE = 15;

const handlePick = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) void handleImageUploadFile(file, "picker");
};

export const SampleUploadButton: React.FC = () => (
  <label className="shrink-0 h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[13px] font-medium cursor-pointer transition-transform active:scale-[0.97] focus-within:ring-2 focus-within:ring-violet-500">
    <ImagePlus size={ICON_SIZE} strokeWidth={2} />
    Use my photo
    <input
      type="file"
      className="sr-only"
      aria-label="Use my own photo"
      onChange={handlePick}
      accept={isMobileNow() ? MOBILE_IMAGE_ACCEPT : IMAGE_ACCEPT}
    />
  </label>
);
