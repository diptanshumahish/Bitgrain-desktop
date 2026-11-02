import React from "react";
import { ElementsEmptyArt } from "./elements-empty-art";

export const ElementsEmptyState: React.FC = () => (
  <div className="px-5 pt-10 pb-8 flex flex-col items-center gap-4 text-center">
    <ElementsEmptyArt />
    <div className="flex flex-col gap-1.5">
      <p className="text-[12px] font-semibold text-[var(--s-text)]">The library is being drawn</p>
      <p className="text-[11px] leading-relaxed text-[var(--s-text-subtle)]">
        Borders, corners and motifs from folk art traditions are on their way. Soon you can drag them straight onto
        your page.
      </p>
    </div>
  </div>
);
