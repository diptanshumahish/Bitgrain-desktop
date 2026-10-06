import type { TemplateDef } from "../studioTypes";

// Curated blank-canvas starting points for the studio, shown on the home page.
// They are deterministic and offline-safe (no network, no remote thumbnails):
// each opens a new studio already sized for a common use, which is faster and
// clearer than starting from a single generic blank canvas and resizing. The
// preview is drawn from the aspect ratio in the UI, so no image asset is needed.
export interface StudioStarter {
  id: string;
  name: string;
  detail: string;
  width: number;
  height: number;
  category: TemplateDef["category"];
  background: string;
}

export const STUDIO_STARTERS: StudioStarter[] = [
  { id: "starter-square", name: "Social post", detail: "1080 × 1080", width: 1080, height: 1080, category: "social", background: "#ffffff" },
  { id: "starter-story", name: "Story / Reel", detail: "1080 × 1920", width: 1080, height: 1920, category: "social", background: "#ffffff" },
  { id: "starter-landscape", name: "Wallpaper", detail: "1920 × 1080", width: 1920, height: 1080, category: "wallpaper", background: "#0b0b0f" },
  { id: "starter-portrait", name: "Portrait post", detail: "1080 × 1350", width: 1080, height: 1350, category: "social", background: "#ffffff" },
  { id: "starter-poster", name: "Poster (A4)", detail: "1240 × 1754", width: 1240, height: 1754, category: "poster", background: "#ffffff" },
  { id: "starter-card", name: "Card", detail: "1050 × 600", width: 1050, height: 600, category: "frame", background: "#ffffff" },
];

// Builds the TemplateDef the studio seeds itself from. Empty layers: the studio
// opens on a blank canvas of the chosen size, ready to design.
export function starterToTemplate(starter: StudioStarter): TemplateDef {
  return {
    id: starter.id,
    name: starter.name,
    category: starter.category,
    width: starter.width,
    height: starter.height,
    background: starter.background,
    exportScale: 2,
    free: true,
    layers: [],
  };
}
