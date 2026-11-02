import React from "react";
import type { TextLayer, CustomFontEntry, BlendMode, TextDecorationLine } from "../../../data/studioTypes";
import { DEFAULT_GRADIENT_TEXT, FONT_FAMILIES } from "../../../data/studioTypes";
import {
  ScrubField,
  BlendModeSelector,
  Toggle,
  OpacityRow,
} from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { GradientConfig } from "./text/GradientConfig";
import { EffectsSection } from "./text/EffectsSection";
import { FillSection } from "./text/FillSection";
import { TypographySection } from "./text/TypographySection";
import { TextToolbar, type TextFormatKey } from "./text/TextToolbar";
import { TextCaseRow } from "./text/TextCaseRow";
import { TextSpecimenCard } from "./text/TextSpecimenCard";
import { isBoldWeight, nextBoldWeight } from "../rich-text/bold-weight";
import { parseDecoration, toggleDecoration } from "../rich-text/text-decoration";
import { FontSourceActions } from "./text/FontSourceActions";
import { previewTextLayer, type TextPreviewPatch } from "../fonts/text-preview-signal";
import { adminFontOptionsSignal, availableWeightsForFamily, availableStylesForFamily } from "../../../lib/admin-fonts";
import {
  systemFontOptionsSignal,
  systemFontsLoadingSignal,
  loadSystemFonts,
  ensureSystemFontsLoaded,
} from "../../../lib/system-fonts";
import { useSignalValue } from "../../../lib/signal";
import {
  selectionStyleSignal,
  applyToSelection,
  recolorSelectionSubset,
  setSelectionColor,
  previewOnSelection,
  endSelectionPreview,
} from "../rich-text/text-edit-bus";
import { resolveHtmlStyle, layerBaseStyle } from "../rich-text/rich-text-read";
import { stripPropFromHtml, recolorHtmlSubset } from "../rich-text/rich-text-apply";
import type { RichStyleProp, StyleField } from "../rich-text/rich-text-types";

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
      applyToSelection(prop, toSelectionValue(prop, value));
      return;
    }
    const update = charToLayer(prop, value);
    if (richRef.current) update.richContent = stripPropFromHtml(richRef.current, prop);
    onChange(update);
  };

  const applyColor = (hex: string) => {
    if (editing) {
      setSelectionColor(hex);
      return;
    }
    const update: Partial<TextLayer> = { color: hex, colorVar: undefined };
    if (richRef.current) update.richContent = stripPropFromHtml(richRef.current, "color");
    onChange(update);
  };

  const bindColor = (varId: string, value: string) => {
    if (editing) {
      setSelectionColor(value);
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
      <TextSpecimenCard
        fontFamily={familyField.value ?? layer.fontFamily}
        mixedFonts={familyField.value === null}
        content={layer.content}
      />

      <PanelGroup title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="X" value={layer.x} step={1} onChange={(v) => onChange({ x: v })} />
          <ScrubField label="Y" value={layer.y} step={1} onChange={(v) => onChange({ y: v })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="W" value={layer.width} min={4} step={1} onChange={(v) => onChange({ width: v })} />
          <ScrubField label="H" value={layer.height} min={4} step={1} disabled={layer.autoResize} onChange={(v) => onChange({ height: v })} />
        </div>
        <ScrubField label="Rotate" value={layer.rotation ?? 0} min={-360} max={360} step={1} suffix="°" onChange={(v) => onChange({ rotation: v })} />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Auto height</span>
          <Toggle value={layer.autoResize ?? false} onChange={(v) => onChange({ autoResize: v })} />
        </div>
      </PanelGroup>

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

      <PanelGroup title="Fill">
        {isStack && (
          <span className="text-[10px] text-[var(--s-text-subtle)] font-medium">Mixed colors</span>
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
          <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Gradient</span>
          <Toggle value={g.enabled ?? false} onChange={(v) => onChange({ gradientText: { ...g, enabled: v } })} />
        </div>

        {g.enabled && <GradientConfig layer={layer} onChange={onChange} />}
      </PanelGroup>

      <PanelGroup title="Appearance">
        <OpacityRow value={layer.opacity} onChange={(v) => onChange({ opacity: v })} />
        <BlendModeSelector value={layer.blendMode} onChange={(v) => onChange({ blendMode: v as BlendMode })} />
      </PanelGroup>

      <EffectsSection layer={layer} onChange={onChange} />
    </div>
  );
};
