export interface MarketingImage {
  src: string;
  width: number;
  small: string;
  smallWidth: number;
}

const LANDSCAPE_WIDTH = 1672;
const LANDSCAPE_SMALL_WIDTH = 900;
const PORTRAIT_WIDTH = 1024;
const PORTRAIT_SMALL_WIDTH = 600;
const TILE_WIDTH = 1200;
const TILE_SMALL_WIDTH = 700;

const buildImage = (name: string, width: number, smallWidth: number): MarketingImage => ({
  src: `/art/${name}.webp`,
  width,
  small: `/art/${name}-sm.webp`,
  smallWidth,
});

const landscape = (name: string): MarketingImage =>
  buildImage(name, LANDSCAPE_WIDTH, LANDSCAPE_SMALL_WIDTH);

const portrait = (name: string): MarketingImage =>
  buildImage(name, PORTRAIT_WIDTH, PORTRAIT_SMALL_WIDTH);

const tile = (name: string): MarketingImage => buildImage(name, TILE_WIDTH, TILE_SMALL_WIDTH);

export const SHOWCASE_IMAGES = {
  kites: tile("kites"),
  city: tile("city"),
  window: tile("window"),
  dusk: tile("dusk"),
  train: tile("train"),
  redRoom: tile("red-room"),
} satisfies Record<string, MarketingImage>;

export const MARKETING_IMAGES = {
  reach: landscape("reach"),
  reachCosmos: landscape("reach-cosmos"),
  desk: landscape("desk"),
  redSun: landscape("red-sun"),
  cat: landscape("cat"),
  wind: landscape("wind"),
  nightHill: landscape("night-hill"),
  cityWide: landscape("city-wide"),
  kitesWide: landscape("kites-wide"),
  duskWide: landscape("dusk-wide"),
  card: portrait("card"),
} satisfies Record<string, MarketingImage>;

export const EFFECTS_SOURCE_IMAGE = "/art/effects-source.webp";

export const ENGINE_SOURCES = {
  hillTree: "/art/src-hill-tree.webp",
  redDress: "/art/src-red-dress.webp",
  valley: "/art/src-valley.webp",
  cosmos: "/art/src-cosmos.webp",
  hotel: "/art/src-hotel.webp",
  engraving: "/art/src-engraving.webp",
  desk: "/art/src-desk.webp",
};
