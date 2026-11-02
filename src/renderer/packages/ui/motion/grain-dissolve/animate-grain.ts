import { clamp } from "../shared/math";
import { createFrameLoop } from "../shared/frame-loop";
import type { GrainParticle } from "./sample-element-grain";

const DURATION_MS = 1150;
const PARTICLE_LIFE = 0.5;
const TRAVEL_PX = 60;
const WOBBLE_PX = 4;
const WOBBLE_SPEED = 8;
const GRAIN_SIZE = 2;
const MARGIN_RIGHT = 140;
const MARGIN_TOP = 80;
const OVERLAY_CLASS = "fixed pointer-events-none z-[9999]";

const createOverlay = (rect: DOMRect): CanvasRenderingContext2D | null => {
  const ratio = window.devicePixelRatio || 1;
  const overlay = document.createElement("canvas");
  overlay.className = OVERLAY_CLASS;
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top - MARGIN_TOP}px`;
  overlay.style.width = `${rect.width + MARGIN_RIGHT}px`;
  overlay.style.height = `${rect.height + MARGIN_TOP}px`;
  overlay.width = Math.round((rect.width + MARGIN_RIGHT) * ratio);
  overlay.height = Math.round((rect.height + MARGIN_TOP) * ratio);
  document.body.appendChild(overlay);
  const context = overlay.getContext("2d");
  context?.setTransform(ratio, 0, 0, ratio, 0, MARGIN_TOP * ratio);
  return context;
};

const drawParticle = (context: CanvasRenderingContext2D, particle: GrainParticle, local: number): void => {
  const travel = local * local * TRAVEL_PX;
  context.globalAlpha = 1 - local;
  context.fillStyle = particle.color;
  context.fillRect(
    particle.x + particle.driftX * travel,
    particle.y + particle.driftY * travel + Math.sin(particle.wobble + local * WOBBLE_SPEED) * local * WOBBLE_PX,
    GRAIN_SIZE,
    GRAIN_SIZE,
  );
};

export const animateGrain = (rect: DOMRect, particles: GrainParticle[]): void => {
  const context = createOverlay(rect);
  if (!context) return;
  const startTime = performance.now();
  const loop = createFrameLoop((now) => {
    const progress = (now - startTime) / DURATION_MS;
    context.clearRect(0, -MARGIN_TOP, context.canvas.width, context.canvas.height);
    particles.forEach((particle) => {
      const local = clamp((progress - particle.delay) / PARTICLE_LIFE, 0, 1);
      if (local < 1) drawParticle(context, particle, local);
    });
    if (progress < 1 + PARTICLE_LIFE) return true;
    context.canvas.remove();
    return false;
  });
  loop.start();
};
