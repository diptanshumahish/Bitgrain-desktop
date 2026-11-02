import React, { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { studioPagesSignal } from "../../../state/studio-document-store";
import { MOD_ALT_KEY } from "../../../editor/shortcut-labels";
import { collectComponents } from "@bitgrain/studio-core/components/registry/collect-components";
import { libraryItems } from "@bitgrain/studio-core/components/registry/library-items";
import { createMainResolver } from "@bitgrain/studio-core/components/core/resolve-mains";
import { ComponentTile } from "./component-tile";

export const DocumentComponentsSection: React.FC = () => {
  const pages = useSignalValue(studioPagesSignal);
  const tiles = useMemo(() => {
    const resolver = createMainResolver(pages);
    return libraryItems(collectComponents(pages)).flatMap((item) => {
      const main = resolver.resolve(item.componentId);
      return main ? [{ ...item, main }] : [];
    });
  }, [pages]);

  return (
    <section aria-label="Components in this document" className="flex flex-col gap-2 px-3.5 pt-3 pb-1">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11.5px] font-semibold text-[var(--s-text)]">Components</h3>
        <span className="text-[10.5px] text-[var(--s-text-subtle)]">In this document</span>
      </div>
      {tiles.length === 0 ? (
        <p className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">
          Select a frame or group and press {MOD_ALT_KEY}K to turn it into a component you can reuse here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((tile) => (
            <ComponentTile key={tile.componentId} {...tile} />
          ))}
        </div>
      )}
    </section>
  );
};
