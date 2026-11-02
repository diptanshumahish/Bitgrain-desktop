import React, { useEffect, useMemo, useRef } from "react";
import { useSignalValue } from "../../lib/signal";
import { themeSignal } from "../../store/global-theme-store";

interface HubAsciiBackgroundProps {
  opacity?: number;
}

const CELL_WIDTH = 12;
const CELL_HEIGHT = 18;
const FONT_SIZE = 11;
const DENSITY_CHARS = " .:-=+*#%@";
// Disciplined brand-palette: violet (primary), lime (highlight), emerald (status),
// amber (legacy patron accent). No sky/cyan/pink/coral/orange.
const ACCENT_PALETTE: string[] = [
  "183, 170, 255", // violet
  "217, 249, 157", // lime
  "94, 234, 212",  // emerald / teal
  "253, 224, 71",  // amber
];
const ACCENTS_PER_SESSION = 3;
const WAVE_COUNT = 4;
const PHASE_SPEED_MIN = 0.0035;
const PHASE_SPEED_RANGE = 0.0055;
const FREQ_MIN = 0.045;
const FREQ_RANGE = 0.12;
const DRIFT_MAGNITUDE_MIN = 0.09;
const DRIFT_MAGNITUDE_RANGE = 0.12;
const DRIFT_PHASE_MULTIPLIER = 1.2;
const DEFAULT_OPACITY = 0.22;
const FADE_RADIUS_FACTOR = 0.78;
const DENSITY_LOW = 0.18;
const DENSITY_MID = 0.5;
const DENSITY_HIGH = 0.78;
const BASE_RGB_DARK = "230, 230, 240";
const BASE_RGB_LIGHT = "40, 40, 55";
const LIGHT_OPACITY_BOOST = 1.6;

interface WaveLayer {
  angleCos: number;
  angleSin: number;
  frequency: number;
  phaseSpeed: number;
  phaseStart: number;
}

interface PatternSeed {
  waves: WaveLayer[];
  accents: string[];
  drift: { x: number; y: number };
  contrastBias: number;
}

const pickAccents = (count: number): string[] => {
  const pool = [...ACCENT_PALETTE];
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
};

const generatePatternSeed = (): PatternSeed => {
  const waves: WaveLayer[] = Array.from({ length: WAVE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    return {
      angleCos: Math.cos(angle),
      angleSin: Math.sin(angle),
      frequency: FREQ_MIN + Math.random() * FREQ_RANGE,
      phaseSpeed: (PHASE_SPEED_MIN + Math.random() * PHASE_SPEED_RANGE) *
        (Math.random() < 0.5 ? -1 : 1),
      phaseStart: Math.random() * Math.PI * 2,
    };
  });

  const driftAngle = Math.random() * Math.PI * 2;
  const driftMagnitude = DRIFT_MAGNITUDE_MIN + Math.random() * DRIFT_MAGNITUDE_RANGE;

  return {
    waves,
    accents: pickAccents(ACCENTS_PER_SESSION),
    drift: {
      x: Math.cos(driftAngle) * driftMagnitude,
      y: Math.sin(driftAngle) * driftMagnitude,
    },
    contrastBias: 0.7 + Math.random() * 0.35,
  };
};

const colorForDensity = (
  density: number,
  accents: string[],
  baseRgb: string,
): { rgb: string; boost: number } => {
  if (density >= DENSITY_HIGH) return { rgb: accents[2] ?? accents[0], boost: 1.9 };
  if (density >= DENSITY_MID) return { rgb: accents[1] ?? accents[0], boost: 1.4 };
  if (density >= DENSITY_LOW) return { rgb: accents[0], boost: 1.05 };
  return { rgb: baseRgb, boost: 0.7 };
};

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  seed: PatternSeed,
  frame: number,
  opacity: number,
  baseRgb: string,
): void => {
  ctx.clearRect(0, 0, width, height);
  ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

  const centerCol = cols / 2;
  const centerRow = rows / 2;
  const fadeRadius = Math.min(cols, rows) * FADE_RADIUS_FACTOR;
  const driftPhase = frame * DRIFT_PHASE_MULTIPLIER;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const dx = col - centerCol;
      const dy = row - centerRow;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const fade = 1 - Math.min(1, distance / fadeRadius);
      if (fade <= 0.02) continue;

      const driftedX = col + seed.drift.x * driftPhase;
      const driftedY = row + seed.drift.y * driftPhase;

      let sum = 0;
      for (let waveIdx = 0; waveIdx < seed.waves.length; waveIdx += 1) {
        const wave = seed.waves[waveIdx];
        const projected = driftedX * wave.angleCos + driftedY * wave.angleSin;
        sum += Math.sin(projected * wave.frequency + wave.phaseStart + frame * wave.phaseSpeed);
      }

      const normalized = (sum / seed.waves.length + 1) / 2;
      const density = Math.min(1, Math.max(0, Math.pow(normalized, seed.contrastBias)));
      if (density < 0.12) continue;

      const charIdx = Math.min(DENSITY_CHARS.length - 1, Math.floor(density * DENSITY_CHARS.length));
      const char = DENSITY_CHARS[charIdx];
      if (char === " ") continue;

      const { rgb, boost } = colorForDensity(density, seed.accents, baseRgb);
      const cellOpacity = fade * opacity * boost * density;

      ctx.fillStyle = `rgba(${rgb}, ${cellOpacity.toFixed(3)})`;
      ctx.fillText(char, col * CELL_WIDTH, row * CELL_HEIGHT);
    }
  }
};

export const HubAsciiBackground: React.FC<HubAsciiBackgroundProps> = ({
  opacity = DEFAULT_OPACITY,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seed = useMemo<PatternSeed>(() => generatePatternSeed(), []);
  const theme = useSignalValue(themeSignal);
  const isDark = theme === "dark";
  const baseRgb = isDark ? BASE_RGB_DARK : BASE_RGB_LIGHT;
  const drawOpacity = isDark ? opacity : opacity * LIGHT_OPACITY_BOOST;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    let cols = 0;
    let rows = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    let ctx: CanvasRenderingContext2D | null = null;

    const resize = (): void => {
      cssWidth = canvas.offsetWidth;
      cssHeight = canvas.offsetHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      const next = canvas.getContext("2d");
      if (!next) return;
      next.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx = next;
      cols = Math.ceil(cssWidth / CELL_WIDTH);
      rows = Math.ceil(cssHeight / CELL_HEIGHT);
    };

    resize();

    let frame = 0;
    let rafId = 0;

    const tick = (): void => {
      if (ctx) {
        drawFrame(ctx, cssWidth, cssHeight, cols, rows, seed, frame, drawOpacity, baseRgb);
      }
      frame += 1;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [seed, drawOpacity, baseRgb]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: isDark ? "plus-lighter" : "multiply" }}
    />
  );
};
