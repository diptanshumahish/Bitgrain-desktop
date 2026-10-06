import { clampCanvasToPlan } from "./clamp-canvas-to-plan";
import { watermarkCanvasForPlan } from "./watermark-for-plan";

export async function gateCanvasForPlan(source: HTMLCanvasElement, plan: string): Promise<HTMLCanvasElement> {
  const clamped = clampCanvasToPlan(source, plan);
  const output = clamped === source ? copyCanvas(source) : clamped;
  await watermarkCanvasForPlan(output, plan);
  return output;
}

function copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext("2d")?.drawImage(source, 0, 0);
  return copy;
}
