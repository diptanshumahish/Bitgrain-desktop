import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { syncHugSizes } from "@bitgrain/studio-core/layout/auto-layout";
import { svgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import { layersToNodes, type LayerExportContext } from "../nodes/layer-node";
import { serializeXml, xmlElement, type XmlNode } from "./xml-node";
import { watermarkNode } from "./svg-watermark";
import { layersInsideBounds } from "@bitgrain/studio-core/geometry/off-page-bounds";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n';
const DEFAULT_RASTER_SCALE = 2;
const DIGITS = 3;

interface SvgDocumentInput {
  layers: Layer[];
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  background: string | null;
  fallbackImage: string | null;
  watermark: boolean;
  idPrefix: string;
}

export interface SvgDocumentResult {
  svg: string;
  skipped: string[];
}

const num = (value: number): number => Number(value.toFixed(DIGITS));

const backgroundNodes = (input: SvgDocumentInput): XmlNode[] =>
  input.background && input.background !== "transparent"
    ? [svgNode("rect", { x: 0, y: 0, width: num(input.width), height: num(input.height), fill: input.background })]
    : [];

const placedContent = (input: SvgDocumentInput, nodes: XmlNode[]): XmlNode[] =>
  input.offsetX === 0 && input.offsetY === 0
    ? nodes
    : [xmlElement("g", { transform: `translate(${num(-input.offsetX)} ${num(-input.offsetY)})` }, nodes)];

export const buildSvgDocument = async (input: SvgDocumentInput): Promise<SvgDocumentResult> => {
  const ctx: LayerExportContext = {
    idPrefix: input.idPrefix,
    fallbackImage: input.fallbackImage,
    rasterScale: DEFAULT_RASTER_SCALE,
    skipped: [],
  };
  const exportBounds = { x: input.offsetX, y: input.offsetY, width: input.width, height: input.height };
  const nodes = await layersToNodes(syncHugSizes(layersInsideBounds(input.layers, exportBounds)), ctx);
  const watermark = input.watermark ? [await watermarkNode(input.width, input.height)] : [];
  const width = num(input.width);
  const height = num(input.height);
  const root = xmlElement(
    "svg",
    {
      xmlns: SVG_NAMESPACE, "xmlns:xlink": XLINK_NAMESPACE,
      width: num(input.width * input.scale), height: num(input.height * input.scale), viewBox: `0 0 ${width} ${height}`,
    },
    [...backgroundNodes(input), ...placedContent(input, nodes), ...watermark],
  );
  return { svg: `${XML_HEADER}${serializeXml(root)}`, skipped: ctx.skipped };
};
