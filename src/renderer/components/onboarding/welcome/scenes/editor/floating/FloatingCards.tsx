import React from "react";
import { FileImage } from "lucide-react";
import { SWAPPED_PHOTO } from "../timeline/editor-photos";
import { FloatingCard } from "./FloatingCard";

const ROSE_CHIPS = ["bg-[#170909]", "bg-[#5a1a1c]", "bg-[#F0605A]", "bg-[#f5a99b]", "bg-[#F7E7DF]"];
const CAPTION = "mt-2 block text-[10.5px] text-white/50";

export const FloatingCards: React.FC = () => (
  <>
    <FloatingCard placementClass="-left-48 top-16 -rotate-6" delayMs={0}>
      <span className="block font-['Instrument_Serif'] text-[52px] leading-none text-white">Aa</span>
      <span className={CAPTION}>Instrument Serif, 300</span>
    </FloatingCard>
    <FloatingCard placementClass="-left-44 bottom-16 rotate-3" delayMs={900}>
      <span className="flex gap-1">
        {ROSE_CHIPS.map((chip) => (
          <span key={chip} className={`h-7 w-5 rounded ring-1 ring-white/10 ${chip}`} />
        ))}
      </span>
      <span className={CAPTION}>Velvet rose palette</span>
    </FloatingCard>
    <FloatingCard placementClass="-right-40 top-10 rotate-6" delayMs={400}>
      <img src={SWAPPED_PHOTO} alt="" className="h-24 w-[72px] rounded-lg object-cover ring-1 ring-white/15" />
      <span className={CAPTION}>hotel-red.jpg</span>
    </FloatingCard>
    <FloatingCard placementClass="-right-48 bottom-6 -rotate-3" delayMs={1300}>
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0e6c4] text-black">
          <FileImage size={16} />
        </span>
        <span>
          <span className="block text-[12px] text-white">night-songs-poster.png</span>
          <span className="block text-[10.5px] text-white/50">2480 × 3508, print ready</span>
        </span>
      </span>
    </FloatingCard>
  </>
);
