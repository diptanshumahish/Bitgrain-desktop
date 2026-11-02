import React from "react";
import { CanvasRulers } from "./CanvasRulers";
import { EditorArtboard } from "./EditorArtboard";
import { ExportToast } from "./ExportToast";
import type { PosterName } from "../timeline/build-frame-template";

interface EditorCanvasProps {
  name: PosterName;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ name }) => (
  <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#0d0d0d] bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:16px_16px] pl-5 pt-5">
    <CanvasRulers />
    <EditorArtboard name={name} />
    <ExportToast />
    <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white/50 ring-1 ring-white/10">62%</span>
  </div>
);
