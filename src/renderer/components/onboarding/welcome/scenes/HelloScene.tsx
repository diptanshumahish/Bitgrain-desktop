import React from "react";
import { WelcomeText } from "../WelcomeText";
import { LINE_GAP_MS } from "../welcome-timing";

const HEADLINE_START_MS = 450;

interface HelloSceneProps {
  firstName: string;
}

export const HelloScene: React.FC<HelloSceneProps> = ({ firstName }) => (
  <div className="mx-auto max-w-4xl text-center">
    <h1 className="text-5xl font-medium leading-[1.05] tracking-tight md:text-8xl">
      <WelcomeText text={`Hi ${firstName}.`} startMs={HEADLINE_START_MS} />
    </h1>
    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-white/60 md:text-2xl">
      <WelcomeText
        text="Welcome to Bitgrain, a little studio for work that feels printed, not prompted."
        startMs={HEADLINE_START_MS + LINE_GAP_MS}
      />
    </p>
  </div>
);
