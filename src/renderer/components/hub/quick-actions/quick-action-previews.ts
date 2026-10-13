import type React from "react";
import { DesignPreview } from "./DesignPreview";
import { PhotoPreview } from "./PhotoPreview";
import { VideoPreview } from "./VideoPreview";

export const QUICK_ACTION_PREVIEWS: Record<string, React.FC> = {
  studio: DesignPreview,
  dithering: PhotoPreview,
  video: VideoPreview,
};
