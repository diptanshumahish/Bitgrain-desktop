import React, { useCallback } from "react";
import { AsciiCanvas, type AsciiRenderer } from "./ascii/AsciiCanvas";
import { DENSITY_CHARS, BOX_CHARS, baseRgb } from "./ascii/ascii-shared";

interface AsciiBackgroundProps {
  isDark?: boolean;
  opacity?: number;
}

const CELL_W = 11;
const CELL_H = 19;
const FONT_PX = 11;
const SPATIAL_SCALE = 0.12;
const TIME_SCALE = 0.008;
const MOUSE_RADIUS = 15;
const MOUSE_FORCE = 0.5;
const FADE_OFFSET = 2;
const FADE_SLOPE = 0.4;
const FADE_DIST_SCALE = 0.25;
const CONTOUR_LEVELS = 10;
const CONTOUR_THRESHOLD = 0.12;
const DENSE_THRESHOLD = 0.8;
const COLOR_TRIGGER_THRESHOLD = 0.85;

const ACCENTS_DARK = ["165, 180, 252", "251, 146, 60", "217, 249, 157", "52, 211, 153"];
const ACCENTS_LIGHT = ["99, 102, 241", "249, 115, 22", "163, 230, 53", "16, 185, 129"];

export const AsciiBackground: React.FC<AsciiBackgroundProps> = ({
  isDark = false,
  opacity,
}) => {
  const render = useCallback<AsciiRenderer>(
    ({ col, row, cols, rows, frame, mouseCol, mouseRow }) => {
      const cx = cols / 2;
      const cy = rows / 2;
      const time = frame * TIME_SCALE;

      const dx = mouseCol - col;
      const dy = mouseRow - row;
      const mouseDist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, (MOUSE_RADIUS - mouseDist) / MOUSE_RADIUS);

      let x = (col - cx) * SPATIAL_SCALE;
      let y = (row - cy) * SPATIAL_SCALE;
      x += (dx / mouseDist || 0) * force * MOUSE_FORCE;
      y += (dy / mouseDist || 0) * force * MOUSE_FORCE;

      const n1 = Math.sin(x + time) * Math.cos(y - time);
      const n2 = Math.sin(x * 0.5 - time * 0.7) * Math.sin(y * 0.8 + time * 0.5);
      const n3 = Math.sin((x + y) * 0.3 + time);
      const val = (n1 + n2 + n3 + 3) / 6;

      const distFromCenter = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2) * FADE_DIST_SCALE;
      const fade = Math.min(1, Math.max(0, (distFromCenter - FADE_OFFSET) * FADE_SLOPE));
      if (fade <= 0) return null;

      const fract = (val * CONTOUR_LEVELS) % 1;
      const isContour = fract < CONTOUR_THRESHOLD;
      const isDense = val > DENSE_THRESHOLD;
      if (!isContour && !isDense) return null;

      const baseAlpha = opacity ?? (isDark ? 0.12 : 0.22);
      let char = DENSITY_CHARS[Math.floor(val * (DENSITY_CHARS.length - 1))];
      if (isDense) char = BOX_CHARS[Math.floor(val * (BOX_CHARS.length - 1))];

      let rgb = baseRgb(isDark);
      const accents = isDark ? ACCENTS_DARK : ACCENTS_LIGHT;
      const colorTrigger = Math.sin(x * 0.2 + time) * Math.cos(y * 0.2 - time);
      if (colorTrigger > COLOR_TRIGGER_THRESHOLD) {
        rgb = accents[Math.floor((val * 10 + frame * 0.02) % accents.length)];
      }

      const alpha = fade * baseAlpha * (isContour ? 1 : 0.4);
      return { char, rgb, alpha };
    },
    [isDark, opacity],
  );

  return (
    <AsciiCanvas
      cellWidth={CELL_W}
      cellHeight={CELL_H}
      fontPx={FONT_PX}
      canvasClass="absolute inset-0 w-full h-full pointer-events-none"
      mixBlendMode={isDark ? "plus-lighter" : "multiply"}
      trackMouse
      render={render}
    />
  );
};
