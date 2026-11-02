import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { groupMaskRuns, type MaskRunEntry } from "@bitgrain/studio-core/mask/mask-runs";
import { MaskScopeView } from "./mask-scope-view";

interface MaskRunsViewProps {
  layers: Layer[];
  scale: number;
  pageImage: string | null;
  selectedIds: string[];
  zIndexOf: (index: number) => number;
  positioned: (layer: Layer) => Layer;
  renderLayer: (layer: Layer, index: number, inMaskScope: boolean) => React.ReactNode;
  renderChrome: (layer: Layer, index: number) => React.ReactNode;
}

const scopeChrome = (entry: MaskRunEntry<Layer>, props: MaskRunsViewProps): React.ReactNode =>
  [entry.mask, ...entry.members]
    .filter((slot) => props.selectedIds.includes(slot.layer.id))
    .map((slot) => <React.Fragment key={`chrome-${slot.layer.id}`}>{props.renderChrome(slot.layer, slot.index)}</React.Fragment>);

export const MaskRunsView: React.FC<MaskRunsViewProps> = (props) => (
  <>
    {groupMaskRuns(props.layers).map((entry) => {
      if (entry.kind === "single") {
        return <React.Fragment key={entry.slot.layer.id}>{props.renderLayer(entry.slot.layer, entry.slot.index, false)}</React.Fragment>;
      }
      return (
        <MaskScopeView
          key={`mask-${entry.mask.layer.id}`}
          mask={props.positioned(entry.mask.layer)}
          zIndex={props.zIndexOf(entry.mask.index)}
          scale={props.scale}
          pageImage={props.pageImage}
          maskNode={props.renderLayer(entry.mask.layer, entry.mask.index, true)}
          chrome={scopeChrome(entry, props)}
        >
          {entry.members.map((slot) => (
            <React.Fragment key={slot.layer.id}>{props.renderLayer(slot.layer, slot.index, true)}</React.Fragment>
          ))}
        </MaskScopeView>
      );
    })}
  </>
);
