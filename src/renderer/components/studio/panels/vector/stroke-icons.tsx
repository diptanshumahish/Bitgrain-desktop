import React from "react";
import type { DashStyle, LineCap, LineJoin } from "../../../../data/studioTypes";

const ICON_SIZE = 16;

const IconFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    {children}
  </svg>
);

const DASH_ARRAYS: Record<DashStyle, string | undefined> = {
  solid: undefined,
  dashed: "3.5 2.5",
  dotted: "0.1 3",
};

export const DashStyleIcon: React.FC<{ style: DashStyle }> = ({ style }) => (
  <IconFrame>
    <path d="M2 8 H14" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeDasharray={DASH_ARRAYS[style]} />
  </IconFrame>
);

export const LineCapIcon: React.FC<{ cap: LineCap }> = ({ cap }) => (
  <IconFrame>
    <path d="M2 8 H9" className="stroke-current" strokeWidth="5" strokeLinecap={cap} opacity="0.85" />
    <path d="M9 3 V13" className="stroke-current" strokeWidth="0.8" strokeDasharray="1 1.2" opacity="0.6" />
  </IconFrame>
);

export const LineJoinIcon: React.FC<{ join: LineJoin }> = ({ join }) => (
  <IconFrame>
    <path d="M3.5 13 V4.5 H12.5" className="stroke-current" strokeWidth="3.5" strokeLinejoin={join} />
  </IconFrame>
);
