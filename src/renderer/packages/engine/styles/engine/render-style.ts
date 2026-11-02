import { Frame, frameFromPixels } from "./frame";
import { seededRandom } from "./seeded-random";
import { resolveParams, numberParam, textParam } from "./resolve-params";
import { findStyle, styleParamSpecs } from "./style-registry";
import type { CellStyleDefinition, SourceImage } from "./style-definition";
import type { ParamValues, StyleSettings } from "./style-types";
import { paintBackdrop } from "../finish/backdrop";
import { applyGlow } from "../finish/glow";
import { FINISH_KEYS } from "../finish/finish-params";
import { CELL_SIZE_KEY } from "../modes/shared-params";
import { applyEffects } from "../postfx/effect-registry";

interface StyleRenderRequest {
  source: SourceImage;
  settings: StyleSettings;
  scale: number;
  seed: number;
}

const renderCells = (definition: CellStyleDefinition, frame: Frame, request: StyleRenderRequest, params: ParamValues): void => {
  const { source } = request;
  const photo = frameFromPixels(source.data, source.width, source.height);
  paintBackdrop(frame, photo, params);
  const layer = new Frame(source.width, source.height);
  definition.drawCells({ layer: layer.context, source, params, scale: request.scale, random: seededRandom(request.seed) });
  applyGlow(frame, layer, numberParam(params, FINISH_KEYS.glow), numberParam(params, CELL_SIZE_KEY));
  const context = frame.context;
  context.globalCompositeOperation = textParam(params, FINISH_KEYS.blend) as GlobalCompositeOperation;
  context.drawImage(layer.canvas, 0, 0);
  context.globalCompositeOperation = "source-over";
};

export const renderStyle = (request: StyleRenderRequest): Uint8ClampedArray => {
  const definition = findStyle(request.settings.styleId);
  const params = resolveParams(styleParamSpecs(definition), request.settings.params, request.scale);
  const frame = new Frame(request.source.width, request.source.height);
  if (definition.kind === "cells") renderCells(definition, frame, request, params);
  else definition.renderFrame({ frame, source: request.source, params, scale: request.scale, random: seededRandom(request.seed) });
  applyEffects(frame, request.settings.effects, request.scale, seededRandom(request.seed + 1));
  return frame.readPixels();
};
