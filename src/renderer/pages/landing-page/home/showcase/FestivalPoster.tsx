import React from "react";
import { HILL_SPEC } from "./showcase-specs";
import { PrerenderedPreview } from "../../../../components/prerendered-preview/PrerenderedPreview";
import { DISPLAY_FONT, FILL } from "../../../../components/marketing/showcase/showcase-textures";

const PROGRAM = ["aug 14 to 17", "hilltop cinema", "bring a blanket"];

export const FestivalPoster: React.FC = () => (
  <div className="absolute inset-0 flex flex-col bg-[#e3241b] p-4 sm:p-5 text-black">
    <div className="flex items-start justify-between gap-4 pb-3">
      <p className={`${DISPLAY_FONT} font-extrabold text-[clamp(2rem,4.4vw,2.8rem)] leading-[0.82] tracking-[-0.06em]`}>
        open air
        <br />
        film festival
      </p>
      <ul className="font-mono text-[10px] leading-[1.5] text-right">
        {PROGRAM.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>

    <div className="relative flex-1 overflow-hidden border-y-2 border-black">
      <PrerenderedPreview
        {...HILL_SPEC}
        className={`${FILL} object-cover object-[20%_center] mix-blend-multiply`}
        alt=""
      />
    </div>

    <div className="flex items-end justify-between pt-2">
      <p className="font-mono text-[10px] leading-[1.4] max-w-[12ch] pb-1">four nights, forty films</p>
      <p className={`${DISPLAY_FONT} font-extrabold text-[clamp(5rem,11vw,7rem)] leading-[0.72] tracking-[-0.08em]`}>
        26
      </p>
    </div>
  </div>
);
