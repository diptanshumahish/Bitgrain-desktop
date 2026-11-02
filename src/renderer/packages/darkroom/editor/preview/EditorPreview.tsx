import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { compareModeSignal, transparentBgSignal, exportedThisImageSignal } from "../../state/editor-view-store";
import { isSampleSignal } from "../../state/image-store";
import { OutputRatingButtons } from "../../rating/output-rating-buttons";
import { buildEditorRatingContext } from "../../rating/editor-rating-context";
import { PreviewLoader } from "../PreviewLoader";
import { ZoomStage } from "../zoom/ZoomStage";
import { ZoomControls } from "../zoom/ZoomControls";
import { LiveOutputPreview } from "./LiveOutputPreview";
import { LoopPreviewOverlay } from "../../loop/preview/LoopPreviewOverlay";
import { LoopPreviewBar } from "../../loop/preview/LoopPreviewBar";

const SAMPLE_PROMPT_SPACE_CLASS = "pb-28 md:pb-32";
const RATING_ABOVE_PROMPT_CLASS = "bottom-32";

interface EditorPreviewProps {
  image: string;
}

export const EditorPreview: React.FC<EditorPreviewProps> = ({ image }) => {
  const compareMode = useSignalValue(compareModeSignal);
  const transparentBg = useSignalValue(transparentBgSignal);
  const hasExported = useSignalValue(exportedThisImageSignal);
  const isSample = useSignalValue(isSampleSignal);

  return (
    <div className={`flex-1 w-full flex items-center justify-center p-3 ${isSample ? SAMPLE_PROMPT_SPACE_CLASS : ""} md:p-8 min-h-0 relative`}>
      <PreviewLoader />
      {hasExported && (
        <OutputRatingButtons
          surface="editor"
          getContext={buildEditorRatingContext}
          className={`absolute ${isSample ? RATING_ABOVE_PROMPT_CLASS : "bottom-3"} right-3 md:bottom-auto md:top-4 md:right-4 z-30 font-editorial bg-white/50 dark:bg-black/20 backdrop-blur-md pl-3 pr-1 py-1 rounded-full border border-black/5 dark:border-white/5`}
        />
      )}
      <ZoomStage resetKey={`${image}-${compareMode}`}>
        <LiveOutputPreview image={image} compareMode={compareMode} transparentBg={transparentBg} />
        <LoopPreviewOverlay />
      </ZoomStage>
      <LoopPreviewBar />
      <ZoomControls />
    </div>
  );
};
