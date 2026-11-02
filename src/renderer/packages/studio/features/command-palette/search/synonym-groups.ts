import { splitWords, stemWord } from "./word-stem";

const SYNONYM_GROUPS: string[][] = [
  ["photo", "picture", "image", "pic", "img", "photograph", "shot", "snapshot"],
  ["text", "words", "type", "typing", "writing", "caption", "title", "heading", "headline", "label"],
  ["font", "typeface", "typography", "lettering"],
  ["add", "insert", "new", "create", "place", "put", "drop"],
  ["delete", "remove", "erase", "trash", "clear", "discard"],
  ["copy", "duplicate", "clone", "repeat"],
  ["undo", "revert", "back", "oops", "mistake"],
  ["size", "resize", "dimensions", "format", "scale", "bigger", "smaller", "aspect", "ratio"],
  ["export", "download", "save", "share", "output", "render"],
  ["shape", "rectangle", "box", "square", "block", "rect"],
  ["circle", "round", "ellipse", "oval", "dot"],
  ["line", "divider", "rule", "stroke", "separator"],
  ["draw", "sketch", "paint", "freehand", "doodle", "scribble"],
  ["zoom", "magnify", "enlarge view", "closer"],
  ["move", "pan", "scroll", "drag"],
  ["group", "combine", "merge", "join", "bundle"],
  ["template", "layout", "starter", "preset design", "example"],
  ["effect", "filter", "look", "style", "fx", "treatment"],
  ["print", "printed", "newspaper", "magazine", "press", "ink"],
  ["retro", "vintage", "old", "aged", "worn", "nostalgic"],
  ["help", "guide", "tutorial", "learn", "docs", "documentation", "how"],
  ["page", "slide", "artboard", "sheet"],
  ["color", "colour", "tint", "hue", "palette"],
  ["sticker", "icon", "graphic", "element", "clipart", "illustration"],
  ["dark", "night", "theme", "light mode", "appearance"],
  ["grain", "noise", "texture", "film"],
];

const toStems = (group: string[]): string[] => [...new Set(group.flatMap(splitWords).map(stemWord))];

const SYNONYM_INDEX: ReadonlyMap<string, readonly string[]> = SYNONYM_GROUPS.map(toStems).reduce((index, stems) => {
  stems.forEach((stem) => index.set(stem, [...new Set([...(index.get(stem) ?? []), ...stems])].filter((other) => other !== stem)));
  return index;
}, new Map<string, string[]>());

export const synonymsOf = (stem: string): readonly string[] => SYNONYM_INDEX.get(stem) ?? [];
