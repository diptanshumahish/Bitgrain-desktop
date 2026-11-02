import React, { useRef } from "react";
import { useSignalValue } from "../../../../../lib/signal";
import { templatesTotalSignal } from "../../../../../store/templates-store";
import { WelcomeText } from "../../WelcomeText";
import { useStaggerReveal } from "../../hooks/use-stagger-reveal";
import { LIBRARY_ROWS } from "./curated-templates";
import { LibraryRow } from "./LibraryRow";

const SUBLINE_START_MS = 500;
const ROWS_START_MS = 700;
const ROW_STEP_MS = 220;
const ROW_RISE_MS = 1600;

const ROW_RISE_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(80px)", filter: "blur(10px)" },
  { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
];

const headlineCopy = (total: number): string =>
  total > 0 ? `${total} templates, made by designers.` : "Hundreds of templates, made by designers.";

export const LibraryScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const total = useSignalValue(templatesTotalSignal);

  useStaggerReveal(sceneRef, {
    selector: "[data-library-row]",
    keyframes: ROW_RISE_KEYFRAMES,
    startMs: ROWS_START_MS,
    stepMs: ROW_STEP_MS,
    durationMs: ROW_RISE_MS,
  });

  return (
    <div ref={sceneRef} className="flex w-full flex-col items-center text-center">
      <h2 className="text-balance text-3xl font-medium tracking-tight md:text-5xl">
        <WelcomeText text={headlineCopy(total)} startMs={0} />
      </h2>
      <p className="mt-3 text-balance text-base text-white/55 md:text-lg">
        <WelcomeText text="Posters, covers, invites and albums, from every corner of the world." startMs={SUBLINE_START_MS} />
      </p>
      <div className="relative mt-6 w-screen md:mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex -rotate-2 flex-col gap-3 py-4 md:gap-4">
          {LIBRARY_ROWS.map((row, index) => (
            <div key={row[0].id} data-library-row>
              <LibraryRow templates={row} reverse={index % 2 === 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
