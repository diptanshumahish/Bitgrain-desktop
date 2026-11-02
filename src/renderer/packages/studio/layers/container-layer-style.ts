import type React from "react";
import type { FrameLayer, GroupLayer } from "@bitgrain/studio-core/model/studio-types";

interface ContainerStyleState {
  zIndex: number;
  scale: number;
  isGrabMode: boolean;
  isSelected: boolean;
  showChrome: boolean;
  opacity: number | undefined;
}

export const containerLayerStyle = (layer: GroupLayer | FrameLayer, state: ContainerStyleState): React.CSSProperties => ({
  position: "absolute",
  left: layer.x,
  top: layer.y,
  width: layer.width,
  height: layer.height,
  zIndex: state.zIndex,
  opacity: state.opacity,
  display: "block",
  pointerEvents: "auto",
  cursor: state.isGrabMode ? "grab" : state.isSelected ? "move" : "default",
  outline: state.showChrome ? `${2 / state.scale}px solid var(--s-handle)` : "none",
  outlineOffset: 2 / state.scale,
  mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
  transform: `rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
  transformOrigin: "center center",
});
