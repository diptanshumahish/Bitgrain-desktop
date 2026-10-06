import type { TrackingClip, TrackingTrack, VideoProject } from "../types";
import { clipFadeAlpha } from "../utils/clip-fade";
import { TrackerStore, TRACK_TTL_SECONDS, type MotionTrack } from "./tracking-motion";

const POP_DURATION = 0.3;
const DRAW_DURATION = 0.4;
const BEZIER_STEPS = 40;
const DASH_SEGMENT = 6;
const DASH_SPEED = 26;
const ARROW_HEAD = 9;
const LABEL_FONT_RATIO = 0.016;
const RETICLE_ARM_RATIO = 0.36;

type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

interface Point {
  x: number;
  y: number;
}

function easeOutBack(t: number): number {
  const overshoot = 1.70158;
  const factor = overshoot + 1;
  return 1 + factor * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function hash01(value: number): number {
  let state = Math.imul(value ^ 0x9e3779b9, 2654435761) >>> 0;
  state ^= state >>> 15;
  return (state >>> 0) / 4294967296;
}

function bezierPath(a: MotionTrack, b: MotionTrack, w: number, h: number): Point[] {
  const ax = a.x * w;
  const ay = a.y * h;
  const bx = b.x * w;
  const by = b.y * h;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = (0.18 + hash01(a.id) * 0.42) * len * (a.id % 2 === 0 ? 1 : -1);
  const c1x = ax + dx * 0.25 + nx * bow;
  const c1y = ay + dy * 0.25 + ny * bow;
  const c2x = ax + dx * 0.75 + nx * bow;
  const c2y = ay + dy * 0.75 + ny * bow;
  const points: Point[] = [];
  for (let s = 0; s <= BEZIER_STEPS; s++) {
    const t = s / BEZIER_STEPS;
    const mt = 1 - t;
    const x = mt * mt * mt * ax + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * bx;
    const y = mt * mt * mt * ay + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * by;
    points.push({ x, y });
  }
  return points;
}

function drawArrow(
  ctx: AnyCtx,
  points: Point[],
  progress: number,
  dashOffset: number,
  color: string,
  width: number,
): void {
  const visible = Math.max(2, Math.floor(points.length * progress));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([DASH_SEGMENT, DASH_SEGMENT]);
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < visible; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
  ctx.setLineDash([]);

  if (progress > 0.98) {
    const tip = points[points.length - 1];
    const prev = points[points.length - 2];
    const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x - ARROW_HEAD * Math.cos(angle - 0.4), tip.y - ARROW_HEAD * Math.sin(angle - 0.4));
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x - ARROW_HEAD * Math.cos(angle + 0.4), tip.y - ARROW_HEAD * Math.sin(angle + 0.4));
    ctx.stroke();
  }
  ctx.restore();
}

function drawReticle(ctx: AnyCtx, cx: number, cy: number, box: number, color: string, width: number): void {
  const half = box / 2;
  const arm = half * RETICLE_ARM_RATIO;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  for (const [dx, dy] of corners) {
    const sx = Math.sign(dx);
    const sy = Math.sign(dy);
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx - sx * arm, cy + dy);
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx, cy + dy - sy * arm);
  }
  ctx.stroke();
  ctx.restore();
}

function drawThumb(
  ctx: AnyCtx,
  source: CanvasImageSource,
  cx: number,
  cy: number,
  box: number,
  zoom: number,
  w: number,
  h: number,
  color: string,
  width: number,
): void {
  const crop = Math.max(8, box / Math.max(1, zoom));
  const sx = Math.max(0, Math.min(w - crop, cx - crop / 2));
  const sy = Math.max(0, Math.min(h - crop, cy - crop / 2));
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - box / 2, cy - box / 2, box, box);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, sx, sy, crop, crop, cx - box / 2, cy - box / 2, box, box);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 0.6;
  ctx.globalAlpha = ctx.globalAlpha * 0.5;
  ctx.strokeRect(cx - box / 2, cy - box / 2, box, box);
  ctx.restore();
}

const LABEL_FONT = (px: number): string => `600 ${px}px ui-monospace, "SF Mono", monospace`;
const LABEL_CHIP_PAD = 4;
const LABEL_CHIP_FILL = "rgba(0,0,0,0.55)";

function drawLabel(
  ctx: AnyCtx,
  text: string,
  x: number,
  y: number,
  fontPx: number,
  alpha: number,
  clip: TrackingClip,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = LABEL_FONT(fontPx);
  ctx.textBaseline = "alphabetic";
  if (clip.labelBackground) {
    const metrics = ctx.measureText(text);
    ctx.fillStyle = LABEL_CHIP_FILL;
    ctx.fillRect(
      x - LABEL_CHIP_PAD,
      y - fontPx - LABEL_CHIP_PAD * 0.5,
      metrics.width + LABEL_CHIP_PAD * 2,
      fontPx + LABEL_CHIP_PAD,
    );
  }
  ctx.fillStyle = clip.labelColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function activeTrackingClipsAt(project: VideoProject, time: number): TrackingClip[] {
  const result: TrackingClip[] = [];
  const tracks = project.tracks.filter(
    (t): t is TrackingTrack => t.kind === "tracking" && t.visible,
  );
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        result.push(clip);
      }
    }
  }
  return result;
}

interface PaintTrackingOpts {
  clip: TrackingClip;
  ctx: AnyCtx;
  source: CanvasImageSource | null;
  tracker: TrackerStore;
  canvasWidth: number;
  canvasHeight: number;
  clipLocalTime: number;
}

export function paintTracking(opts: PaintTrackingOpts): void {
  const { clip, ctx, source, tracker, canvasWidth: w, canvasHeight: h, clipLocalTime: t } = opts;
  const alpha = clipFadeAlpha(clip.duration, t, clip.fadeIn, clip.fadeOut);
  if (alpha <= 0 || !source) return;

  const tracks = tracker.update(clip.id, source, w, h, t, clip);
  if (tracks.length === 0) return;

  const minDim = Math.min(w, h);
  const width = Math.max(0.5, clip.strokeWidth);
  const dashOffset = -(t * clip.speed * DASH_SPEED);
  const fontPx = Math.max(9, Math.round(minDim * LABEL_FONT_RATIO * (clip.labelScale ?? 1)));
  const markerScale = clip.markerScale ?? 1;

  const liveness = (track: MotionTrack): number => {
    const appear = clamp01((t - track.born) / POP_DURATION * 1.4);
    const death = clamp01(1 - track.age / TRACK_TTL_SECONDS);
    return appear * death;
  };

  ctx.save();
  ctx.lineJoin = "round";

  if (clip.showArrows) {
    for (let i = 0; i < tracks.length - 1; i++) {
      const a = tracks[i];
      const b = tracks[i + 1];
      const live = Math.min(liveness(a), liveness(b));
      if (live <= 0.01) continue;
      const progress = clamp01((t - Math.max(a.born, b.born)) / DRAW_DURATION);
      ctx.globalAlpha = alpha * live;
      drawArrow(ctx, bezierPath(a, b, w, h), progress, dashOffset, clip.lineColor, width);
    }
  }

  for (const track of tracks) {
    const live = liveness(track);
    if (live <= 0.01) continue;
    const pop = clamp01((t - track.born) / POP_DURATION);
    const scale = easeOutBack(pop);
    const cx = track.x * w;
    const cy = track.y * h;
    const box = track.size * minDim * scale * markerScale;

    ctx.globalAlpha = alpha * live;
    if (track.hasThumb) {
      drawThumb(ctx, source, cx, cy, box, clip.thumbZoom, w, h, clip.lineColor, width);
    }
    drawReticle(ctx, cx, cy, box, clip.lineColor, width);

    if (clip.showCoordinates && pop > 0.5) {
      const labelAlpha = alpha * live * clamp01((pop - 0.5) / 0.5);
      const label = `x: ${Math.round(track.x * w)}  y: ${Math.round(track.y * h)}`;
      drawLabel(ctx, label, cx - box / 2, cy - box / 2 - fontPx * 0.6, fontPx, labelAlpha, clip);
    }
  }

  ctx.restore();
}
