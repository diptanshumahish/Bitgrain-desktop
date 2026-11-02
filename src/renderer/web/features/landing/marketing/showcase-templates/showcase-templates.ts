export interface ShowcaseTemplate {
  slug: string;
  name: string;
  format: string;
  width: number;
  height: number;
  aspectClass: string;
}

const SHOWCASE_DIRECTORY = "/art/hero-templates";
const THUMB_WIDTH = 400;
const TALL = { format: "Poster, 2:3", width: THUMB_WIDTH, height: 600, aspectClass: "aspect-[2/3]" };
const PAPER = { format: "Poster, A3", width: THUMB_WIDTH, height: 566, aspectClass: "aspect-[400/566]" };
const PORTRAIT = { format: "Zine poster, 4:5", width: THUMB_WIDTH, height: 500, aspectClass: "aspect-[4/5]" };

export const showcaseTemplateSrc = (template: ShowcaseTemplate): string => `${SHOWCASE_DIRECTORY}/${template.slug}.webp`;

export const SHOWCASE_TEMPLATES: readonly ShowcaseTemplate[] = [
  { slug: "open-call-zine", name: "Open Call", ...PORTRAIT },
  { slug: "sazanami-koi-pond", name: "Sazanami", ...TALL },
  { slug: "grid-conference", name: "Grid 26", ...PAPER },
  { slug: "uttorer-dorja", name: "Uttorer Dorja", ...TALL, format: "Book cover, 2:3" },
  { slug: "night-swim-club", name: "Night Swim Club", ...PAPER },
  { slug: "still-water-retreat", name: "Still Water", ...TALL },
  { slug: "late-shift-halftone", name: "Late Shift", ...PORTRAIT },
  { slug: "city-half-marathon", name: "City Half Marathon", ...PAPER },
  { slug: "paper-faces", name: "Paper Faces", ...TALL },
  { slug: "setsugetsu-sake", name: "Setsugetsu", format: "Sake label", width: THUMB_WIDTH, height: 550, aspectClass: "aspect-[8/11]" },
  { slug: "harrow-finch-planner", name: "Harrow and Finch", ...PAPER, format: "Wall planner, A3" },
  { slug: "studio-hours-planner", name: "Studio Hours", ...PAPER, format: "Planner, A3" },
];

const SUPPORTING_TEMPLATES: readonly ShowcaseTemplate[] = [
  { slug: "krzyk-jazz-reissue", name: "Krzyk", format: "Album cover, 1:1", width: THUMB_WIDTH, height: THUMB_WIDTH, aspectClass: "aspect-square" },
  { slug: "slow-mornings-story", name: "Slow Mornings", format: "Story, 9:16", width: THUMB_WIDTH, height: 711, aspectClass: "aspect-[9/16]" },
];

export const showcaseTemplate = (slug: string): ShowcaseTemplate => {
  const template = [...SHOWCASE_TEMPLATES, ...SUPPORTING_TEMPLATES].find((candidate) => candidate.slug === slug);
  if (!template) throw new Error(`Unknown showcase template: ${slug}`);
  return template;
};
