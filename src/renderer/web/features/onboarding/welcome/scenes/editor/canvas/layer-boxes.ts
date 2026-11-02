import type { EditorSelection } from "../timeline/editor-frame-store";

interface LayerBox {
  target: string;
  label: string;
  boxClass: string;
  showFor: EditorSelection[];
}

export const LAYER_BOXES: LayerBox[] = [
  { target: "photo", label: "Photo", boxClass: "left-0 top-[26.67%] h-[26.67%] w-[33.33%]", showFor: ["photo"] },
  { target: "headline", label: "Headline", boxClass: "left-[5.9%] top-[57.8%] h-[19.3%] w-[87%]", showFor: ["headline"] },
];
