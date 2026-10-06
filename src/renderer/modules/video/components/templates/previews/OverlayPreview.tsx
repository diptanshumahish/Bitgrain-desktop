import React from "react";
import type { OverlayTextPart } from "../../../templates/types";
import type { TextAnimation } from "../../../types";

const ANIMATION_CLASS: Record<TextAnimation, string> = {
  none: "",
  fade: "tpl-anim-fade",
  typewriter: "tpl-anim-typewriter",
  "slide-up": "tpl-anim-slide-up",
  "slide-down": "tpl-anim-slide-down",
  "slide-left": "tpl-anim-slide-left",
  "slide-right": "tpl-anim-slide-right",
  "scale-in": "tpl-anim-scale-in",
  "blur-in": "tpl-anim-blur-in",
  bounce: "tpl-anim-bounce",
  pop: "tpl-anim-pop",
  gravity: "tpl-anim-gravity",
  "jump-out": "tpl-anim-jump-out",
  elastic: "tpl-anim-elastic",
  "swing-in": "tpl-anim-swing-in",
  whoosh: "tpl-anim-whoosh",
};

function translateForAlign(align: OverlayTextPart["align"]): string {
  if (align === "left") return "translate(0, -50%)";
  if (align === "right") return "translate(-100%, -50%)";
  return "translate(-50%, -50%)";
}

function fontSizeForPart(part: OverlayTextPart): number {
  const min = 8;
  const max = 18;
  const scaled = Math.round((part.size / 320) * max);
  return Math.max(min, Math.min(max, scaled));
}

interface OverlayPreviewProps {
  parts: OverlayTextPart[];
}

export const OverlayPreview: React.FC<OverlayPreviewProps> = ({ parts }) => (
  <div className="relative h-14 w-full rounded-md bg-black overflow-hidden" aria-hidden>
    {parts.map((part, idx) => {
      const animClass = ANIMATION_CLASS[part.animation];
      const left = `${part.position.x * 100}%`;
      const top = `${part.position.y * 100}%`;
      const fontSize = fontSizeForPart(part);
      const transform = translateForAlign(part.align);
      const display = part.text.length > 14 ? part.text.slice(0, 14) + "…" : part.text;
      return (
        <span
          key={idx}
          className={`absolute text-white font-bold leading-none whitespace-nowrap ${animClass}`}
          style={{ left, top, transform, fontSize, animationDelay: `${part.offset * 0.4}s` }}
        >
          {display}
        </span>
      );
    })}
  </div>
);
