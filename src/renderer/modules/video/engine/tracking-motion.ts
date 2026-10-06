import type { TrackingClip } from "../types";

const SAMPLE_COLS = 40;
const MIN_SAMPLE_ROWS = 8;
const MOTION_THRESHOLD = 14;
const MATCH_RADIUS = 0.13;
const NMS_RADIUS = 0.09;
const TRACK_TTL = 0.5;
const POSITION_LERP = 0.4;
const MAX_DT = 0.25;
const BIG_TRACK_CHANCE = 0.25;

export interface MotionTrack {
  id: number;
  x: number;
  y: number;
  born: number;
  age: number;
  size: number;
  hasThumb: boolean;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Peak {
  x: number;
  y: number;
  strength: number;
}

class ClipTracker {
  private prev: Float32Array | null = null;
  private cols = 0;
  private rows = 0;
  private tracks: MotionTrack[] = [];
  private nextId = 1;
  private lastTime = -1;
  private canvas: OffscreenCanvas | null = null;

  private sampleLuma(source: CanvasImageSource, w: number, h: number): Float32Array | null {
    const cols = SAMPLE_COLS;
    const rows = Math.max(MIN_SAMPLE_ROWS, Math.round(cols * (h / Math.max(w, 1))));
    if (!this.canvas || this.cols !== cols || this.rows !== rows) {
      this.canvas = new OffscreenCanvas(cols, rows);
      this.cols = cols;
      this.rows = rows;
      this.prev = null;
    }
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < lum.length; i++) {
      const p = i * 4;
      lum[i] = data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722;
    }
    return lum;
  }

  private findPeaks(motion: Float32Array, limit: number): Peak[] {
    const candidates: { index: number; strength: number }[] = [];
    for (let i = 0; i < motion.length; i++) {
      if (motion[i] > MOTION_THRESHOLD) candidates.push({ index: i, strength: motion[i] });
    }
    candidates.sort((a, b) => b.strength - a.strength);
    const peaks: Peak[] = [];
    for (const candidate of candidates) {
      const cx = (candidate.index % this.cols) / this.cols + 0.5 / this.cols;
      const cy = Math.floor(candidate.index / this.cols) / this.rows + 0.5 / this.rows;
      if (peaks.some((p) => Math.hypot(p.x - cx, p.y - cy) < NMS_RADIUS)) continue;
      peaks.push({ x: cx, y: cy, strength: candidate.strength });
      if (peaks.length >= limit) break;
    }
    return peaks;
  }

  update(
    source: CanvasImageSource,
    w: number,
    h: number,
    time: number,
    clip: TrackingClip,
  ): MotionTrack[] {
    const dt = time - this.lastTime;
    this.lastTime = time;
    const lum = this.sampleLuma(source, w, h);
    if (!lum) return this.tracks;

    const limit = Math.max(1, Math.round(clip.nodeCount));
    const valid = this.prev !== null && dt > 0 && dt < MAX_DT;
    let peaks: Peak[] = [];
    if (valid && this.prev) {
      const motion = new Float32Array(lum.length);
      for (let i = 0; i < lum.length; i++) motion[i] = Math.abs(lum[i] - this.prev[i]);
      peaks = this.findPeaks(motion, limit);
    }
    this.prev = lum;
    const step = valid ? dt : 0;

    const used = new Set<number>();
    for (const track of this.tracks) {
      let best = -1;
      let bestDist = MATCH_RADIUS;
      for (let i = 0; i < peaks.length; i++) {
        if (used.has(i)) continue;
        const dist = Math.hypot(peaks[i].x - track.x, peaks[i].y - track.y);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      if (best >= 0) {
        used.add(best);
        track.x += (peaks[best].x - track.x) * POSITION_LERP;
        track.y += (peaks[best].y - track.y) * POSITION_LERP;
        track.age = 0;
      } else {
        track.age += step;
      }
    }

    for (let i = 0; i < peaks.length; i++) {
      if (used.has(i)) continue;
      if (this.tracks.length >= limit) break;
      const id = this.nextId++;
      const rand = mulberry32(((clip.seed || 1) ^ Math.imul(id, 2654435761)) >>> 0);
      const big = rand() < BIG_TRACK_CHANCE;
      this.tracks.push({
        id,
        x: peaks[i].x,
        y: peaks[i].y,
        born: time,
        age: 0,
        size: big ? 0.11 + rand() * 0.06 : 0.03 + rand() * 0.025,
        hasThumb: clip.showThumbnails && (big || rand() < 0.6),
      });
    }

    this.tracks = this.tracks.filter((track) => track.age <= TRACK_TTL);
    return this.tracks;
  }
}

export class TrackerStore {
  private byClip = new Map<string, ClipTracker>();

  update(
    clipId: string,
    source: CanvasImageSource,
    w: number,
    h: number,
    time: number,
    clip: TrackingClip,
  ): MotionTrack[] {
    let tracker = this.byClip.get(clipId);
    if (!tracker) {
      tracker = new ClipTracker();
      this.byClip.set(clipId, tracker);
    }
    return tracker.update(source, w, h, time, clip);
  }
}

export const TRACK_TTL_SECONDS = TRACK_TTL;
