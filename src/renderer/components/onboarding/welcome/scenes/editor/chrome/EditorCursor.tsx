import React, { type RefObject } from "react";
import { MousePointer2 } from "lucide-react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { SWAPPED_PHOTO } from "../timeline/editor-photos";

interface EditorCursorProps {
  cursorRef: RefObject<HTMLSpanElement | null>;
}

export const EditorCursor: React.FC<EditorCursorProps> = ({ cursorRef }) => {
  const { dragging } = useSignalValue(editorFrameSignal);

  return (
    <span ref={cursorRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30 block opacity-0">
      <img
        src={SWAPPED_PHOTO}
        alt=""
        className={`absolute left-3 top-3 h-14 w-10 -rotate-6 rounded object-cover shadow-xl ring-2 ring-violet-500 transition-all duration-200 ${dragging ? "scale-100 opacity-90" : "scale-50 opacity-0"}`}
      />
      <MousePointer2 size={22} strokeWidth={1.5} className="relative fill-white text-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
    </span>
  );
};
