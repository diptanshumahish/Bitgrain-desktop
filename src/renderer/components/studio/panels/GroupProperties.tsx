import React from "react";
import { ArrowDown, ArrowRight, Grid, Shrink, Type, Ungroup, WrapText } from "lucide-react";
import type { GroupLayer, AlignItems, JustifyContent, Layer, LayoutMode } from "../../../data/studioTypes";
import { GroupColoursSection } from "../../../modules/elements/recolour/group-colours-section";
import { fitGroupSize } from "../../../utils/auto-layout";
import { PanelGroup } from "../ui/panel-group";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AlignRow } from "../ui/align-row";
import { ScrubField, Toggle } from "../ui/panelPrimitives";

interface GroupPropertiesProps {
  layer: GroupLayer;
  onChange: (updates: Partial<GroupLayer>) => void;
  onAlign?: (alignment: string) => void;
  onUngroup?: () => void;
  pageLayers?: Layer[];
  pageBackground?: string;
}

const LAYOUTS: { value: LayoutMode; icon: React.ReactNode; label: string }[] = [
  { value: "none", icon: <Type size={14} strokeWidth={1.75} />, label: "None" },
  { value: "flex-col", icon: <ArrowDown size={14} strokeWidth={1.75} />, label: "Vertical" },
  { value: "flex-row", icon: <ArrowRight size={14} strokeWidth={1.75} />, label: "Horizontal" },
  { value: "grid", icon: <Grid size={14} strokeWidth={1.75} />, label: "Grid" },
];

const ALIGN_ITEMS: { value: AlignItems; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
];

const JUSTIFY_OPTIONS: { value: JustifyContent; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "between", label: "Between" },
];

const Segmented: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="grid grid-cols-4 gap-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`h-[30px] rounded-md text-[10px] font-medium transition-colors ${
          option.value === value
            ? "bg-[var(--s-bg-input)] text-[var(--s-accent)]"
            : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const GroupProperties: React.FC<GroupPropertiesProps> = ({
  layer,
  onChange,
  onAlign,
  onUngroup,
  pageLayers = [],
  pageBackground = "",
}) => {
  const hasLayout = layer.layout !== "none";
  const isFlex = layer.layout === "flex-row" || layer.layout === "flex-col";
  const mainAxisLabel = layer.layout === "flex-row" ? "Distribute horizontally" : "Distribute vertically";
  const crossAxisLabel = layer.layout === "flex-row" ? "Align vertically" : "Align horizontally";

  const fitToContents = (): void => {
    const size = fitGroupSize(layer);
    if (size) onChange(size);
  };

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation ?? 0,
            borderRadius: 0,
          }}
          onChange={(updates) => onChange(updates as Partial<GroupLayer>)}
          showRadius={false}
        />
      </PanelGroup>

      <PanelGroup title="Layout">
        <div className="grid grid-cols-4 gap-1">
          {LAYOUTS.map(({ value, icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ layout: value })}
              title={label}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors ${
                layer.layout === value
                  ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
                  : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
              }`}
            >
              {icon}
              <span className="text-[9.5px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {hasLayout && (
          <div className="grid grid-cols-2 gap-2">
            <ScrubField
              label="Gap"
              value={layer.gap}
              min={0}
              max={400}
              onChange={(v) => onChange({ gap: v })}
            />
            <ScrubField
              label="Padding"
              value={layer.padding}
              min={0}
              max={400}
              onChange={(v) => onChange({ padding: v })}
            />
          </div>
        )}

        {hasLayout && (
          <button
            type="button"
            onClick={fitToContents}
            title="Resize the group to wrap its contents"
            className="w-fit inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[var(--s-text-subtle)] text-[10.5px] font-medium hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
          >
            <Shrink size={13} strokeWidth={1.75} />
            Fit to contents
          </button>
        )}

        {isFlex && (
          <div className="w-full h-8 flex items-center justify-between px-0.5">
            <span className="flex items-center gap-2 text-[11px] text-[var(--s-text-subtle)] font-medium">
              <WrapText size={13} strokeWidth={1.75} />
              Wrap content
            </span>
            <Toggle value={layer.wrap ?? false} onChange={(value) => onChange({ wrap: value })} />
          </div>
        )}

        {isFlex && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">{crossAxisLabel}</span>
            <Segmented
              options={ALIGN_ITEMS}
              value={layer.alignItems ?? "start"}
              onChange={(value) => onChange({ alignItems: value as AlignItems })}
            />
          </div>
        )}

        {isFlex && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">{mainAxisLabel}</span>
            <Segmented
              options={JUSTIFY_OPTIONS}
              value={layer.justifyContent ?? "start"}
              onChange={(value) => onChange({ justifyContent: value as JustifyContent })}
            />
          </div>
        )}
      </PanelGroup>

      <GroupColoursSection layer={layer} pageLayers={pageLayers} pageBackground={pageBackground} onChange={onChange} />

      {onUngroup && (
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={onUngroup}
            className="w-fit inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[var(--s-text-subtle)] text-[11px] font-medium hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            <Ungroup size={13} strokeWidth={1.75} />
            Ungroup
          </button>
        </div>
      )}
    </div>
  );
};
