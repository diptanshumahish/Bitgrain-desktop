import React from "react";
import { READER_SPEC } from "./showcase-specs";
import { PrerenderedPreview } from "../../../../components/prerendered-preview/PrerenderedPreview";
import { FILL, SERIF_FONT } from "../../../../components/marketing/showcase/showcase-textures";
import { PAPER_GRAIN } from "./engine-spec";

export const NovelCover: React.FC = () => (
  <div className="absolute inset-0 bg-[#efe7d6] text-[#1b1b1b] p-3 sm:p-4">
    <div className="relative h-full border border-[#1b1b1b] flex flex-col items-center px-5 pt-6 pb-4 text-center">
      <p className="font-mono text-[9px] text-[#1b1b1b]/70">mira halden</p>

      <div className="relative mt-4 w-[78%] aspect-[3/4] overflow-hidden rounded-t-full border border-[#1b1b1b]">
        <PrerenderedPreview {...READER_SPEC} className={`${FILL} object-cover object-[45%_center]`} alt="" />
      </div>

      <p className={`${SERIF_FONT} mt-5 text-[clamp(2rem,4.2vw,2.6rem)] leading-[0.9]`}>
        the reader
        <br />
        <span className="italic">on the hill</span>
      </p>
      <p className={`${SERIF_FONT} mt-2 italic text-[15px] text-[#1b1b1b]/70`}>a novel</p>

      <p className="mt-auto font-mono text-[8px] text-[#1b1b1b]/60">grain press</p>
    </div>
    <div aria-hidden="true" className={`absolute inset-0 ${PAPER_GRAIN}`} />
  </div>
);
