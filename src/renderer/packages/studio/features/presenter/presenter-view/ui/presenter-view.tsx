import React from "react";
import { usePresenterLink } from "../link/use-presenter-link";
import { usePresenterKeys } from "../link/use-presenter-keys";
import { PresenterHeader } from "./presenter-header";
import { PresenterSlide } from "./presenter-slide";
import { PresenterNotes } from "./presenter-notes";

interface PresenterViewProps {
  sessionId: string;
  hostWindow: Window;
}

export const PresenterView: React.FC<PresenterViewProps> = ({ sessionId, hostWindow }) => {
  const { state, step } = usePresenterLink(sessionId);
  usePresenterKeys(hostWindow, step);

  if (state.status === "ended") {
    return (
      <div className="h-screen flex items-center justify-center text-[15px] text-white/60">
        The presentation has ended. You can close this window.
      </div>
    );
  }

  const { index, slides, images } = state;
  const nextIndex = index + 1;

  return (
    <div className="h-screen flex flex-col select-none">
      <PresenterHeader index={index} count={slides.length} startedAt={state.startedAt} onStep={step} />
      <main className="flex-1 min-h-0 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 p-6">
        <PresenterSlide label="Now" src={images[index]} hasSlide={slides.length > 0} emptyText="Connecting to your presentation…" />
        <div className="grid grid-rows-[minmax(0,2fr)_minmax(0,3fr)] gap-6 min-h-0">
          <PresenterSlide label="Next" src={images[nextIndex]} hasSlide={nextIndex < slides.length} emptyText="That was the last slide" />
          <PresenterNotes notes={slides[index]?.notes ?? ""} />
        </div>
      </main>
    </div>
  );
};
