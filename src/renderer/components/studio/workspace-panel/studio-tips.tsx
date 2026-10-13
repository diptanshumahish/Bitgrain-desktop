import React from "react";

const TIPS = [
  "Press V, T, R or P to grab a tool fast",
  "Hold space and drag to pan the canvas",
  "Drag any value label left or right to scrub",
  "Drag an element from the library straight onto a page",
];

export const StudioTips: React.FC = () => (
  <div className="px-4 pt-5 pb-2">
    <div className="relative rounded-xl bg-[var(--s-bg-input)] p-3.5 overflow-hidden">
      <svg viewBox="0 0 60 60" className="absolute -top-3 -right-3 w-16 h-16 text-[var(--s-text-subtle)] opacity-40" aria-hidden="true">
        <g fill="none" className="stroke-current" strokeWidth="1.2">
          <path d="M4 56 V30 A26 26 0 0 1 30 4 H56" />
          <path d="M12 56 V30 A18 18 0 0 1 30 12 H56" />
          <path d="M20 56 V30 A10 10 0 0 1 30 20 H56" />
        </g>
      </svg>
      <span className="text-[12px] font-semibold text-[var(--s-text)]">Good to know</span>
      <ul className="mt-2.5 flex flex-col gap-2">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2.5 text-[11px] leading-snug text-[var(--s-text-muted)]">
            <span className="mt-[5px] w-[5px] h-[5px] rotate-45 border border-[var(--s-text-subtle)] shrink-0" aria-hidden="true" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
