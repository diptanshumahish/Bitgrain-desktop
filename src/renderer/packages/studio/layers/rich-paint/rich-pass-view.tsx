import React from "react";
import type { PaintBox, PaintPass } from "@bitgrain/studio-core/shape-render/rich/rich-types";
import { imagePassNodes } from "@bitgrain/studio-core/shape-render/rich/image-pass-nodes";
import { SvgNodes } from "@bitgrain/studio-core/shape-render/svg-node/svg-node-react";
import { resolveAssetUrl } from "@bitgrain/api/api-client";

interface RichPassViewProps {
  pass: PaintPass;
  box: PaintBox;
}

const passNodes = (pass: PaintPass, box: PaintBox): React.ReactElement => {
  if (pass.kind === "svg") return <SvgNodes nodes={pass.nodes} />;
  const built = imagePassNodes(pass, box, resolveAssetUrl(pass.image.src) ?? pass.image.src);
  return <SvgNodes nodes={[built.pattern, built.node]} />;
};

export const RichPassView: React.FC<RichPassViewProps> = ({ pass, box }) => (
  <g style={pass.blendMode ? { mixBlendMode: pass.blendMode } : undefined}>{passNodes(pass, box)}</g>
);
