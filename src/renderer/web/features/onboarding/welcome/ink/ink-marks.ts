import type React from "react";
import { InkUnderline } from "./InkUnderline";
import { InkCircle } from "./InkCircle";

export type InkMarkKind = "underline" | "circle";

export interface InkMarkProps {
  startMs: number;
  children: React.ReactNode;
}

export const INK_MARKS: Record<InkMarkKind, React.FC<InkMarkProps>> = {
  underline: InkUnderline,
  circle: InkCircle,
};
