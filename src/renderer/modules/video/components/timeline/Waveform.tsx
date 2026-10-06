import React, { useMemo } from "react";

interface WaveformProps {
  peaks: number[];
  inPoint: number;
  duration: number;
  assetDuration: number;
  width: number;
  height: number;
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  peaks,
  inPoint,
  duration,
  assetDuration,
  width,
  height,
  color = "rgba(255,255,255,0.55)",
}) => {
  const path = useMemo(() => {
    if (peaks.length === 0 || width <= 0 || height <= 0) return "";
    const peaksPerSec = peaks.length / Math.max(0.001, assetDuration);
    const startIdx = Math.max(0, Math.floor(inPoint * peaksPerSec));
    const endIdx = Math.min(
      peaks.length,
      Math.ceil((inPoint + duration) * peaksPerSec),
    );
    const slice = peaks.slice(startIdx, endIdx);
    if (slice.length === 0) return "";

    const cols = Math.min(slice.length, Math.max(2, Math.floor(width)));
    const half = height / 2;
    const stride = slice.length / cols;
    let d = "";
    for (let i = 0; i < cols; i++) {
      const start = Math.floor(i * stride);
      const end = Math.min(slice.length, Math.floor((i + 1) * stride));
      let max = 0;
      for (let j = start; j < end; j++) {
        const v = slice[j];
        if (v > max) max = v;
      }
      const x = (i / cols) * width;
      const h = max * half;
      d += `M${x.toFixed(1)} ${(half - h).toFixed(1)} L${x.toFixed(1)} ${(half + h).toFixed(1)} `;
    }
    return d.trim();
  }, [peaks, inPoint, duration, assetDuration, width, height]);

  if (!path) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="absolute inset-0 pointer-events-none"
    >
      <path d={path} stroke={color} strokeWidth={1} fill="none" />
    </svg>
  );
};
