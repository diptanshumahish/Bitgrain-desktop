import type { Layer, TemplateDef } from "../../../../../../data/studioTypes";
import { toTemplateDef } from "../../../../../../lib/templates-api";
import { SCRIBBLE_LAYER } from "./scribble-layer";

export const POSTER_TEMPLATE_ID = "mara-quell-night-songs-tour-poster";
export const POSTER_THUMBNAIL = "https://api.bitgrain.app/api/thumbnails/74967909f67e0896a6e73ec5ae8a491af3211f508c424bfd2e0fd4fc364d0910";
export const POSTER_ORIGINAL_PHOTO = "https://api.bitgrain.app/api/assets/02123ebe4a3d8c5a4fbdcc7db38debf9d104612e16ae123adbb6187f4f246c12";

const POSTER_LAYERS = [
  {"x": 0, "y": 0, "id": "portrait", "fit": "cover", "src": "https://api.bitgrain.app/api/assets/02123ebe4a3d8c5a4fbdcc7db38debf9d104612e16ae123adbb6187f4f246c12", "name": "Portrait", "type": "image", "width": 1240, "height": 1560, "locked": false, "opacity": 1, "visible": true, "rotation": 0, "borderRadius": 0},
  {"x": 64, "y": 64, "id": "tour", "name": "Tour", "type": "text", "align": "left", "color": "#EFE9DF", "width": 520, "height": 28, "locked": false, "content": "Night Songs Tour, Winter 2027", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.2, "letterSpacing": 0, "textTransform": "none"},
  {"x": 656, "y": 64, "id": "presenter", "name": "Presenter", "type": "text", "align": "right", "color": "#EFE9DF", "width": 520, "height": 28, "locked": false, "content": "Lowlight Records presents", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.2, "letterSpacing": 0, "textTransform": "none"},
  {"x": 56, "y": 1010, "id": "headline", "name": "Headline", "type": "text", "align": "left", "color": "#EFE9DF", "width": 900, "height": 560, "locked": false, "content": "Mara\nQuell", "opacity": 1, "visible": true, "fontSize": 300, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Instrument Serif', serif", "fontWeight": "400", "lineHeight": 0.86, "letterSpacing": -8, "textTransform": "none"},
  {"x": 730, "y": 1162, "id": "subtitle", "name": "Subtitle", "type": "text", "align": "center", "color": "#E9A23B", "width": 440, "height": 84, "locked": false, "content": "Night Songs", "opacity": 1, "visible": true, "fontSize": 72, "rotation": 0, "fontStyle": "italic", "fontFamily": "'Instrument Serif', serif", "fontWeight": "400", "lineHeight": 1, "letterSpacing": 0, "textTransform": "none"},
  SCRIBBLE_LAYER,
  {"x": 64, "y": 1590, "id": "rule", "fill": "#EFE9DF", "name": "Rule", "type": "shape", "width": 1112, "height": 2, "locked": false, "stroke": "transparent", "opacity": 0.5, "visible": true, "rotation": 0, "shapeType": "rect", "strokeWidth": 0, "borderRadius": 0},
  {"x": 64, "y": 1616, "id": "date-1", "name": "Date 1", "type": "text", "align": "left", "color": "#EFE9DF", "width": 260, "height": 60, "locked": false, "content": "04 Feb\nOslo, Sentrum Scene", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.4, "letterSpacing": 0, "textTransform": "none"},
  {"x": 348, "y": 1616, "id": "date-2", "name": "Date 2", "type": "text", "align": "left", "color": "#EFE9DF", "width": 260, "height": 60, "locked": false, "content": "09 Feb\nBerlin, Lido", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.4, "letterSpacing": 0, "textTransform": "none"},
  {"x": 632, "y": 1616, "id": "date-3", "name": "Date 3", "type": "text", "align": "left", "color": "#EFE9DF", "width": 260, "height": 60, "locked": false, "content": "13 Feb\nParis, La Maroquinerie", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.4, "letterSpacing": 0, "textTransform": "none"},
  {"x": 916, "y": 1616, "id": "date-4", "name": "Date 4", "type": "text", "align": "left", "color": "#E9A23B", "width": 260, "height": 60, "locked": false, "content": "18 Feb\nLondon, Earth Hackney", "opacity": 1, "visible": true, "fontSize": 20, "rotation": 0, "fontStyle": "regular", "fontFamily": "'Hanken Grotesk', sans-serif", "fontWeight": "500", "lineHeight": 1.4, "letterSpacing": 0, "textTransform": "none"},
] as Layer[];

export const POSTER_TEMPLATE: TemplateDef = toTemplateDef({
  id: POSTER_TEMPLATE_ID,
  name: "Night Songs tour poster",
  category: "poster",
  data: { width: 1240, height: 1754, background: "#0D0D0D", exportScale: 2, layers: POSTER_LAYERS },
  thumbnail: POSTER_THUMBNAIL,
  isFree: false,
  featured: false,
  sortOrder: 0,
  createdAt: "",
});
