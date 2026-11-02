import React from "react";
import { LandingNav } from "../../landing/LandingNav";
import { MarineWaveBand } from "../../landing/marketing/marine/wave/MarineWaveBand";
import { MarineUnderline } from "../../landing/marketing/marine/wave/MarineUnderline";
import { MARINE_DISPLAY_CLASS, MARINE_SECTION_INNER_CLASS } from "../../landing/marketing/marine/marine-classes";
import { splitLastWord } from "./split-last-word";

interface ProseHeroProps {
  eyebrow?: string;
  headline: string;
  lead?: string;
  children?: React.ReactNode;
}

export const ProseHero: React.FC<ProseHeroProps> = ({ eyebrow, headline, lead, children }) => {
  const { opening, lastWord } = splitLastWord(headline);

  return (
    <section className="relative w-full overflow-hidden bg-ultramarine">
      <LandingNav variant="ultramarine" />
      <div className={`${MARINE_SECTION_INNER_CLASS} pt-12 sm:pt-20 pb-6 sm:pb-10`}>
        <div className="max-w-3xl">
          {eyebrow ? <p className="mb-5 text-white/85 text-[14px]">{eyebrow}</p> : null}
          <h1 className={`text-white text-[clamp(2.75rem,6vw,4.75rem)] whitespace-pre-line ${MARINE_DISPLAY_CLASS}`}>
            {opening}
            <MarineUnderline>{lastWord}</MarineUnderline>
          </h1>
          {lead ? (
            <p className="mt-7 max-w-xl text-white/85 text-[17px] sm:text-[18px] leading-[1.5]">{lead}</p>
          ) : null}
          {children}
        </div>
      </div>
      <MarineWaveBand />
    </section>
  );
};
