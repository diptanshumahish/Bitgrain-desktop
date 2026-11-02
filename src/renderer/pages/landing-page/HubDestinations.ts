import type { LucideIcon } from "lucide-react";
import { Clapperboard, ImageIcon, PenTool } from "lucide-react";

export interface HubDestination {
  key: string;
  title: string;
  body: string;
  to: string;
  icon: LucideIcon;
  mobileNote?: string;
}

export const HUB_DESTINATIONS: HubDestination[] = [
  {
    key: "studio",
    title: "Blank design",
    body: "Empty canvas or your saved projects",
    to: "/studio",
    icon: PenTool,
  },
  {
    key: "dithering",
    title: "Edit a photo",
    body: "Dither, halftone, ASCII, duotone",
    to: "/editor",
    icon: ImageIcon,
  },
  {
    key: "video",
    title: "Make a video",
    body: "Edit clips or animate photos, MP4 export",
    mobileNote: "Editing needs a larger screen",
    to: "/video",
    icon: Clapperboard,
  },
];
