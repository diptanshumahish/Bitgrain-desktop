import type { Matrix } from "../geometry/matrix";
import type { ComputedStyle } from "../style/computed-style";
import { parseFraction, parseLength } from "../style/svg-length";
import { hrefOf, type WalkContext } from "./walk-context";
import { layerNameFor } from "./unsupported";
import type { IrImageNode } from "./svg-ir";

const SAFE_HREF = /^(data:image\/|https?:\/\/)/i;

const fitFor = (aspect: string | null): IrImageNode["fit"] => {
  const value = (aspect ?? "").trim();
  if (value.startsWith("none")) return "fill";
  return value.includes("slice") ? "cover" : "contain";
};

export const walkImage = (element: Element, style: ComputedStyle, ctm: Matrix, ctx: WalkContext): IrImageNode | null => {
  const href = hrefOf(element)?.trim() ?? "";
  const width = parseLength(element.getAttribute("width"), ctx.viewport.width, 0);
  const height = parseLength(element.getAttribute("height"), ctx.viewport.height, 0);
  if (!SAFE_HREF.test(href) || width <= 0 || height <= 0) {
    ctx.skipped.skip("image");
    return null;
  }
  return {
    kind: "image",
    name: layerNameFor(element, "Image"),
    href,
    x: parseLength(element.getAttribute("x"), ctx.viewport.width, 0),
    y: parseLength(element.getAttribute("y"), ctx.viewport.height, 0),
    width,
    height,
    matrix: ctm,
    fit: fitFor(element.getAttribute("preserveAspectRatio")),
    opacity: Math.max(0, Math.min(1, parseFraction(style.opacity, 1))),
  };
};
