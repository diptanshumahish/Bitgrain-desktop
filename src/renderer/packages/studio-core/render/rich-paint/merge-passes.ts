import type { PaintPass, SvgPaintPass } from "../../shape-render/rich/rich-types";

const isPlainSvg = (pass: PaintPass | undefined): pass is SvgPaintPass => pass?.kind === "svg" && !pass.blendMode;

export const mergePlainPasses = (passes: PaintPass[]): PaintPass[] =>
  passes.reduce<PaintPass[]>((merged, pass) => {
    const last = merged[merged.length - 1];
    if (isPlainSvg(last) && isPlainSvg(pass)) {
      return [...merged.slice(0, -1), { kind: "svg", nodes: [...last.nodes, ...pass.nodes] }];
    }
    return [...merged, pass];
  }, []);
