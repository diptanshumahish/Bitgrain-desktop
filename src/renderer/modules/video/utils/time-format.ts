const PAD = (n: number, w = 2) => n.toString().padStart(w, "0");

export function formatTimecode(seconds: number, fps: number): string {
  const safe = Math.max(0, seconds);
  const totalFrames = Math.floor(safe * fps);
  const f = totalFrames % fps;
  const s = Math.floor(safe) % 60;
  const m = Math.floor(safe / 60) % 60;
  const h = Math.floor(safe / 3600);
  return `${PAD(h)}:${PAD(m)}:${PAD(s)}:${PAD(f)}`;
}

export function formatShortTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const s = Math.floor(safe) % 60;
  const m = Math.floor(safe / 60) % 60;
  const h = Math.floor(safe / 3600);
  if (h > 0) return `${h}:${PAD(m)}:${PAD(s)}`;
  return `${PAD(m)}:${PAD(s)}`;
}

export function frameAt(seconds: number, fps: number): number {
  return Math.floor(Math.max(0, seconds) * fps);
}

export function totalFrames(durationSec: number, fps: number): number {
  return Math.max(1, Math.ceil(durationSec * fps));
}
