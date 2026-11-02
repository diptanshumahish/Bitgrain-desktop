import React, { useState, useRef } from "react";
import { Pipette } from "lucide-react";
import { expandShortHex, hexToHsv, hsvToHex, isValidHex } from "./colorUtils";
import { openColorPicker } from "./color-picker/open-color-picker";
import { useSignalValue } from "@bitgrain/core/signal";
import { useActiveKit } from "../state/design-kits-store";
import { SvPicker } from "./color-picker/sv-picker";
import { HueSlider } from "./color-picker/hue-slider";
import { AlphaSlider } from "./color-picker/alpha-slider";
import { ColorModeToggle } from "./color-picker/color-mode-toggle";
import { colorInputModeSignal } from "../state/color-input-mode-store";
import { ColorChannelInputs } from "./color-picker/color-channel-inputs";
import { DocumentColorsRow } from "./color-picker/document-colors-row";
import { SwatchButton } from "./color-picker/swatch-button";
import { ALPHA_MAX, HEX6_LENGTH, HEX8_LENGTH, colorLabel, get6, parseAlpha, withAlpha } from "./color-picker/color-alpha";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  varId?: string;
  onBindVariable?: (varId: string, value: string) => void;
}

const PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#6b7280",
  "#1a1a1a",
  "#f0ebe0",
  "#0a0a0a",
  "#f5f0e6",
];

const CHECKERBOARD_CLASS =
  "bg-[linear-gradient(45deg,#888_25%,transparent_25%),linear-gradient(-45deg,#888_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#888_75%),linear-gradient(-45deg,transparent_75%,#888_75%)] bg-[length:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0px]";

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperApi {
  open: () => Promise<EyeDropperResult>;
}

const pickWithEyeDropper = async (): Promise<string | null> => {
  const EyeDropperCtor = (window as unknown as { EyeDropper?: new () => EyeDropperApi }).EyeDropper;
  if (!EyeDropperCtor) return null;
  try {
    const result = await new EyeDropperCtor().open();
    return result.sRGBHex;
  } catch {
    return null;
  }
};

export const ColorPickerContent: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  varId,
  onBindVariable,
}) => {
  const kit = useActiveKit();
  const mode = useSignalValue(colorInputModeSignal);
  const [lastColor, setLastColor] = useState(color);
  const initialHex = get6(color);
  const [initialH, initialS, initialV] = hexToHsv(initialHex);
  const [hexInput, setHexInput] = useState(initialHex);
  const [hue, setHue] = useState(initialH);
  const [sat, setSat] = useState(initialS);
  const [val, setVal] = useState(initialV);
  const [alpha, setAlpha] = useState(parseAlpha(color));

  if (lastColor !== color) {
    const nextHex = get6(color);
    const [nextH, nextS, nextV] = hexToHsv(nextHex);
    setLastColor(color);
    setHue(nextH);
    setSat(nextS);
    setVal(nextV);
    setHexInput(nextHex);
    setAlpha(parseAlpha(color));
  }

  const update = (nextH: number, nextS: number, nextV: number, nextA: number): void => {
    const nextHex = hsvToHex(nextH, nextS, nextV);
    setHue(nextH);
    setSat(nextS);
    setVal(nextV);
    setAlpha(nextA);
    setHexInput(nextHex);
    onChange(withAlpha(nextHex, nextA));
  };

  const handleHexInput = (raw: string): void => {
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    setHexInput(raw);
    const nextHex = normalized.slice(0, HEX6_LENGTH);
    if (!isValidHex(nextHex)) return;
    const [nextH, nextS, nextV] = hexToHsv(nextHex);
    setHue(nextH);
    setSat(nextS);
    setVal(nextV);
    const nextAlpha = normalized.length === HEX8_LENGTH ? parseAlpha(normalized) : alpha;
    setAlpha(nextAlpha);
    onChange(withAlpha(nextHex, nextAlpha));
  };

  const commitHexInput = (): void => {
    const expanded = expandShortHex(hexInput);
    const normalized = expanded.startsWith("#") ? expanded : `#${expanded}`;
    if (isValidHex(normalized.slice(0, HEX6_LENGTH))) handleHexInput(normalized);
    else setHexInput(hsvToHex(hue, sat, val));
  };

  const handleEyeDropper = async (): Promise<void> => {
    const picked = await pickWithEyeDropper();
    if (picked) handleHexInput(picked);
  };

  const hex6 = hsvToHex(hue, sat, val);

  return (
    <div className="flex flex-col gap-3 font-editorial">
      <SvPicker hue={hue} sat={sat} val={val} onChange={(nextS, nextV) => update(hue, nextS, nextV, alpha)} />

      <div className="flex flex-col gap-3">
        <HueSlider hue={hue} onChange={(nextH) => update(nextH, sat, val, alpha)} />
        <AlphaSlider alpha={alpha} hex6={hex6} onChange={(nextA) => update(hue, sat, val, nextA)} />

        <ColorModeToggle />

        <div className="flex items-center gap-2">
          {mode === "hex" ? (
            <div className="flex-1 h-8 bg-[var(--s-bg-input)] rounded-md flex items-center gap-2 px-2.5">
              <span className="text-[12px] text-[var(--s-text-subtle)]">Hex</span>
              <input
                type="text"
                value={hexInput}
                onChange={(event) => handleHexInput(event.target.value)}
                onBlur={commitHexInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitHexInput();
                }}
                className="w-full bg-transparent border-none text-[12px] text-[var(--s-text)] outline-none font-medium"
                maxLength={HEX8_LENGTH}
              />
            </div>
          ) : (
            <ColorChannelInputs hex6={hex6} mode={mode} onCommit={handleHexInput} />
          )}
          <div className="h-8 bg-[var(--s-bg-input)] rounded-md flex items-center gap-0.5 px-2 w-[58px] shrink-0">
            <input
              type="number"
              min={0}
              max={ALPHA_MAX}
              value={alpha}
              onChange={(event) => {
                const nextA = Math.max(0, Math.min(ALPHA_MAX, Number(event.target.value)));
                update(hue, sat, val, nextA);
              }}
              className="w-full bg-transparent border-none text-[12px] text-[var(--s-text)] outline-none font-medium text-right"
            />
            <span className="text-[12px] text-[var(--s-text-subtle)] shrink-0">%</span>
          </div>
        </div>

        {"EyeDropper" in window && (
          <button
            onClick={() => void handleEyeDropper()}
            className="flex h-8 text-[12px] gap-2 items-center justify-center rounded-md border-none bg-transparent px-2 text-(--s-text-subtle) cursor-pointer hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] shrink-0"
          >
            <Pipette size={14} /> Pick color
          </button>
        )}
      </div>

      <DocumentColorsRow current={color} onPick={(picked) => onChange(picked)} />

      {kit && kit.colors.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--s-border)]">
          <span className="text-[12px] font-medium text-[var(--s-text-muted)]">{kit.name}</span>
          <div className="grid grid-cols-8 gap-1.5">
            {kit.colors.map((variable) => (
              <SwatchButton
                key={variable.id}
                color={variable.value}
                title={variable.name}
                active={varId ? varId === variable.id : get6(color) === get6(variable.value)}
                onClick={() =>
                  onBindVariable ? onBindVariable(variable.id, variable.value) : onChange(variable.value)
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-8 gap-1.5 pt-3 border-t border-[var(--s-border)]">
        {PRESETS.map((preset) => (
          <SwatchButton
            key={preset}
            color={preset}
            active={get6(color) === preset}
            onClick={() => onChange(withAlpha(preset, alpha))}
          />
        ))}
      </div>
    </div>
  );
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  varId,
  onBindVariable,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const kit = useActiveKit();
  const boundVar = varId ? kit?.colors.find((variable) => variable.id === varId) : undefined;

  const handleOpen = (): void => {
    if (!triggerRef.current) return;
    openColorPicker({
color,
      onChange,
      anchorRect: triggerRef.current.getBoundingClientRect(),
      varId,
      onBindVariable,
    });
  };

  const alpha = parseAlpha(color);

  return (
    <div className="font-editorial">
      {label && (
        <span className="text-[12px] font-semibold text-[var(--s-text-muted)] block mb-1.5">
          {label}
        </span>
      )}
      <div
        ref={triggerRef}
        className="flex items-center gap-2 bg-[var(--s-bg-input)] rounded-lg p-1.5 px-2 cursor-pointer transition-all duration-100 hover:bg-[var(--s-bg-input-hover)]"
        onClick={handleOpen}
      >
        <div className="relative w-5 h-5 rounded-md shrink-0 border border-white/10 overflow-hidden">
          <div className={`absolute inset-0 ${CHECKERBOARD_CLASS}`} />
          <div className="absolute inset-0" style={{ background: color }} />
        </div>
        <span className="flex-1 text-[12px] text-[var(--s-text)] truncate flex items-center gap-1">
          {boundVar && <span className="w-1 h-1 rounded-full bg-[var(--s-accent)] shrink-0" />}
          {boundVar ? boundVar.name : colorLabel(color)}
        </span>
        {!boundVar && alpha < ALPHA_MAX && (
          <span className="text-[12px] text-[var(--s-text-subtle)]">{alpha}%</span>
        )}
      </div>
    </div>
  );
};
