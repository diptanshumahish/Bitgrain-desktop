import React from "react";
import { useSignalValue } from "../../../../../lib/signal";
import { templatesTotalSignal } from "../../../../../store/templates-store";
import { WelcomeText } from "../../WelcomeText";
import { EditorWindow } from "./EditorWindow";
import { FloatingCards } from "./floating/FloatingCards";
import type { PosterName } from "./timeline/build-frame-template";

const SUBLINE_START_MS = 500;

const sublineCopy = (total: number): string =>
  total > 0
    ? `Pick one of ${total} templates, then make every word, photo and colour your own.`
    : "Pick a template, then make every word, photo and colour your own.";

interface EditorSceneProps {
  name: PosterName;
}

export const EditorScene: React.FC<EditorSceneProps> = ({ name }) => {
  const total = useSignalValue(templatesTotalSignal);

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      <h2 className="text-balance text-3xl font-medium tracking-tight md:text-5xl">
        <WelcomeText text="Start from a template. Make it yours." startMs={0} />
      </h2>
      <p className="mt-3 text-balance text-base text-white/55 md:text-lg">
        <WelcomeText text={sublineCopy(total)} startMs={SUBLINE_START_MS} />
      </p>
      <div className="relative mt-8 w-full md:mt-10">
        <EditorWindow name={name} />
        <FloatingCards />
      </div>
    </div>
  );
};
