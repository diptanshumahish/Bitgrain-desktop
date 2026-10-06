import React, { useState, useRef, useEffect, useCallback } from "react";
import { hexToHsv, hsvToHex, isValidHex } from "./colorUtils";
import { Pipette } from "lucide-react";

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

const HEX6_LENGTH = 7;
const HEX8_LENGTH = 9;
const ALPHA_MAX = 100;
const BYTE_MAX = 255;

const get6 = (color: string): string => {
  const clean = color.startsWith("#") ? color : `#${color}`;
  return clean.length >= HEX6_LENGTH ? clean.slice(0, HEX6_LENGTH) : clean;
};

const parseAlpha = (color: string): number => {
  const clean = color.startsWith("#") ? color : `#${color}`;
  if (clean.length === HEX8_LENGTH) {
    const alphaByte = parseInt(clean.slice(HEX6_LENGTH, HEX8_LENGTH), 16);
    return Math.round((alphaByte / BYTE_MAX) * ALPHA_MAX);
  }
  return ALPHA_MAX;
};

const withAlpha = (hex6: string, alpha: number): string => {
  if (alpha >= ALPHA_MAX) return hex6;
  const alphaByte = Math.round((alpha / ALPHA_MAX) * BYTE_MAX);
  return hex6 + alphaByte.toString(16).padStart(2, "0");
};

const SvPicker: React.FC<{
  hue: number;
  sat: number;
  val: number;
  onChange: (s: number, v: number) => void;
}> = ({ hue, sat, val, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const val = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      onChange(sat, val);
    },
    [onChange],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragging.current) pick(e);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pick]);

  return (
    <div
      ref={ref}
      className="relative w-full h-[110px] rounded-md cursor-crosshair overflow-hidden shrink-0"
      style={{ background: `hsl(${hue}, 100%, 50%)` }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        pick(e);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div
        className="absolute w-4 h-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }}
      />
    </div>
  );
};

const HueSlider: React.FC<{ hue: number; onChange: (h: number) => void }> = ({
  hue,
  onChange,
}) => (
  <div className="relative h-3.5 mt-1">
    <div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full"
      style={{
        background:
          "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
      }}
    />
    <div
      className="absolute top-1/2 w-4 h-4 bg-white border-2 border-white rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left: `${(hue / 360) * 100}%` }}
    />
    <input
      type="range"
      min={0}
      max={360}
      step={1}
      value={hue}
      onChange={(e) => onChange(Number(e.target.value))}
      className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer z-20"
    />
  </div>
);

const AlphaSlider: React.FC<{
  alpha: number;
  hex6: string;
  onChange: (a: number) => void;
}> = ({ alpha, hex6, onChange }) => (
  <div className="relative h-3.5 mt-1">
    {/* Track */}
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden">
      {/* Checkerboard */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#666 25%,transparent 25%)," +
            "linear-gradient(-45deg,#666 25%,transparent 25%)," +
            "linear-gradient(45deg,transparent 75%,#666 75%)," +
            "linear-gradient(-45deg,transparent 75%,#666 75%)",
          backgroundSize: "6px 6px",
          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
        }}
      />
      {/* Alpha gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, transparent, ${hex6})`,
        }}
      />
    </div>
    {/* Thumb */}
    <div
      className="absolute top-1/2 w-4 h-4 bg-white border-2 border-white rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left: `${alpha}%` }}
    />
    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={alpha}
      onChange={(e) => onChange(Number(e.target.value))}
      className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer z-20"
    />
  </div>
);

import { emitPopover } from "../../../lib/event-bus";
import { useActiveKit } from "../../../store/design-kits-store";

export const ColorPickerContent: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  varId,
  onBindVariable,
}) => {
  const kit = useActiveKit();
  const [lastColor, setLastColor] = useState(color);
  const initialHex = get6(color);
  const [initialH, initialS, initialV] = hexToHsv(initialHex);
  const [hexInput, setHexInput] = useState(initialHex);
  const [hue, setHue] = useState(initialH);
  const [sat, setSat] = useState(initialS);
  const [val, setVal] = useState(initialV);
  const [alpha, setAlpha] = useState(parseAlpha(color));

  if (lastColor !== color) {
    const hex6 = get6(color);
    const [h, s, v] = hexToHsv(hex6);
    setLastColor(color);
    setHue(h);
    setSat(s);
    setVal(v);
    setHexInput(hex6);
    setAlpha(parseAlpha(color));
  }

  const update = (h: number, s: number, v: number, a: number) => {
    const hex6 = hsvToHex(h, s, v);
    setHue(h);
    setSat(s);
    setVal(v);
    setAlpha(a);
    setHexInput(hex6);
    onChange(withAlpha(hex6, a));
  };

  const handleHexInput = (raw: string) => {
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    setHexInput(raw);
    const hex6 = normalized.slice(0, 7);
    if (isValidHex(hex6)) {
      const [h, s, v] = hexToHsv(hex6);
      setHue(h);
      setSat(s);
      setVal(v);
      const nextAlpha = normalized.length === HEX8_LENGTH ? parseAlpha(normalized) : alpha;
      setAlpha(nextAlpha);
      onChange(withAlpha(hex6, nextAlpha));
    }
  };

  const hex6 = hsvToHex(hue, sat, val);

  return (
    <div className="flex flex-col gap-2 font-editorial">
      <SvPicker
        hue={hue}
        sat={sat}
        val={val}
        onChange={(s, v) => update(hue, s, v, alpha)}
      />

      <div className="px-1 flex flex-col gap-2.5">
        <HueSlider hue={hue} onChange={(h) => update(h, sat, val, alpha)} />

        {/* Alpha slider */}
        <AlphaSlider
          alpha={alpha}
          hex6={hex6}
          onChange={(a) => update(hue, sat, val, a)}
        />

        {/* Inputs row */}
        <div className="flex items-center gap-1.5">
          {/* HEX */}
          <div className="flex-1 border border-[var(--s-border)] rounded-sm flex items-center gap-2 py-1 px-2">
            <span className="text-[8px]   text-[var(--s-text-subtle)] font-bold">
              HEX
            </span>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              className="w-full bg-transparent border-none text-[10.5px]   text-[var(--s-text)] outline-none font-medium"
              maxLength={9}
            />
          </div>
          {/* Alpha % */}
          <div className="border border-[var(--s-border)] rounded-sm flex items-center gap-1 py-1 px-2 w-[54px] shrink-0">
            <input
              type="number"
              min={0}
              max={100}
              value={alpha}
              onChange={(e) => {
                const a = Math.max(0, Math.min(100, Number(e.target.value)));
                update(hue, sat, val, a);
              }}
              className="w-full bg-transparent border-none text-[10.5px]   text-[var(--s-text)] outline-none font-medium text-right"
            />
            <span className="text-[8px]   text-[var(--s-text-subtle)] font-bold shrink-0">
              %
            </span>
          </div>
        </div>

        {"EyeDropper" in window && (
          <button
            onClick={async () => {
              try {
                // @ts-expect-error EyeDropper is not in lib.dom yet
                const ed = new EyeDropper();
                const result = await ed.open();
                handleHexInput(result.sRGBHex);
              } catch {
                /* ignore */
              }
            }}
            className="flex text-[10px] gap-2   items-center justify-center rounded-md border-none bg-transparent px-1 text-(--s-text-subtle) cursor-pointer hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] shrink-0 py-0.5"
          >
            <Pipette size={11} /> Pick color
          </button>
        )}
      </div>

      {kit && kit.colors.length > 0 && (
        <div className="flex flex-col gap-1 pt-2 border-t border-[var(--s-border)]">
          <span className="text-[8px] font-bold text-[var(--s-text-subtle)]">{kit.name}</span>
          <div className="flex gap-1 flex-wrap">
            {kit.colors.map((variable) => (
              <button
                key={variable.id}
                onClick={() =>
                  onBindVariable
                    ? onBindVariable(variable.id, variable.value)
                    : onChange(variable.value)
                }
                title={variable.name}
                className={`w-3.5 h-3.5 rounded-sm shrink-0 cursor-pointer border transition-all duration-100 hover:scale-110 active:scale-95 ${
                  (varId ? varId === variable.id : get6(color) === get6(variable.value))
                    ? "border-2 border-[var(--s-accent)]"
                    : "border-[var(--s-border)]"
                }`}
                style={{ background: variable.value }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 flex-wrap pt-2 border-t border-[var(--s-border)]">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              onChange(withAlpha(preset, alpha));
            }}
            className={`w-3.5 h-3.5 rounded-sm shrink-0 cursor-pointer border transition-all duration-100 hover:scale-110 active:scale-95 ${
              get6(color) === preset
                ? "border-2 border-[var(--s-accent)]"
                : "border-[var(--s-border)]"
            }`}
            style={{ background: preset }}
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
  const ref = useRef<HTMLDivElement>(null);
  const kit = useActiveKit();
  const boundVar = varId ? kit?.colors.find((variable) => variable.id === varId) : undefined;

  const handleOpen = () => {
    if (!ref.current) return;
    emitPopover({
      type: "color-picker",
      color,
      onChange,
      anchorRect: ref.current.getBoundingClientRect(),
      varId,
      onBindVariable,
    });
  };

  const alpha = parseAlpha(color);

  return (
    <div className="font-editorial">
      {label && (
        <span className="text-[9px] font-semibold text-[var(--s-text-muted)] block mb-1.5">
          {label}
        </span>
      )}
      <div
        ref={ref}
        className="flex items-center gap-2 bg-[var(--s-bg-input)] rounded-lg p-1.5 px-2 cursor-pointer transition-all duration-100 hover:bg-[var(--s-bg-input-hover)]"
        onClick={handleOpen}
      >
        {/* Swatch with checkerboard for transparency */}
        <div className="relative w-5 h-5 rounded-md shrink-0 border border-white/10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#888 25%,transparent 25%)," +
                "linear-gradient(-45deg,#888 25%,transparent 25%)," +
                "linear-gradient(45deg,transparent 75%,#888 75%)," +
                "linear-gradient(-45deg,transparent 75%,#888 75%)",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
            }}
          />
          <div className="absolute inset-0" style={{ background: color }} />
        </div>
        <span className="flex-1 text-[11.5px] text-[var(--s-text)] truncate flex items-center gap-1">
          {boundVar && <span className="w-1 h-1 rounded-full bg-[var(--s-accent)] shrink-0" />}
          {boundVar ? boundVar.name : get6(color).replace("#", "")}
        </span>
        {!boundVar && alpha < 100 && (
          <span className="text-[10px]   text-[var(--s-text-subtle)]">
            {alpha}%
          </span>
        )}
      </div>
    </div>
  );
};
