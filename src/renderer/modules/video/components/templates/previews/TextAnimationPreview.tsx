import React from "react";
import type { TextAnimation, TextAlign } from "../../../types";

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

const ALIGN_CLASS: Record<TextAlign, string> = {
  left: "justify-start text-left pl-2",
  center: "justify-center text-center",
  right: "justify-end text-right pr-2",
};

interface TextAnimationPreviewProps {
  text: string;
  animation: TextAnimation;
  align: TextAlign;
  yAnchor?: "top" | "middle" | "bottom";
}

const Y_CLASS: Record<NonNullable<TextAnimationPreviewProps["yAnchor"]>, string> = {
  top: "items-start pt-1",
  middle: "items-center",
  bottom: "items-end pb-1",
};

export const TextAnimationPreview: React.FC<TextAnimationPreviewProps> = ({
  text,
  animation,
  align,
  yAnchor = "middle",
}) => {
  const animClass = ANIMATION_CLASS[animation];
  const alignClass = ALIGN_CLASS[align];
  const yClass = Y_CLASS[yAnchor];
  const display = text.length > 16 ? text.slice(0, 16) + "…" : text;
  return (
    <div
      className={`h-12 w-full rounded-md bg-black overflow-hidden flex ${alignClass} ${yClass}`}
      aria-hidden
    >
      <span
        className={`text-white text-[13px] font-bold leading-none whitespace-nowrap inline-block ${animClass}`}
      >
        {display}
      </span>
    </div>
  );
};
