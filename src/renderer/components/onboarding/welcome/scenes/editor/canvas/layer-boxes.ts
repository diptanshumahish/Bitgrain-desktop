import type { EditorSelection } from "../timeline/editor-frame-store";

export interface LayerBox {
  target: string;
  label: string;
  boxClass: string;
  showFor: EditorSelection[];
}

export const LAYER_BOXES: LayerBox[] = [
  { target: "photo", label: "Portrait", boxClass: "left-0 top-0 h-[88.9%] w-full", showFor: ["photo"] },
  { target: "headline", label: "Headline", boxClass: "left-[4.5%] top-[57.6%] h-[31.9%] w-[72.6%]", showFor: ["headline"] },
];
