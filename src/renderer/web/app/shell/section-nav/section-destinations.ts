import { Aperture, LayoutTemplate, Clapperboard, House, type LucideIcon } from "lucide-react";

export interface SectionDestination {
  key: string;
  title: string;
  caption: string;
  to: string;
  icon: LucideIcon;
}

export const HUB_DESTINATION: SectionDestination = {
  key: "hub",
  title: "hub",
  caption: "all your tools",
  to: "/hello",
  icon: House,
};

export const SECTION_DESTINATIONS: SectionDestination[] = [
  {
    key: "darkroom",
    title: "photo effects",
    caption: "image tool",
    to: "/editor",
    icon: Aperture,
  },
  {
    key: "studio",
    title: "studio",
    caption: "design canvas",
    to: "/studio",
    icon: LayoutTemplate,
  },
  {
    key: "video",
    title: "video",
    caption: "motion editor",
    to: "/video",
    icon: Clapperboard,
  },
];

export function isSectionActive(destination: SectionDestination, pathname: string): boolean {
  return pathname === destination.to || pathname.startsWith(`${destination.to}/`);
}
