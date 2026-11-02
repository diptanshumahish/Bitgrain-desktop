import React from "react";
import { RED_DRESS_SPEC } from "./showcase-specs";
import { PrerenderedPreview } from "../../../../components/prerendered-preview/PrerenderedPreview";
import { FILL, SERIF_FONT } from "../../../../components/marketing/showcase/showcase-textures";
import { BARCODE } from "./engine-spec";

export const MagazineCover: React.FC = () => (
  <div className="absolute inset-0 bg-[#5b1a16] text-[#f6eadb]">
    <PrerenderedPreview {...RED_DRESS_SPEC} className={`${FILL} object-cover object-[50%_40%]`} alt="" />
    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/70" />

    <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between font-mono text-[10px]">
        <span>no. 14</span>
        <span>autumn 2026</span>
      </div>
      <p className={`${SERIF_FONT} -mt-1 text-[clamp(6rem,15vw,9rem)] leading-[0.78] tracking-[-0.04em]`}>
        grain
      </p>
      <div className="h-px bg-[#f6eadb]/60" />

      <div className="mt-auto flex items-end justify-between gap-4">
        <div className="max-w-[60%]">
          <p className={`${SERIF_FONT} italic text-[clamp(1.9rem,4vw,2.4rem)] leading-[0.9]`}>
            the slow issue
          </p>
          <p className="mt-2 text-[11px] font-semibold leading-snug text-[#f6eadb]/90">
            pour, wait, print. 52 pages on taking your time.
          </p>
        </div>
        <div className="shrink-0 bg-white px-2 pt-2 pb-1 w-[76px]">
          <div className={`h-9 ${BARCODE}`} />
          <p className="mt-1 font-mono text-[8px] text-center text-black">9 771234 56</p>
        </div>
      </div>
    </div>
  </div>
);
