import React from "react";
import { OutputPreview } from "../../../components/OutputPreview";
import { useSignalValue } from "../../../lib/signal";
import { compareModeSignal, transparentBgSignal, exportedThisImageSignal } from "../../../store/editor-view-store";
import { OutputRatingButtons } from "../../../modules/output-rating/output-rating-buttons";
import { buildEditorRatingContext } from "../../../modules/output-rating/editor-rating-context";
import { AppliedLooksBar } from "../../../components/toolbar/applied/AppliedLooksBar";
import { PreviewLoader } from "../PreviewLoader";
import { ZoomStage } from "../zoom/ZoomStage";
import { ZoomControls } from "../zoom/ZoomControls";
import { useToneProps } from "./use-tone-props";
import { useTextAndHalftoneProps } from "./use-effect-props";
import { useInkProps } from "./use-ink-props";
import { EDITOR_BG_COLOR, PREVIEW_FG_COLOR } from "./editor-colors";

const ignoreResult = (): void => undefined;

interface EditorPreviewProps {
  image: string;
}

export const EditorPreview: React.FC<EditorPreviewProps> = ({ image }) => {
  const compareMode = useSignalValue(compareModeSignal);
  const transparentBg = useSignalValue(transparentBgSignal);
  const hasExported = useSignalValue(exportedThisImageSignal);
  const toneProps = useToneProps();
  const effectProps = useTextAndHalftoneProps();
  const inkProps = useInkProps();

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 pb-36 md:p-8 md:pb-28 min-h-0 relative">
      <PreviewLoader />
      <AppliedLooksBar />
      {hasExported && (
        <OutputRatingButtons
          surface="editor"
          getContext={buildEditorRatingContext}
          className="absolute top-14 right-3 md:top-20 md:right-5 z-30 font-editorial bg-white/50 dark:bg-black/20 backdrop-blur-md pl-3 pr-1 py-1 rounded-full border border-black/5 dark:border-white/5"
        />
      )}
      <ZoomStage resetKey={`${image}-${compareMode}`}>
        <OutputPreview
          image={image}
          compareMode={compareMode}
          transparentBg={transparentBg}
          fgColor={PREVIEW_FG_COLOR}
          bgColor={EDITOR_BG_COLOR}
          onResult={ignoreResult}
          {...toneProps}
          {...effectProps}
          {...inkProps}
        />
      </ZoomStage>
      <ZoomControls />
    </div>
  );
};
