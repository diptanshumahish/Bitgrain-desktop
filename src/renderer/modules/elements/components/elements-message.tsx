import React from "react";

interface ElementsMessageProps {
  text: string;
}

export const ElementsMessage: React.FC<ElementsMessageProps> = ({ text }) => (
  <p className="px-4 py-8 text-center text-[11px] leading-relaxed text-[var(--s-text-subtle)]">{text}</p>
);
