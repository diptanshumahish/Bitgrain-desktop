import React from "react";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { StyleThumb } from "../../styles/thumbs/StyleThumb";
import { EFFECT_THUMBS } from "../effects/thumbs/effect-thumbs";
import { BrowserTile } from "./BrowserTile";
import type { BrowserEntry, BrowserFamily } from "./browser-entries";

interface BrowserSectionsProps {
  families: readonly BrowserFamily[];
  isSelected: (entry: BrowserEntry) => boolean;
  onPick: (entry: BrowserEntry) => void;
}

const CLASSIC_THUMB_KEYS: Partial<Record<TransformMode, string>> = { dither: "algorithm" };

const EntryThumb: React.FC<{ entry: BrowserEntry }> = ({ entry }) => {
  if (entry.kind === "style") return <StyleThumb styleId={entry.id} />;
  const Thumb = EFFECT_THUMBS[CLASSIC_THUMB_KEYS[entry.mode] ?? entry.mode];
  return <span className="flex w-full h-full items-center justify-center p-5 text-[var(--s-text-muted)]">{Thumb ? <Thumb /> : entry.glyph}</span>;
};

export const BrowserSections: React.FC<BrowserSectionsProps> = ({ families, isSelected, onPick }) => {
  if (families.length === 0) {
    return <p className="py-16 text-center text-[13px] text-[var(--s-text-subtle)]">No styles match that search.</p>;
  }
  return (
    <div className="flex flex-col gap-7">
      {families.map((family) => (
        <section key={family.id} className="flex flex-col gap-3">
          <h3 className="text-[12px] font-semibold text-[var(--s-text-muted)]">{family.label}</h3>
          <div className="grid grid-cols-4 gap-x-3.5 gap-y-4">
            {family.entries.map((entry) => (
              <BrowserTile key={entry.kind === "style" ? entry.id : entry.mode} label={entry.label} hint={entry.hint}
                selected={isSelected(entry)} onSelect={() => onPick(entry)}>
                <EntryThumb entry={entry} />
              </BrowserTile>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
