import React from "react";

export type AttachmentKind = "tape" | "clip";

interface PrintAttachmentProps {
  kind: AttachmentKind;
  tiltClass: string;
}

const BinderClip: React.FC = () => (
  <svg
    viewBox="0 0 28 26"
    className="absolute left-1/2 top-0 h-[26px] w-7 -translate-x-1/2 -translate-y-[62%] text-ink-soft"
  >
    <path d="M8.5 13 L6.5 2.5 Q14 0 21.5 2.5 L19.5 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="3" y="11" width="22" height="13" rx="2" fill="currentColor" />
    <path d="M5.5 14.5 H22.5" className="stroke-paper/35" strokeWidth="1" />
  </svg>
);

export const PrintAttachment: React.FC<PrintAttachmentProps> = ({ kind, tiltClass }) => {
  if (kind === "clip") return <BinderClip />;
  return (
    <span
      className={`print-tape absolute left-1/2 top-0 h-[18px] w-[46%] -translate-x-1/2 -translate-y-1/2 bg-stone/85 ${tiltClass}`}
    />
  );
};
