import type { Frame } from "../engine/frame";
import type { ParamValues } from "../engine/style-types";
import { numberParam, textParam } from "../engine/resolve-params";
import { FINISH_KEYS, type BackdropMode } from "./finish-params";
import { drawSoftCopy, softCopy } from "./soft-copy";

const PERCENT = 100;
const BACKDROP_BASE = "#000000";

const paintPhoto = (frame: Frame, photo: Frame, params: ParamValues, blurred: boolean): void => {
  const context = frame.context;
  context.fillStyle = BACKDROP_BASE;
  context.fillRect(0, 0, frame.width, frame.height);
  context.globalAlpha = numberParam(params, FINISH_KEYS.backdropOpacity) / PERCENT;
  const sigma = blurred ? numberParam(params, FINISH_KEYS.backdropBlur) : 0;
  if (sigma > 0) drawSoftCopy(context, softCopy(photo.canvas, photo.width, photo.height, sigma), frame.width, frame.height);
  else context.drawImage(photo.canvas, 0, 0, frame.width, frame.height);
  context.globalAlpha = 1;
};

export const paintBackdrop = (frame: Frame, photo: Frame, params: ParamValues): void => {
  const mode = textParam(params, FINISH_KEYS.backdrop) as BackdropMode;
  if (mode === "none") return;
  if (mode === "solid") {
    const context = frame.context;
    context.fillStyle = textParam(params, FINISH_KEYS.backdropColour);
    context.fillRect(0, 0, frame.width, frame.height);
    return;
  }
  paintPhoto(frame, photo, params, mode === "blur");
};
