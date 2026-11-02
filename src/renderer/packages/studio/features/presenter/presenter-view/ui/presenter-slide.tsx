import React from "react";

interface PresenterSlideProps {
  label: string;
  src: string | undefined;
  emptyText: string;
  hasSlide: boolean;
}

export const PresenterSlide: React.FC<PresenterSlideProps> = ({ label, src, emptyText, hasSlide }) => (
  <div className="flex flex-col gap-2 min-h-0 h-full">
    <span className="text-[12px] text-white/50">{label}</span>
    <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg bg-white/5">
      {hasSlide && src && <img src={src} alt={label} className="max-w-full max-h-full object-contain" />}
      {hasSlide && !src && <span className="text-[13px] text-white/40">Loading…</span>}
      {!hasSlide && <span className="text-[13px] text-white/40">{emptyText}</span>}
    </div>
  </div>
);
