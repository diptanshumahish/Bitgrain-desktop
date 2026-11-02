import { parseDeclarations, selectorMatches, type CssRule, type Declarations } from "./css-rules";

export type ComputedStyle = Declarations;

const INHERITED_PROPERTIES = [
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap",
  "stroke-linejoin", "stroke-dasharray", "stroke-miterlimit", "font-family", "font-size", "font-weight",
  "font-style", "text-anchor", "letter-spacing", "color", "visibility", "text-decoration",
];

const OWN_PROPERTIES = ["opacity", "display", "stop-color", "stop-opacity", "clip-path", "mask", "filter"];

const STYLE_PROPERTIES = [...INHERITED_PROPERTIES, ...OWN_PROPERTIES];

export const ROOT_STYLE: ComputedStyle = { fill: "#000000", stroke: "none", "stroke-width": "1" };

const presentationAttributes = (element: Element): Declarations => {
  const result: Declarations = {};
  for (const name of STYLE_PROPERTIES) {
    const value = element.getAttribute(name);
    if (value !== null && value.trim() !== "") result[name] = value.trim();
  }
  return result;
};

const sheetDeclarations = (element: Element, rules: CssRule[]): Declarations =>
  rules
    .filter((rule) => selectorMatches(element, rule.selector))
    .reduce<Declarations>((acc, rule) => ({ ...acc, ...rule.declarations }), {});

const inheritedFrom = (parent: ComputedStyle): Declarations =>
  Object.fromEntries(INHERITED_PROPERTIES.filter((name) => parent[name] !== undefined).map((name) => [name, parent[name]]));

const dropInherit = (declarations: Declarations, parent: ComputedStyle): Declarations =>
  Object.fromEntries(
    Object.entries(declarations).map(([name, value]) => [name, value === "inherit" ? parent[name] ?? "" : value]),
  );

export const computeStyle = (element: Element, parent: ComputedStyle, rules: CssRule[]): ComputedStyle => {
  const own = {
    ...presentationAttributes(element),
    ...sheetDeclarations(element, rules),
    ...parseDeclarations(element.getAttribute("style") ?? ""),
  };
  return { ...inheritedFrom(parent), ...dropInherit(own, parent) };
};

export const isHidden = (style: ComputedStyle): boolean =>
  style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse";

export const numericStyle = (style: ComputedStyle, name: string, fallback: number): number => {
  const parsed = parseFloat(style[name] ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
};
