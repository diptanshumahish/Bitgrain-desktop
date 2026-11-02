import type { CSSProperties } from "react";
import type { TextLayer } from "../../../model/studio-types";
import { LIST_GUTTER_EM } from "./list-markers";

export const PARAGRAPH_CLASS = "text-paragraphs";

export const paragraphVars = (layer: Pick<TextLayer, "paragraphSpacing" | "paragraphIndent">, multiplier: number): CSSProperties =>
  ({
    "--para-gap": `${(layer.paragraphSpacing ?? 0) * multiplier}px`,
    "--para-indent": `${(layer.paragraphIndent ?? 0) * multiplier}px`,
    "--list-gutter": `${LIST_GUTTER_EM}em`,
  }) as CSSProperties;
