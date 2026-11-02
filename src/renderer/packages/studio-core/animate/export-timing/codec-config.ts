interface H264Level {
  id: number;
  name: string;
  maxMacroblocksPerSecond: number;
  maxFrameSize: number;
}

const H264_LEVELS: H264Level[] = [
  { id: 0x1f, name: "3.1", maxMacroblocksPerSecond: 108000, maxFrameSize: 3600 },
  { id: 0x20, name: "3.2", maxMacroblocksPerSecond: 216000, maxFrameSize: 5120 },
  { id: 0x28, name: "4.0", maxMacroblocksPerSecond: 245760, maxFrameSize: 8192 },
  { id: 0x29, name: "4.1", maxMacroblocksPerSecond: 245760, maxFrameSize: 8192 },
  { id: 0x2a, name: "4.2", maxMacroblocksPerSecond: 522240, maxFrameSize: 8704 },
  { id: 0x32, name: "5.0", maxMacroblocksPerSecond: 589824, maxFrameSize: 22080 },
  { id: 0x33, name: "5.1", maxMacroblocksPerSecond: 983040, maxFrameSize: 36864 },
  { id: 0x34, name: "5.2", maxMacroblocksPerSecond: 2073600, maxFrameSize: 36864 },
];

const H264_HIGH_PROFILE_PREFIX = "avc1.6400";
const MACROBLOCK_SIZE = 16;

export type BitratePreset = "low" | "medium" | "high" | "ultra";

const BITS_PER_PIXEL_BY_PRESET: Record<BitratePreset, number> = {
  low: 0.05,
  medium: 0.1,
  high: 0.15,
  ultra: 0.25,
};

const MIN_BITRATE_BPS = 1_500_000;

function pickH264Level(width: number, height: number, fps: number): H264Level {
  const macroBlocksWide = Math.ceil(width / MACROBLOCK_SIZE);
  const macroBlocksTall = Math.ceil(height / MACROBLOCK_SIZE);
  const frameMacroBlocks = macroBlocksWide * macroBlocksTall;
  const macroBlocksPerSecond = frameMacroBlocks * fps;
  const fit = H264_LEVELS.find(
    (level) =>
      level.maxFrameSize >= frameMacroBlocks &&
      level.maxMacroblocksPerSecond >= macroBlocksPerSecond,
  );
  return fit ?? H264_LEVELS[H264_LEVELS.length - 1];
}

export function buildH264Codec(width: number, height: number, fps: number): string {
  const level = pickH264Level(width, height, fps);
  return `${H264_HIGH_PROFILE_PREFIX}${level.id.toString(16).toUpperCase().padStart(2, "0")}`;
}

export function describeH264Level(width: number, height: number, fps: number): string {
  return `H.264 High@${pickH264Level(width, height, fps).name}`;
}

export function defaultBitrateBps(
  width: number,
  height: number,
  fps: number,
  preset: BitratePreset,
): number {
  const bpp = BITS_PER_PIXEL_BY_PRESET[preset];
  const bps = Math.round(width * height * fps * bpp);
  return Math.max(MIN_BITRATE_BPS, bps);
}

export function estimateOutputBytes(
  bitrateBps: number,
  durationSeconds: number,
): number {
  const audioBitrateBps = 128_000;
  return Math.round(((bitrateBps + audioBitrateBps) * durationSeconds) / 8);
}

export function formatBitrateLabel(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  return `${Math.round(bps / 1000)} kbps`;
}

export function formatBytesLabel(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
}
