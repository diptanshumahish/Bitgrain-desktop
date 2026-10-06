import React from "react";
import { AlignLeft, AlignCenter, AlignRight, Monitor } from "lucide-react";
import type { TextLayer, CustomFontEntry, BlendMode } from "../../../data/studioTypes";
import { DEFAULT_GRADIENT_TEXT, FONT_FAMILIES } from "../../../data/studioTypes";
import {
  ScrubField,
  BlendModeSelector,
  Row,
  BtnGroup,
  Toggle,
  OpacityRow,
} from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { LineHeightIcon, LetterSpacingIcon } from "./text/text-icons";
import { PairingsPanel } from "./text/PairingsPanel";
import { GradientConfig } from "./text/GradientConfig";
import { EffectsSection } from "./text/EffectsSection";
import { FillSection } from "./text/FillSection";
import { TypographySection } from "./text/TypographySection";
import { FontUploadButton } from "../fonts/FontUploadButton";
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
  const italicField = resolved?.italic ?? field(layer.fontStyle === "italic");
  const isStack = colorField.value === null && colorField.distinct.length > 1;

  const applyChar = (prop: RichStyleProp, value: string) => {
    if (editing) {
      applyToSelection(prop, prop === "fontSize" ? `${Number(value) / base.fontSize}em` : value);
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

  const adminFonts = useSignalValue(adminFontOptionsSignal);

  const fontOptions = [...customFonts, ...adminFonts, ...systemFonts, ...FONT_FAMILIES].map((font) => ({
    label: font.label,
    value: font.value,
    style: { fontFamily: font.value },
    group: font.group,
  }));

  const weightOptions = availableWeightsForFamily(familyField.value) ?? undefined;
  const availableStyles = availableStylesForFamily(familyField.value) ?? undefined;

  return (
    <div className="font-editorial">
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

      <PanelGroup title="Typography">
        <TypographySection
          fontOptions={fontOptions}
          weightOptions={weightOptions}
          availableStyles={availableStyles}
          familyField={familyField}
          weightField={weightField}
          sizeField={sizeField}
          italicField={italicField}
          onApply={applyChar}
        />

        {systemFonts.length === 0 && (
          <button
            type="button"
            onClick={handleLoadSystemFonts}
            className="flex items-center gap-1.5 text-[10px] text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] transition-colors bg-transparent border-none cursor-pointer w-fit"
          >
            <Monitor size={11} strokeWidth={1.5} className={loadingSystemFonts ? "animate-pulse" : ""} />
            {loadingSystemFonts ? "Loading system fonts..." : "Use system fonts"}
          </button>
        )}

        {onFontUpload && (
          <FontUploadButton
            onUploaded={(font) => {
              onFontUpload(font);
              applyChar("fontFamily", font.value);
            }}
          />
        )}

        <Row>
          <ScrubField label={<LineHeightIcon />} value={layer.lineHeight} min={0.5} max={4} step={0.05} decimals={2} onChange={(v) => onChange({ lineHeight: v })} />
          <ScrubField label={<LetterSpacingIcon />} value={layer.letterSpacing} min={-20} max={100} step={0.5} decimals={1} onChange={(v) => onChange({ letterSpacing: v })} />
        </Row>
        <Row>
          <BtnGroup
            options={[
              { icon: <AlignLeft size={12} />, value: "left", title: "Align left" },
              { icon: <AlignCenter size={12} />, value: "center", title: "Center" },
              { icon: <AlignRight size={12} />, value: "right", title: "Align right" },
            ]}
            value={layer.align}
            onChange={(v) => onChange({ align: v as TextLayer["align"] })}
          />
          <BtnGroup
            options={[
              { icon: <span className="text-[9.5px] font-bold">Aa</span>, value: "none", title: "None" },
              { icon: <span className="text-[9.5px] font-bold">AA</span>, value: "uppercase", title: "Uppercase" },
              { icon: <span className="text-[9.5px] font-bold">aa</span>, value: "lowercase", title: "Lowercase" },
            ]}
            value={layer.textTransform}
            onChange={(v) => onChange({ textTransform: v as TextLayer["textTransform"] })}
          />
        </Row>

        <PairingsPanel
          current={familyField.value ?? layer.fontFamily}
          onApply={(v) => applyChar("fontFamily", v)}
        />
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
