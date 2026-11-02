import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { textParam } from "../../../engine/resolve-params";
import { buildLedPass } from "./led-grid";
import { drawHousings } from "./led-housing";
import { drawLitLeds } from "./led-lit";
import { LED_KEYS, LED_PARAMS } from "./led-params";

const renderLedMatrix = (input: FrameRenderInput): void => {
  const pass = buildLedPass(input);
  pass.context.fillStyle = textParam(input.params, LED_KEYS.background);
  pass.context.fillRect(0, 0, input.frame.width, input.frame.height);
  drawHousings(pass);
  drawLitLeds(pass, input.frame.width, input.frame.height);
};

export const LED_MATRIX_STYLE: FrameStyleDefinition = {
  id: "ledmatrix",
  label: "LED matrix",
  hint: "A glowing sign made of little lights",
  glyph: "⁘",
  category: "pixel",
  kind: "frame",
  params: LED_PARAMS,
  renderFrame: renderLedMatrix,
};
