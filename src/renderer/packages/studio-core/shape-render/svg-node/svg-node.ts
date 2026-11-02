type SvgAttrValue = string | number | undefined;

export type SvgAttrs = Record<string, SvgAttrValue>;

export interface SvgNode {
  tag: string;
  attrs: SvgAttrs;
  children?: SvgNode[];
}

const KEBAB_ATTRS: ReadonlySet<string> = new Set([
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "strokeMiterlimit",
  "strokeOpacity",
  "fillOpacity",
  "fillRule",
  "clipRule",
  "clipPath",
  "stopColor",
  "stopOpacity",
  "shapeRendering",
  "floodColor",
  "floodOpacity",
  "colorInterpolationFilters",
]);

const toAttrName = (name: string): string =>
  KEBAB_ATTRS.has(name) ? name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) : name;

const escapeAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const attrsToString = (attrs: SvgAttrs): string =>
  Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ` ${toAttrName(name)}="${escapeAttr(String(value))}"`)
    .join("");

export const svgNodeToString = (node: SvgNode): string => {
  const attrs = attrsToString(node.attrs);
  if (!node.children || node.children.length === 0) return `<${node.tag}${attrs}/>`;
  return `<${node.tag}${attrs}>${svgNodesToString(node.children)}</${node.tag}>`;
};

export const svgNodesToString = (nodes: SvgNode[]): string => nodes.map(svgNodeToString).join("");

export const svgNode = (tag: string, attrs: SvgAttrs, children?: SvgNode[]): SvgNode =>
  children ? { tag, attrs, children } : { tag, attrs };

export const compactAttrs = (attrs: SvgAttrs): SvgAttrs =>
  Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== undefined));
