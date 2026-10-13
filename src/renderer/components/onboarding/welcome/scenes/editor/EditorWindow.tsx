import React, { useRef } from "react";
import { useCursorTour, type TourStop } from "../../hooks/use-cursor-tour";
import { clickWelcomeCursor } from "../../sound/welcome-sound";
import { EditorTopBar } from "./chrome/EditorTopBar";
import { EditorStepsBar } from "./chrome/EditorStepsBar";
import { EditorCursor } from "./chrome/EditorCursor";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { PhotosPanel } from "./panels/PhotosPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { InspectorPanel } from "./panels/InspectorPanel";
import { EditorCanvas } from "./canvas/EditorCanvas";
import { useEditorTimeline } from "./timeline/use-editor-timeline";
import type { PosterName } from "./timeline/build-frame-template";
import {
  CLICK_EXPORT_MS,
  CLICK_HEADLINE_MS,
  CLICK_PALETTE_MS,
  CURSOR_ENTER_MS,
  CURSOR_TRAVEL_MS,
  DROP_PHOTO_MS,
  PICK_PHOTO_MS,
  PICK_TEMPLATE_MS,
} from "./timeline/editor-timeline";

const TOUR_STOPS: TourStop[] = [
  { selector: "[data-target='template']", clickAtMs: PICK_TEMPLATE_MS, onClick: clickWelcomeCursor },
  { selector: "[data-target='headline']", clickAtMs: CLICK_HEADLINE_MS, onClick: clickWelcomeCursor },
  { selector: "[data-target='photo-source']", clickAtMs: PICK_PHOTO_MS, onClick: clickWelcomeCursor },
  { selector: "[data-target='photo']", clickAtMs: DROP_PHOTO_MS, onClick: clickWelcomeCursor },
  { selector: "[data-target='palette']", clickAtMs: CLICK_PALETTE_MS, onClick: clickWelcomeCursor },
  { selector: "[data-target='export']", clickAtMs: CLICK_EXPORT_MS, onClick: clickWelcomeCursor },
];
const TOUR_TIMING = { enterAtMs: CURSOR_ENTER_MS, travelMs: CURSOR_TRAVEL_MS };

interface EditorWindowProps {
  name: PosterName;
}

export const EditorWindow: React.FC<EditorWindowProps> = ({ name }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEditorTimeline(name);
  useCursorTour(windowRef, cursorRef, TOUR_STOPS, TOUR_TIMING);

  return (
    <div ref={windowRef} className="relative flex h-[min(600px,62vh)] w-full flex-col overflow-hidden rounded-xl bg-[#141414] shadow-2xl shadow-black/70 ring-1 ring-white/10">
      <EditorTopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="no-scrollbar hidden w-44 shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-white/10 p-2.5 text-left md:flex">
          <TemplatesPanel />
          <PhotosPanel />
          <LayersPanel />
        </aside>
        <EditorCanvas name={name} />
        <InspectorPanel />
      </div>
      <EditorStepsBar />
      <EditorCursor cursorRef={cursorRef} />
    </div>
  );
};
