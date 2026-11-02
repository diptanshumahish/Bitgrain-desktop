import React from "react";
import { FileImage } from "lucide-react";
import { PHOTO_FILE_NAME } from "../timeline/editor-photos";
import { POSTER_PHOTO } from "../timeline/poster-template";
import { PALETTE_NAMES } from "../timeline/editor-palettes";
import { FloatingCard } from "./FloatingCard";

const COBALT_CHIPS = ["bg-[#14143A]", "bg-[#2C45D3]", "bg-[#F3A98C]", "bg-[#F1ECE4]"];
const CAPTION = "mt-2 block text-[10.5px] text-ink-soft/60";

export const FloatingCards: React.FC = () => (
  <>
    <FloatingCard placementClass="-left-48 top-16 -rotate-6" delayMs={0}>
      <span className="block font-['Bitgrain_Sans'] text-[48px] font-bold leading-none text-ultramarine">Aa</span>
      <span className={CAPTION}>League Spartan, 132</span>
    </FloatingCard>
    <FloatingCard placementClass="-left-44 bottom-16 rotate-3" delayMs={900}>
      <span className="flex gap-1">
        {COBALT_CHIPS.map((chip) => (
          <span key={chip} className={`h-7 w-5 rounded ring-1 ring-ink-soft/10 ${chip}`} />
        ))}
      </span>
      <span className={CAPTION}>{PALETTE_NAMES.cobalt} palette</span>
    </FloatingCard>
    <FloatingCard placementClass="-right-40 top-10 rotate-6" delayMs={400}>
      <img src={POSTER_PHOTO} alt="" className="h-20 w-20 rounded-lg object-cover" />
      <span className={CAPTION}>{PHOTO_FILE_NAME}</span>
    </FloatingCard>
    <FloatingCard placementClass="-right-48 bottom-6 -rotate-3" delayMs={1300}>
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-apricot text-ultramarine">
          <FileImage size={16} />
        </span>
        <span>
          <span className="block text-[12px] font-medium text-ink-soft">open-studio-week.png</span>
          <span className="block text-[10.5px] text-ink-soft/60">2160 × 2700, ready to post</span>
        </span>
      </span>
    </FloatingCard>
  </>
);
