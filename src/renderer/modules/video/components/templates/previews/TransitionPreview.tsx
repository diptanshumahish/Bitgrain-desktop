import React from "react";
import type { TransitionKind } from "../../../templates/types";

interface TransitionPreviewProps {
  kind: TransitionKind;
}

const KIND_COLORS: Record<TransitionKind, { a: string; b: string; mid: string }> = {
  crossfade: { a: "bg-violet-500", b: "bg-blue-500", mid: "bg-transparent" },
  "dip-black": { a: "bg-violet-500", b: "bg-blue-500", mid: "bg-black" },
  "dip-white": { a: "bg-violet-500", b: "bg-blue-500", mid: "bg-white" },
  soft: { a: "bg-violet-500", b: "bg-blue-500", mid: "bg-transparent" },
};

export const TransitionPreview: React.FC<TransitionPreviewProps> = ({ kind }) => {
  const colors = KIND_COLORS[kind];
  return (
    <div className="relative h-10 w-full rounded-md bg-black overflow-hidden" aria-hidden>
      <div className={`absolute inset-y-1 left-1 w-[45%] rounded-sm ${colors.a} tpl-anim-trans-out`} />
      <div className={`absolute inset-y-1 right-1 w-[45%] rounded-sm ${colors.b} tpl-anim-trans-in`} />
      {(kind === "dip-black" || kind === "dip-white") && (
        <div className={`absolute inset-y-1 left-[42%] w-[16%] rounded-sm ${colors.mid} tpl-anim-trans-in`} />
      )}
    </div>
  );
};
