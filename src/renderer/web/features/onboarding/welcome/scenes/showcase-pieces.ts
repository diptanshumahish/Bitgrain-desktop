import { prerender } from "../../../landing/prerendered-preview/prerender-cache";
import { isLowEndDevice } from "@bitgrain/core/device/device-capability";
import { HOME_SHOWCASE_ITEMS, type HomeShowcaseItem } from "../../../landing/home/showcase/home-showcase-items";
import { RED_DRESS_SPEC } from "../../../landing/home/showcase/showcase-specs";

interface ShowcasePiece {
  item: HomeShowcaseItem;
  visibilityClass: string;
  tiltClass: string;
}

const homeItem = (id: string): HomeShowcaseItem => {
  const item = HOME_SHOWCASE_ITEMS.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown showcase item: ${id}`);
  return item;
};

export const SHOWCASE_PIECES: ShowcasePiece[] = [
  { item: homeItem("sazanami-koi-pond"), visibilityClass: "block", tiltClass: "-rotate-2" },
  { item: homeItem("magazine"), visibilityClass: "hidden md:block", tiltClass: "rotate-1 md:mt-6" },
  { item: homeItem("open-call-zine"), visibilityClass: "hidden lg:block", tiltClass: "-rotate-1" },
];

export const warmShowcasePieces = (): void => {
  if (isLowEndDevice()) return;
  void prerender(RED_DRESS_SPEC);
};
