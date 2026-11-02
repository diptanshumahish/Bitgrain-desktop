import React from "react";
import { WelcomeText } from "../../text/WelcomeText";
import { WELCOME_FRAME_CLASS, WELCOME_HEADING_CLASS, WELCOME_SUBLINE_CLASS } from "../../chrome/welcome-classes";
import { EditorWindow } from "./EditorWindow";
import { FloatingCards } from "./floating/FloatingCards";
import type { PosterName } from "./timeline/build-frame-template";

const SUBLINE_START_MS = 500;

const SUBLINE_COPY = "Pick a template, then make every word, photo and colour your own.";

interface EditorSceneProps {
  name: PosterName;
}

export const EditorScene: React.FC<EditorSceneProps> = ({ name }) => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      <h2 className={`text-3xl md:text-5xl ${WELCOME_HEADING_CLASS}`}>
        <WelcomeText text="Start from a template. Make it yours." startMs={0} ink={{ word: "yours.", mark: "circle" }} />
      </h2>
      <p className={WELCOME_SUBLINE_CLASS}>
        <WelcomeText text={SUBLINE_COPY} startMs={SUBLINE_START_MS} />
      </p>
      <div className={`relative mt-8 w-full md:mt-10 ${WELCOME_FRAME_CLASS}`}>
        <EditorWindow name={name} />
        <FloatingCards />
      </div>
    </div>
  );
};
