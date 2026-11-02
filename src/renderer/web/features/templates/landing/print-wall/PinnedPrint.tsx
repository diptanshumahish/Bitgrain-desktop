import React from "react";
import type { WallPrint } from "./print-wall-prints";
import { PrintAttachment, type AttachmentKind } from "./PrintAttachment";

interface PinnedPrintProps {
  print: WallPrint;
  index: number;
  heightClass: string;
}

const PRINT_TILTS: readonly string[] = [
  "-rotate-[2deg]",
  "rotate-[1.5deg]",
  "-rotate-[0.75deg]",
  "rotate-[2.5deg]",
  "-rotate-[1.75deg]",
  "rotate-[0.5deg]",
  "-rotate-[2.5deg]",
];

const TAPE_TILTS: readonly string[] = ["-rotate-[4deg]", "rotate-[3deg]", "-rotate-[1deg]"];

const CLIP_EVERY = 3;
const CLIP_SLOT = 1;

const attachmentFor = (index: number): AttachmentKind => (index % CLIP_EVERY === CLIP_SLOT ? "clip" : "tape");

export const PinnedPrint: React.FC<PinnedPrintProps> = ({ print, index, heightClass }) => (
  <div className="shrink-0 px-6 sm:px-9">
    <figure className={`relative m-0 ${PRINT_TILTS[index % PRINT_TILTS.length]}`}>
      <span className="print-crop text-ink-soft/45" />
      <img
        src={print.src}
        width={print.width}
        height={print.height}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`block w-auto max-w-none bg-stone object-cover ${heightClass}`}
      />
      <PrintAttachment kind={attachmentFor(index)} tiltClass={TAPE_TILTS[index % TAPE_TILTS.length]} />
    </figure>
  </div>
);
