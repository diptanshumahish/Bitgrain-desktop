import React from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { Dropdown } from "../../../ui/dropdown";
import { Slider } from "@bitgrain/ui/controls/panel/slider";
import { PanelGroup } from "../../../ui/panel-group";
import { pageLayersSignal, pathSourceLayers } from "@bitgrain/studio-core/text/path/path-candidates-signal";
import { attachTextPathPatch, detachTextPathPatch } from "@bitgrain/studio-core/text/path/attach-text-path";

interface TextPathSectionProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const DETACHED = "";
const MAX_OFFSET = 100;

export const TextPathSection: React.FC<TextPathSectionProps> = ({ layer, onChange }) => {
  const sources = pathSourceLayers(useSignalValue(pageLayersSignal));
  const options = [
    { label: "Not on a path", value: DETACHED },
    ...sources.map((source) => ({ label: source.name || "Untitled shape", value: source.id })),
  ];
  const offset = layer.textPath?.offset ?? 0;

  const choose = (sourceId: string): void => {
    const source = sources.find((candidate) => candidate.id === sourceId);
    if (!source) {
      if (layer.textPath) onChange(detachTextPathPatch());
      return;
    }
    const patch = attachTextPathPatch(source, offset);
    if (patch) onChange(patch);
  };

  if (sources.length === 0 && !layer.textPath) return null;

  return (
    <PanelGroup title="Text on path">
      <Dropdown options={options} value={layer.textPath?.sourceId ?? DETACHED} onChange={choose} />
      {layer.textPath && (
        <Slider
          label="Start"
          value={offset}
          min={0}
          max={MAX_OFFSET}
          suffix="%"
          onChange={(value) => onChange({ textPath: layer.textPath ? { ...layer.textPath, offset: value } : undefined })}
        />
      )}
    </PanelGroup>
  );
};
