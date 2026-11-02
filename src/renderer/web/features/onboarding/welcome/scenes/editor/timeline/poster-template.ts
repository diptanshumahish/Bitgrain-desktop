import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { toTemplateDef } from "@bitgrain/platform/templates/templates-api";
import { MARKETING_IMAGES } from "../../../../../landing/marketing/marketing-images";
import { ARCH, QUARTER_BOTTOM, QUARTER_TOP, SEMICIRCLE, SWIPE_MARK } from "./bauhaus-shapes";

const POSTER_TEMPLATE_ID = "open-studio-week-bauhaus-carousel";
export const POSTER_PHOTO = MARKETING_IMAGES.redSun.small;
export const ORIGINAL_HEADLINE = "Open Studio\nWeek";

const SHAPE_BASE = { "locked": false, "stroke": "transparent", "opacity": 1, "visible": true, "rotation": 0, "strokeWidth": 0, "borderRadius": 0 };
const TEXT_BASE = { "locked": false, "opacity": 1, "visible": true, "rotation": 0, "fontStyle": "regular", "align": "left", "textTransform": "none" };

const rect = (id: string, name: string, box: number[], fill: string, shapeType = "rect"): Layer => {
  const [x, y, width, height] = box;
  return { ...SHAPE_BASE, id, name, type: "shape", shapeType, x, y, width, height, fill } as Layer;
};

const POSTER_LAYERS = [
  rect("background", "Background", [0, 0, 1080, 1350], "#EFE8DA"),
  rect("tile-1", "Tile", [0, 0, 360, 360], "#D93A2B"),
  QUARTER_TOP,
  rect("tile-2", "Tile", [360, 0, 360, 360], "#171717"),
  rect("circle", "Circle", [410.4, 50.4, 259.2, 259.2], "#EFE8DA", "circle"),
  rect("circle-core", "Circle core", [489.6, 129.6, 100.8, 100.8], "#D93A2B", "circle"),
  rect("tile-3", "Tile", [720, 0, 360, 360], "#EAB43E"),
  SEMICIRCLE,
  rect("tile-4", "Tile", [0, 360, 360, 360], "#EFE8DA"),
  rect("bar-1", "Bar", [50.4, 403.2, 61.2, 273.6], "#171717"),
  rect("bar-2", "Bar", [147.6, 403.2, 61.2, 273.6], "#171717"),
  rect("bar-3", "Bar", [244.8, 403.2, 61.2, 273.6], "#171717"),
  {"x": 0, "y": 360, "id": "photo", "fit": "cover", "src": POSTER_PHOTO, "name": "Photo", "type": "image", "width": 360, "height": 360, "locked": false, "opacity": 1, "visible": false, "rotation": 0, "borderRadius": 0},
  rect("tile-5", "Tile", [360, 360, 360, 360], "#D93A2B"),
  ARCH,
  rect("tile-6", "Tile", [720, 360, 360, 360], "#171717"),
  QUARTER_BOTTOM,
  {...TEXT_BASE, "x": 64, "y": 780, "id": "headline", "name": "Headline", "type": "text", "color": "#171717", "width": 940, "height": 260, "content": ORIGINAL_HEADLINE, "fontSize": 132, "fontFamily": "'League Spartan', sans-serif", "fontWeight": "700", "lineHeight": 0.95, "letterSpacing": -3},
  {...TEXT_BASE, "x": 64, "y": 1060, "id": "details", "name": "Details", "type": "text", "color": "#171717", "width": 700, "height": 90, "content": "Open studio week, new work\n12 to 18 June, free entry", "fontSize": 32, "fontFamily": "'Host Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.3, "letterSpacing": 0},
  {...TEXT_BASE, "x": 64, "y": 1240, "id": "swipe", "name": "Swipe", "type": "text", "color": "#171717", "width": 500, "height": 32, "content": "Swipe for the programme", "fontSize": 24, "fontFamily": "'Host Grotesk', sans-serif", "fontWeight": "400", "lineHeight": 1.3, "letterSpacing": 0},
  SWIPE_MARK,
] as Layer[];

export const POSTER_TEMPLATE: TemplateDef = toTemplateDef({
  id: POSTER_TEMPLATE_ID,
  name: "Open Studio Week",
  category: "social",
  data: { width: 1080, height: 1350, background: "#EFE8DA", exportScale: 2, layers: POSTER_LAYERS },
  thumbnail: "",
  isFree: false,
  featured: false,
  sortOrder: 0,
  createdAt: "",
});
