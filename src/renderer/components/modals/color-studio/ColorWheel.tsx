import React from "react";
import { hexToHsl } from "../../../utils/color-theory";

interface ColorWheelProps {
  colors: string[];
  base: string | null;
  size?: number;
}

const HUE_RING =
  "conic-gradient(" +
  Array.from({ length: 13 }, (_, i) => `hsl(${i * 30}, 100%, 50%)`).join(", ") +
  ")";

export const ColorWheel: React.FC<ColorWheelProps> = ({ colors, base, size = 200 }) => {
  const r = size / 2;
  const outer = r - 3;
  const thickness = size * 0.21;
  const inner = outer - thickness;

  const dot = (hex: string, key: string, big: boolean): React.ReactNode => {
    const [h, s] = hexToHsl(hex);
    const theta = (h * Math.PI) / 180;
    // hue -> angle, saturation -> position within the ring band
    const dist = inner + 5 + s * (thickness - 11);
    const x = r + Math.sin(theta) * dist;
    const y = r - Math.cos(theta) * dist;
    const d = big ? 18 : 12;
    return (
      <span
        key={key}
        className="absolute rounded-full border-2 border-white dark:border-[#101014]"
        style={{
          left: x - d / 2,
          top: y - d / 2,
          width: d,
          height: d,
          background: hex,
          boxShadow: big ? "0 0 0 2px var(--s-accent)" : "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    );
  };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background: HUE_RING }} />
      <div
        className="absolute rounded-full bg-[var(--s-bg-panel)] border border-black/10 dark:border-white/10"
        style={{ left: r - inner, top: r - inner, width: inner * 2, height: inner * 2 }}
      />
      <div className="absolute inset-0 rounded-full border border-black/15 dark:border-white/15" />
      {colors.filter((c) => c !== base).map((c, i) => dot(c, `c${i}`, false))}
      {base && dot(base, "base", true)}
    </div>
  );
};
