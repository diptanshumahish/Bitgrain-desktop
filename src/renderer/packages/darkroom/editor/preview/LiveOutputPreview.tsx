import React from "react";
import { OutputPreview } from "../../preview/OutputPreview";
import { useToneProps } from "./use-tone-props";
import { useTextAndHalftoneProps } from "./use-effect-props";
import { useInkProps } from "./use-ink-props";
import { EDITOR_BG_COLOR, PREVIEW_FG_COLOR } from "./editor-colors";

const PREVIEW_PADDING_CLASS = "p-1 md:p-8";

const ignoreResult = (): void => undefined;

interface LiveOutputPreviewProps {
  image: string;
  compareMode: boolean;
  transparentBg: boolean;
}

export const LiveOutputPreview: React.FC<LiveOutputPreviewProps> = ({ image, compareMode, transparentBg }) => {
  const toneProps = useToneProps();
  const effectProps = useTextAndHalftoneProps();
  const inkProps = useInkProps();
  return (
    <OutputPreview
      image={image}
      compareMode={compareMode}
      transparentBg={transparentBg}
      fgColor={PREVIEW_FG_COLOR}
      bgColor={EDITOR_BG_COLOR}
      onResult={ignoreResult}
      paddingClass={PREVIEW_PADDING_CLASS}
      {...toneProps}
      {...effectProps}
      {...inkProps}
    />
  );
};
