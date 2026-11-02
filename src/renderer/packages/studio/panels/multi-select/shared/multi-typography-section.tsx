import React from "react";
import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { FONT_FAMILIES } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { adminFontOptionsSignal } from "@bitgrain/studio-core/fonts/admin-fonts";
import { PanelGroup } from "../../../ui/panel-group";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { Dropdown, type DropdownOption } from "../../../ui/dropdown";
import { sharedValue } from "./shared-value";
import { buildEntries } from "./build-entries";
import { richStripUpdate } from "./rich-strip";
import type { LayerUpdateEntry } from "./layer-update-entry";

const WEIGHT_OPTIONS: DropdownOption[] = [
  { label: "300 Light", value: "300" },
  { label: "400 Regular", value: "400" },
  { label: "500 Medium", value: "500" },
  { label: "600 Semibold", value: "600" },
  { label: "700 Bold", value: "700" },
  { label: "800 Extrabold", value: "800" },
  { label: "900 Black", value: "900" },
];

const FONT_LIST_MAX_HEIGHT = 280;
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 400;

interface MultiTypographySectionProps {
  layers: TextLayer[];
  onUpdateLayers: (entries: LayerUpdateEntry[]) => void;
}

const textUpdater =
  (updates: Partial<TextLayer>, prop: "fontFamily" | "fontWeight" | "fontSize") =>
  (layer: Layer): Partial<Layer> | null =>
    layer.type === "text" ? { ...updates, ...richStripUpdate(layer, prop) } : null;

export const MultiTypographySection: React.FC<MultiTypographySectionProps> = ({ layers, onUpdateLayers }) => {
  const adminFonts = useSignalValue(adminFontOptionsSignal);
  const family = sharedValue(layers.map((layer) => layer.fontFamily));
  const weight = sharedValue<string>(layers.map((layer) => layer.fontWeight));
  const size = sharedValue(layers.map((layer) => layer.fontSize));
  const fontOptions = [...adminFonts, ...FONT_FAMILIES].map((font) => ({
    label: font.label,
    value: font.value,
    style: { fontFamily: font.value },
    group: font.group,
  }));

  return (
    <PanelGroup title="Typography">
      <Dropdown
        options={fontOptions}
        value={family.value ?? ""}
        placeholder="Mixed"
        maxHeight={FONT_LIST_MAX_HEIGHT}
        searchable
        onChange={(fontFamily) => onUpdateLayers(buildEntries(layers, textUpdater({ fontFamily }, "fontFamily")))}
      />
      <div className="grid grid-cols-2 gap-2">
        <Dropdown
          options={WEIGHT_OPTIONS}
          value={weight.value ?? ""}
          placeholder="Mixed"
          onChange={(value) =>
            onUpdateLayers(
              buildEntries(layers, textUpdater({ fontWeight: value as TextLayer["fontWeight"] }, "fontWeight")),
            )
          }
        />
        <ScrubField
          label="Size"
          value={size.first ?? 0}
          mixed={size.mixed}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={1}
          onChange={(fontSize) => onUpdateLayers(buildEntries(layers, textUpdater({ fontSize }, "fontSize")))}
        />
      </div>
    </PanelGroup>
  );
};
