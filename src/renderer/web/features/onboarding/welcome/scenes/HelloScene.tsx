import React from "react";
import { WelcomeText } from "../text/WelcomeText";
import { LINE_GAP_MS } from "../welcome-timing";
import { WELCOME_HEADING_CLASS } from "../chrome/welcome-classes";

const HEADLINE_START_MS = 450;

interface HelloSceneProps {
  firstName: string;
}

export const HelloScene: React.FC<HelloSceneProps> = ({ firstName }) => (
  <div className="mx-auto max-w-4xl text-center">
    <h1 className={`text-5xl md:text-8xl ${WELCOME_HEADING_CLASS}`}>
      <WelcomeText text={`Hi ${firstName}.`} startMs={HEADLINE_START_MS} ink={{ word: `${firstName}.`, mark: "circle" }} />
    </h1>
    <p className="mx-auto mt-10 max-w-2xl text-balance text-lg leading-[1.5] text-white/85 md:text-2xl">
      <WelcomeText
        text="Welcome to Bitgrain, a little studio for work that feels printed, not prompted."
        startMs={HEADLINE_START_MS + LINE_GAP_MS}
        ink={{ word: "printed,", mark: "underline" }}
      />
    </p>
  </div>
);
