import { svgNodeToString, type SvgAttrs } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";

interface XmlText {
  text: string;
}

export interface XmlElement {
  tag: string;
  attrs: SvgAttrs;
  children?: XmlNode[];
}

export type XmlNode = XmlElement | XmlText;

const SELF_CLOSE = "/>";

const escapeText = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const isText = (node: XmlNode): node is XmlText => "text" in node;

export const textElement = (text: string, attrs: SvgAttrs): XmlElement => ({ tag: "text", attrs, children: [{ text }] });

export const xmlElement = (tag: string, attrs: SvgAttrs, children: XmlNode[]): XmlElement => ({ tag, attrs, children });

const openTag = (node: XmlElement): string => `${svgNodeToString({ tag: node.tag, attrs: node.attrs }).slice(0, -SELF_CLOSE.length)}>`;

export const serializeXml = (node: XmlNode): string => {
  if (isText(node)) return escapeText(node.text);
  if (!node.children || node.children.length === 0) return svgNodeToString({ tag: node.tag, attrs: node.attrs });
  return `${openTag(node)}${node.children.map(serializeXml).join("")}</${node.tag}>`;
};
