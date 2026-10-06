import type { TextClip } from "../types";
import { ensureFontLoaded } from "../utils/font-loader";
import { clipFadeAlpha } from "../utils/clip-fade";
import { applyTextShadow } from "./paint/text-shadow";

const ENTRY_WINDOW_MAX_SECONDS = 0.4;
const ENTRY_WINDOW_RATIO = 0.25;
const FADE_WINDOW_MAX_SECONDS = 0.5;
const TYPEWRITER_DURATION_RATIO = 0.6;
const SLIDE_DISTANCE_RATIO = 0.5;
const SCALE_IN_START = 0.4;
const BLUR_IN_MAX_PX = 12;
const BOUNCE_FREQUENCY = 6;
const BOUNCE_DECAY = 0.35;
const PHYSICS_WINDOW_MAX_SECONDS = 0.8;
const PHYSICS_WINDOW_RATIO = 0.45;
const EXIT_WINDOW_MAX_SECONDS = 0.5;
const EXIT_WINDOW_RATIO = 0.25;
const GRAVITY_DROP_RATIO = 1.4;
const ELASTIC_SQUASH = 0.5;
const SWING_MAX_ANGLE_RAD = -0.45;
const WHOOSH_DISTANCE_RATIO = 3;
const WHOOSH_BLUR_PX = 16;
const JUMP_OUT_SLIDE_RATIO = 5;

interface PaintTextOpts {
  clip: TextClip;
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  clipLocalTime: number;
  pixelScale?: number;
}

interface AnimationState {
  alpha: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  dx: number;
  dy: number;
  blurPx: number;
  text: string;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function easeOutBack(t: number): number {
  const overshoot = 1.70158;
  const factor = overshoot + 1;
  return 1 + factor * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

function easeOutElastic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const period = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * period) + 1;
}

function easeOutBounce(t: number): number {
  const scale = 7.5625;
  const divisor = 2.75;
  if (t < 1 / divisor) return scale * t * t;
  if (t < 2 / divisor) {
    const shifted = t - 1.5 / divisor;
    return scale * shifted * shifted + 0.75;
  }
  if (t < 2.5 / divisor) {
    const shifted = t - 2.25 / divisor;
    return scale * shifted * shifted + 0.9375;
  }
  const shifted = t - 2.625 / divisor;
  return scale * shifted * shifted + 0.984375;
}

function entryProgress(clipDuration: number, t: number): number {
  const window = Math.min(ENTRY_WINDOW_MAX_SECONDS, clipDuration * ENTRY_WINDOW_RATIO);
  if (window <= 0) return 1;
  return Math.min(1, t / window);
}

function physicsProgress(clipDuration: number, t: number): number {
  const window = Math.min(PHYSICS_WINDOW_MAX_SECONDS, clipDuration * PHYSICS_WINDOW_RATIO);
  if (window <= 0) return 1;
  return Math.min(1, t / window);
}

function exitProgress(clipDuration: number, t: number): number {
  const window = Math.min(EXIT_WINDOW_MAX_SECONDS, clipDuration * EXIT_WINDOW_RATIO);
  if (window <= 0) return 0;
  const start = clipDuration - window;
  if (t <= start) return 0;
  return Math.min(1, (t - start) / window);
}

function fadeAlpha(clipDuration: number, t: number): number {
  const window = Math.min(FADE_WINDOW_MAX_SECONDS, clipDuration * ENTRY_WINDOW_RATIO);
  if (window <= 0) return 1;
  if (t < window) return t / window;
  if (t > clipDuration - window) {
    return Math.max(0, (clipDuration - t) / window);
  }
  return 1;
}

function buildAnimationState(clip: TextClip, t: number, fontSize: number): AnimationState {
  const state: AnimationState = {
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    dx: 0,
    dy: 0,
    blurPx: 0,
    text: clip.text,
  };

  switch (clip.animation) {
    case "fade":
      state.alpha = fadeAlpha(clip.duration, t);
      break;
    case "typewriter": {
      const ratio = Math.min(1, t / Math.max(0.001, clip.duration * TYPEWRITER_DURATION_RATIO));
      state.text = clip.text.slice(0, Math.floor(clip.text.length * ratio));
      break;
    }
    case "slide-up": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.dy = fontSize * SLIDE_DISTANCE_RATIO * (1 - eased);
      state.alpha = eased;
      break;
    }
    case "slide-down": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.dy = -fontSize * SLIDE_DISTANCE_RATIO * (1 - eased);
      state.alpha = eased;
      break;
    }
    case "slide-left": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.dx = fontSize * SLIDE_DISTANCE_RATIO * 2 * (1 - eased);
      state.alpha = eased;
      break;
    }
    case "slide-right": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.dx = -fontSize * SLIDE_DISTANCE_RATIO * 2 * (1 - eased);
      state.alpha = eased;
      break;
    }
    case "scale-in": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      const scale = SCALE_IN_START + (1 - SCALE_IN_START) * eased;
      state.scaleX = scale;
      state.scaleY = scale;
      state.alpha = eased;
      break;
    }
    case "blur-in": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.blurPx = BLUR_IN_MAX_PX * (1 - eased);
      state.alpha = eased;
      break;
    }
    case "bounce": {
      const p = entryProgress(clip.duration, t);
      const oscillation = Math.sin(p * BOUNCE_FREQUENCY * Math.PI) * Math.exp(-p / BOUNCE_DECAY);
      state.dy = -fontSize * SLIDE_DISTANCE_RATIO * oscillation * (1 - p);
      state.alpha = Math.min(1, p * 2);
      break;
    }
    case "pop": {
      const p = physicsProgress(clip.duration, t);
      const scale = easeOutBack(p);
      state.scaleX = scale;
      state.scaleY = scale;
      state.alpha = Math.min(1, p * 3);
      break;
    }
    case "gravity": {
      const p = physicsProgress(clip.duration, t);
      const landed = easeOutBounce(p);
      state.dy = -fontSize * GRAVITY_DROP_RATIO * (1 - landed);
      state.alpha = Math.min(1, p * 4);
      break;
    }
    case "elastic": {
      const p = physicsProgress(clip.duration, t);
      const eased = easeOutElastic(p);
      state.scaleY = eased;
      state.scaleX = 1 + (1 - eased) * ELASTIC_SQUASH;
      state.alpha = Math.min(1, p * 4);
      break;
    }
    case "swing-in": {
      const p = physicsProgress(clip.duration, t);
      const eased = easeOutBack(p);
      state.rotation = (1 - eased) * SWING_MAX_ANGLE_RAD;
      state.alpha = Math.min(1, p * 3);
      break;
    }
    case "whoosh": {
      const p = entryProgress(clip.duration, t);
      const eased = easeOut(p);
      state.dx = -fontSize * WHOOSH_DISTANCE_RATIO * (1 - eased);
      state.blurPx = WHOOSH_BLUR_PX * (1 - eased);
      state.alpha = Math.min(1, p * 2);
      break;
    }
    case "jump-out": {
      const pIn = physicsProgress(clip.duration, t);
      const scale = easeOutBack(pIn);
      state.scaleX = scale;
      state.scaleY = scale;
      state.alpha = Math.min(1, pIn * 3);
      const pOut = exitProgress(clip.duration, t);
      if (pOut > 0) {
        state.scaleX = 1;
        state.scaleY = 1;
        state.dx = fontSize * JUMP_OUT_SLIDE_RATIO * easeInCubic(pOut);
        state.alpha = 1 - pOut;
      }
      break;
    }
    default:
      break;
  }
  return state;
}

export function paintText(opts: PaintTextOpts): void {
  const { clip, ctx, canvasWidth, canvasHeight, clipLocalTime } = opts;
  const pixelScale = opts.pixelScale ?? 1;
  const animation = buildAnimationState(clip, clipLocalTime, clip.size);
  const edgeFade = clipFadeAlpha(clip.duration, clipLocalTime, clip.fadeIn, clip.fadeOut);
  const finalAlpha = animation.alpha * edgeFade;
  if (!animation.text || finalAlpha <= 0) return;

  ensureFontLoaded(clip.weight, clip.font);

  ctx.save();
  ctx.filter = "none";
  ctx.globalAlpha = finalAlpha;
  ctx.fillStyle = clip.color;
  ctx.font = `${clip.weight} ${clip.size}px ${clip.font}`;
  ctx.textAlign = clip.align;
  ctx.textBaseline = "middle";
  applyTextShadow(ctx, clip, pixelScale);
  if (animation.blurPx > 0) {
    ctx.filter = `blur(${(animation.blurPx * pixelScale).toFixed(1)}px)`;
  }

  const baseX = clip.position.x * canvasWidth + animation.dx;
  const baseY = clip.position.y * canvasHeight + animation.dy;

  ctx.translate(baseX, baseY);
  if (animation.rotation !== 0) {
    ctx.rotate(animation.rotation);
  }
  if (animation.scaleX !== 1 || animation.scaleY !== 1) {
    ctx.scale(animation.scaleX, animation.scaleY);
  }

  if (clip.stroke && clip.stroke.width > 0) {
    ctx.lineJoin = "round";
    ctx.lineWidth = clip.stroke.width * 2;
    ctx.strokeStyle = clip.stroke.color;
    ctx.strokeText(animation.text, 0, 0);
    ctx.shadowColor = "transparent";
  }
  ctx.fillText(animation.text, 0, 0);
  ctx.restore();
}
