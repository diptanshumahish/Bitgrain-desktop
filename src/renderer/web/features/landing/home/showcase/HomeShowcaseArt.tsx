import React from "react";
import type { HomeShowcaseItem } from "./home-showcase-items";
import { ShowcaseTemplateImage } from "../../marketing/showcase-templates/ShowcaseTemplateImage";

interface HomeShowcaseArtProps {
  item: HomeShowcaseItem;
}

export const HomeShowcaseArt: React.FC<HomeShowcaseArtProps> = ({ item }) => {
  if (item.kind === "design") return <item.Design />;
  return <ShowcaseTemplateImage template={item.template} alt={item.name} />;
};
