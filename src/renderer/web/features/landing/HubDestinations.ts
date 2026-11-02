import type { LucideIcon } from "lucide-react";
import { Clapperboard, ImageIcon, PenTool, Shirt } from "lucide-react";
import { APPAREL_SITE_URL } from "../../app/routes/apparel-site";

export interface HubDestination {
  key: string;
  title: string;
  body: string;
  to: string;
  icon: LucideIcon;
  mobileNote?: string;
  beta?: boolean;
}

export const HUB_DESTINATIONS: HubDestination[] = [
  {
    key: "studio",
    title: "Make a design",
    body: "Empty canvas or your saved projects",
    to: "/studio",
    icon: PenTool,
  },
  {
    key: "dithering",
    title: "Add photo effects",
    body: "Dither, halftone, ASCII, duotone",
    to: "/editor",
    icon: ImageIcon,
  },
  {
    key: "video",
    title: "Make a video",
    body: "Edit clips or animate photos, MP4 export",
    mobileNote: "Opens on a laptop or desktop",
    to: "/video",
    icon: Clapperboard,
  },
  {
    key: "apparel",
    title: "Print on clothes",
    body: "Tees, dresses, bed sheets and more",
    to: APPAREL_SITE_URL,
    icon: Shirt,
    beta: true,
  },
];
