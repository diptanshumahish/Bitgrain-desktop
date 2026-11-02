import React from "react";
import type { TextLayer, CustomFontEntry, BlendMode, TextDecorationLine } from "@bitgrain/studio-core/model/studio-types";
import { DEFAULT_GRADIENT_TEXT, FONT_FAMILIES } from "@bitgrain/studio-core/model/studio-types";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { AppearanceControls } from "./appearance-controls";
import { PanelGroup } from "../ui/panel-group";
import { GradientConfig } from "./text/GradientConfig";
import { TextEffectsSection } from "./paint-list/effects/text/TextEffectsSection";
import { FillSection } from "./text/FillSection";
import { TypographySection } from "./text/TypographySection";
import { TextToolbar, type TextFormatKey } from "./text/TextToolbar";
import { TextCaseRow } from "./text/TextCaseRow";
import { isBoldWeight, nextBoldWeight } from "@bitgrain/studio-core/text/rich-text/bold-weight";
import { parseDecoration, toggleDecoration } from "@bitgrain/studio-core/text/rich-text/text-decoration";
import { FontSourceActions } from "./text/FontSourceActions";
import { TextPositionSection } from "./text/layout/TextPositionSection";
import { ParagraphSection } from "./text/paragraph/ParagraphSection";
import { OpenTypeSection } from "./text/opentype/OpenTypeSection";
import { TextPathSection } from "./text/path/TextPathSection";
import { withAxis } from "./text/opentype/variable-axes";
import { LinkedTokensRow } from "../design-kit/linking/linked-tokens-row";
import { ContrastSection } from "./text-contrast/contrast-section";
import { previewTextLayer, type TextPreviewPatch } from "../fonts/text-preview-signal";
import { adminFontOptionsSignal, availableWeightsForFamily, availableStylesForFamily } from "@bitgrain/studio-core/fonts/admin-fonts";
import {
  systemFontOptionsSignal,
  systemFontsLoadingSignal,
  loadSystemFonts,
  ensureSystemFontsLoaded,
} from "../fonts/system-fonts";
import { useSignalValue } from "@bitgrain/core/signal";
import {
  selectionStyleSignal,
  applyToSelectionOrAll,
  recolorSelectionSubset,
  previewOnSelection,
  endSelectionPreview,
} from "@bitgrain/studio-core/text/rich-text/text-edit-bus";
import { resolveHtmlStyle, layerBaseStyle } from "@bitgrain/studio-core/text/rich-text/rich-text-read";
import { stripPropFromHtml, recolorHtmlSubset } from "@bitgrain/studio-core/text/rich-text/rich-text-apply";
import type { RichStyleProp, StyleField } from "@bitgrain/studio-core/text/rich-text/rich-text-types";

interface TextPropertiesProps {
  layer: TextLayer;
  editing?: boolean;
  onChange: (updates: Partial<TextLayer>) => void;
  customFonts?: CustomFontEntry[];
  onFontUpload?: (font: CustomFontEntry) => void;
  onAlign?: (alignment: string) => void;
}

const field = <T,>(value: T): StyleField<T> => ({ value, distinct: [value] });

const charToLayer = (prop: RichStyleProp, value: string): Partial<TextLayer> => {
  switch (prop) {
    case "color": return { color: value };
    case "fontFamily": return { fontFamily: value };
    case "fontWeight": return { fontWeight: value as TextLayer["fontWeight"] };
    case "fontSize": return { fontSize: Number(value) };
    case "fontStyle": return { fontStyle: value === "italic" ? "italic" : "regular" };
    case "textDecorationLine": return { textDecoration: value as TextDecorationLine };
    case "textTransform": return { textTransform: value as TextLayer["textTransform"] };
    case "letterSpacing": return { letterSpacing: Number(value) };
  }
};

export const TextProperties: React.FC<TextPropertiesProps> = ({
  layer,
  editing = false,
  onChange,
  customFonts = [],
  onFontUpload,
  onAlign,
}) => {
  const systemFonts = useSignalValue(systemFontOptionsSignal);
  const loadingSystemFonts = useSignalValue(systemFontsLoadingSignal);
  const selectionStyle = useSignalValue(selectionStyleSignal);

  React.useEffect(() => {
    void ensureSystemFontsLoaded();
  }, []);

  const g = { ...DEFAULT_GRADIENT_TEXT, ...layer.gradientText };
  const base = layerBaseStyle(layer);
  const richRef = React.useRef(layer.richContent);
  React.useEffect(() => {
    richRef.current = layer.richContent;
  }, [layer.richContent]);

  const resolved = editing
    ? selectionStyle
    : layer.richContent
      ? resolveHtmlStyle(layer.richContent, base)
      : null;

  const colorField = resolved?.color ?? field(layer.color);
  const familyField = resolved?.fontFamily ?? field(layer.fontFamily);
  const weightField = resolved?.fontWeight ?? field(layer.fontWeight);
  const sizeField = resolved?.fontSize ?? field(layer.fontSize);
  const transformField = resolved?.textTransform ?? field<string>(layer.textTransform);
  const spacingField = resolved?.letterSpacing ?? field(layer.letterSpacing);
  const italicField = resolved?.italic ?? field(layer.fontStyle === "italic");
  const isStack = colorField.value === null && colorField.distinct.length > 1;
  const layerDecoration = parseDecoration(layer.textDecoration);
  const formatState = {
    bold: isBoldWeight(weightField.value),
    italic: italicField.value === true,
    underline: (resolved?.underline ?? field(layerDecoration.underline)).value === true,
    strike: (resolved?.strike ?? field(layerDecoration.strike)).value === true,
  };

  const toggleFormat = (key: TextFormatKey) => {
    if (key === "bold") applyChar("fontWeight", nextBoldWeight(weightField.value));
    else if (key === "italic") applyChar("fontStyle", formatState.italic ? "normal" : "italic");
    else applyChar("textDecorationLine", toggleDecoration(formatState, key));
  };

  const toSelectionValue = (prop: RichStyleProp, value: string): string => {
    if (prop === "fontSize") return `${Number(value) / base.fontSize}em`;
    if (prop === "letterSpacing") return `${Number(value) / (sizeField.value ?? base.fontSize)}em`;
    return value;
  };

  const applyChar = (prop: RichStyleProp, value: string) => {
    if (editing) {
      applyToSelectionOrAll(prop, toSelectionValue(prop, value));
      return;
    }
    const update = charToLayer(prop, value);
    if (prop === "fontWeight" && layer.fontVariations?.wght !== undefined) update.fontVariations = withAxis(layer, "wght", undefined);
    if (richRef.current) update.richContent = stripPropFromHtml(richRef.current, prop);
    onChange(update);
  };

  const applyColor = (hex: string) => {
    if (editing) {
      applyToSelectionOrAll("color", hex);
      return;
    }
    const update: Partial<TextLayer> = { color: hex, colorVar: undefined };
    if (richRef.current) update.richContent = stripPropFromHtml(richRef.current, "color");
    onChange(update);
  };

  const bindColor = (varId: string, value: string) => {
    if (editing) {
      applyToSelectionOrAll("color", value);
      return;
    }
    const update: Partial<TextLayer> = { color: value, colorVar: varId };
    if (richRef.current) update.richContent = stripPropFromHtml(richRef.current, "color");
    onChange(update);
  };

  const recolor = (fromHex: string, toHex: string) => {
    if (editing) {
      recolorSelectionSubset(fromHex, toHex);
      return;
    }
    if (richRef.current) {
      onChange({ richContent: recolorHtmlSubset(richRef.current, fromHex, toHex, base) });
    }
  };

  const handleLoadSystemFonts = async () => {
    const result = await loadSystemFonts();
    if (result.ok) return;
    if (result.reason === "unsupported") {
      alert("Local font access is not supported in this browser. Try Chrome or Edge.");
    } else {
      alert("Could not load local fonts. Please ensure you have granted permission.");
    }
  };

  const previewPatch = (patch: TextPreviewPatch | null) => {
    if (!editing) {
      previewTextLayer(layer.id, patch);
      return;
    }
    if (patch?.fontFamily) previewOnSelection("fontFamily", patch.fontFamily);
    else if (patch?.fontWeight) previewOnSelection("fontWeight", patch.fontWeight);
    else endSelectionPreview();
  };

  const handleFontUploaded = (font: CustomFontEntry) => {
    onFontUpload?.(font);
    applyChar("fontFamily", font.value);
  };

  const adminFonts = useSignalValue(adminFontOptionsSignal);

  const fontOptions = [...customFonts, ...adminFonts, ...systemFonts, ...FONT_FAMILIES].map((font) => ({
    label: font.label,
    value: font.value,
    style: { fontFamily: font.value },
    group: font.group,
  }));

  const weightOptions = availableWeightsForFamily(familyField.value) ?? undefined;
  const availableStyles = availableStylesForFamily(familyField.value);
  const showItalic = !availableStyles || (availableStyles.normal && availableStyles.italic);

  return (
    <div className="font-editorial">
      <TextPositionSection layer={layer} onChange={onChange} onAlign={onAlign} />

      <PanelGroup
        title="Typography"
        actions={
          <FontSourceActions
            showSystemFonts={systemFonts.length === 0}
            loadingSystemFonts={loadingSystemFonts}
            onLoadSystemFonts={handleLoadSystemFonts}
            onFontUploaded={onFontUpload ? handleFontUploaded : undefined}
          />
        }
      >
        <LinkedTokensRow layer={layer} onChange={(updates) => onChange(updates as Partial<TextLayer>)} />
        <TypographySection
          fontOptions={fontOptions}
          weightOptions={weightOptions}
          familyField={familyField}
          weightField={weightField}
          sizeField={sizeField}
          spacingField={spacingField}
          lineHeight={layer.lineHeight}
          onApply={applyChar}
          onPreview={previewPatch}
          onLineHeight={(lineHeight) => onChange({ lineHeight })}
        />

        <TextToolbar
          format={formatState}
          showItalic={showItalic}
          align={layer.align}
          onToggleFormat={toggleFormat}
          onAlign={(align) => onChange({ align })}
        />

        <TextCaseRow value={transformField.value ?? ""} onChange={(textTransform) => applyChar("textTransform", textTransform)} />
      </PanelGroup>

      <ParagraphSection layer={layer} editing={editing} onChange={onChange} />
      <OpenTypeSection layer={layer} onChange={onChange} />
      <TextPathSection layer={layer} onChange={onChange} />

      <PanelGroup title="Fill">
        {isStack && (
          <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Mixed colors</span>
        )}

        <FillSection
          isStack={isStack}
          singleColor={colorField.value ?? layer.color}
          stackColors={colorField.distinct}
          colorVar={editing ? undefined : layer.colorVar}
          onApplyColor={applyColor}
          onBindColor={bindColor}
          onRecolor={recolor}
        />

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Gradient</span>
          <Toggle label="Gradient text" value={g.enabled ?? false} onChange={(v) => onChange({ gradientText: { ...g, enabled: v } })} />
        </div>

        {g.enabled && <GradientConfig layer={layer} onChange={onChange} />}
      </PanelGroup>

      <ContrastSection layer={layer} onChange={onChange} />

      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={(opacity) => onChange({ opacity })}
          onBlendModeChange={(blendMode: BlendMode) => onChange({ blendMode })}
        />
      </PanelGroup>

      <TextEffectsSection effects={layer.effects} onChange={(effects) => onChange({ effects })} />
    </div>
  );
};
