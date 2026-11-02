import type { Layer } from "../../model/studio-types";
import type { InstanceResizeMode } from "../../model/component-types";
import { scaleChildLayer, type ScaleFactors } from "../../layers/resize/scale-child-layer";
import { constrainBox, resolveConstraints, type ConstrainedBox } from "../../layout/engine/constraints";
import { hasAutoLayout, type Size } from "../../layout/engine/layout-container";
import type { ComponentContainer } from "../tree/layer-walk";

const factorsBetween = (from: Size, to: Size): ScaleFactors => {
  const x = to.width / from.width;
  const y = to.height / from.height;
  return { x, y, uniform: Math.min(x, y) };
};

const shouldScale = (main: ComponentContainer, mode: InstanceResizeMode): boolean => {
  if (mode === "scale") return true;
  if (main.type === "frame") return Boolean(main.scaleContents);
  return !hasAutoLayout(main);
};

const isFlowChild = (main: ComponentContainer, child: Layer): boolean => hasAutoLayout(main) && !child.layoutAbsolute;

const resizeToBox = (child: Layer, box: ConstrainedBox): Layer => {
  if (child.type === "frame") {
    return { ...child, ...box, layers: fitChildrenToSize(child, box, "auto") };
  }
  if (child.type === "group" && !child.pattern) {
    const scaled = scaleChildLayer({ ...child, x: 0, y: 0 }, factorsBetween(child, box));
    return { ...scaled, x: box.x, y: box.y };
  }
  return { ...child, ...box };
};

const constrainChild = (child: Layer, from: Size, to: Size): Layer => {
  const box = constrainBox(child, resolveConstraints(child), from, to);
  if (box.width === child.width && box.height === child.height) return { ...child, x: box.x, y: box.y };
  return resizeToBox(child, box);
};

export const fitChildrenToSize = (main: ComponentContainer, to: Size, mode: InstanceResizeMode): Layer[] => {
  if (main.width === to.width && main.height === to.height) return main.layers;
  if (main.width <= 0 || main.height <= 0) return main.layers;
  if (shouldScale(main, mode)) {
    const factors = factorsBetween(main, to);
    return main.layers.map((child) => scaleChildLayer(child, factors));
  }
  return main.layers.map((child) => (isFlowChild(main, child) ? child : constrainChild(child, main, to)));
};
