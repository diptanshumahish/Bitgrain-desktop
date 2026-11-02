import React from "react";
import { AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart } from "lucide-react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { TextListStyle, TextVerticalAlign } from "@bitgrain/studio-core/model/text-layout-types";
import { BtnGroup, ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { PanelGroup } from "../../../ui/panel-group";
import { resolveTextSizing } from "@bitgrain/studio-core/text/layout/text-sizing";
import { countParagraphs } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-html";
import { toggleListForLayer, toggleListInEditor } from "@bitgrain/studio-core/text/layout/paragraphs/editor-list-toggle";
import { ListButtons } from "./ListButtons";

interface ParagraphSectionProps {
  layer: TextLayer;
  editing: boolean;
  onChange: (updates: Partial<TextLayer>) => void;
}

const ICON_SIZE = 14;
const MAX_PARAGRAPH_SPACING = 400;
const MAX_INDENT = 400;
const MAX_LINES_LIMIT = 99;

const VERTICAL_OPTIONS = [
  { icon: <AlignVerticalJustifyStart size={ICON_SIZE} />, value: "top", title: "Align top" },
  { icon: <AlignVerticalJustifyCenter size={ICON_SIZE} />, value: "middle", title: "Align middle" },
  { icon: <AlignVerticalJustifyEnd size={ICON_SIZE} />, value: "bottom", title: "Align bottom" },
];

const allParagraphsUse = (layer: TextLayer, style: TextListStyle): boolean => {
  const styles = layer.listStyles ?? [];
  return styles.length > 0 && Array.from({ length: countParagraphs(layer) }, (_, index) => styles[index] ?? "none").every((value) => value === style);
};

export const ParagraphSection: React.FC<ParagraphSectionProps> = ({ layer, editing, onChange }) => {
  const toggleList = (style: TextListStyle): void => {
    if (editing && toggleListInEditor(style, layer)) return;
    onChange({ listStyles: toggleListForLayer(style, layer.listStyles ?? [], countParagraphs(layer)) });
  };
  const showVertical = resolveTextSizing(layer) !== "auto-width" && !layer.textPath;

  return (
    <PanelGroup title="Paragraph">
      <ListButtons
        bulletActive={allParagraphsUse(layer, "bullet")}
        numberActive={allParagraphsUse(layer, "number")}
        onToggle={toggleList}
      />
      {showVertical && (
        <BtnGroup
          options={VERTICAL_OPTIONS}
          value={layer.verticalAlign ?? "top"}
          onChange={(value) => onChange({ verticalAlign: value as TextVerticalAlign })}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="Space" title="Space between paragraphs" value={layer.paragraphSpacing ?? 0} min={0} max={MAX_PARAGRAPH_SPACING} step={1} onChange={(value) => onChange({ paragraphSpacing: value })} />
        <ScrubField label="Indent" title="First line indent" value={layer.paragraphIndent ?? 0} min={0} max={MAX_INDENT} step={1} onChange={(value) => onChange({ paragraphIndent: value })} />
      </div>
      <ScrubField
        label="Max lines"
        title="Cut the text off after this many lines, 0 means no limit"
        value={layer.maxLines ?? 0}
        min={0}
        max={MAX_LINES_LIMIT}
        step={1}
        onChange={(value) => onChange({ maxLines: value > 0 ? Math.round(value) : undefined })}
      />
    </PanelGroup>
  );
};
