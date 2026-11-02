import type React from "react";
import { MagazineCover } from "./MagazineCover";
import { showcaseTemplate, type ShowcaseTemplate } from "../../marketing/showcase-templates/showcase-templates";

interface ShowcaseCopy {
  id: string;
  name: string;
  format: string;
}

interface DesignShowcaseItem extends ShowcaseCopy {
  kind: "design";
  aspectClass: string;
  Design: React.FC;
}

interface TemplateShowcaseItem extends ShowcaseCopy {
  kind: "template";
  template: ShowcaseTemplate;
}

export type HomeShowcaseItem = DesignShowcaseItem | TemplateShowcaseItem;

const templateItem = (slug: string, name: string, format: string): TemplateShowcaseItem => ({
  kind: "template",
  id: slug,
  name,
  format,
  template: showcaseTemplate(slug),
});

export const showcaseAspectClass = (item: HomeShowcaseItem): string =>
  item.kind === "design" ? item.aspectClass : item.template.aspectClass;

export const HOME_SHOWCASE_ITEMS: HomeShowcaseItem[] = [
  templateItem("sazanami-koi-pond", "Koi pond poster", "2:3 poster, flat screen print colours"),
  templateItem("open-call-zine", "Zine open call", "Instagram post, two ink colours"),
  templateItem("uttorer-dorja", "Bengali novel cover", "Paperback, 2:3, Bengali type"),
  {
    kind: "design",
    id: "magazine",
    name: "Magazine cover",
    format: "230 × 300 mm, CMYK halftone",
    aspectClass: "aspect-[3/4]",
    Design: MagazineCover,
  },
  templateItem("late-shift-halftone", "Late shift zine", "Zine poster, halftone duotone"),
  templateItem("night-swim-club", "Night swim poster", "A3 poster, photo grid"),
  templateItem("setsugetsu-sake", "Sake label", "Bottle label, 800 × 1100"),
  templateItem("paper-faces", "Block print exhibition", "2:3 poster, woodblock shapes"),
  templateItem("grid-conference", "Design conference poster", "A3 poster, Swiss grid"),
];
