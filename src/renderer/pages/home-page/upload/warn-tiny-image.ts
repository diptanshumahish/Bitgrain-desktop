import { emitStatusToast } from "../../../components/portal/status-toast/status-toast-events";

const TINY_IMAGE_LONG_EDGE = 800;

export const warnIfTinyImage = (width: number, height: number): void => {
  const longEdge = Math.max(width, height);
  if (longEdge <= 0 || longEdge >= TINY_IMAGE_LONG_EDGE) return;
  emitStatusToast({
    title: `This photo is small, ${width} × ${height} px`,
    detail: "Effects will look coarse. A photo at least 800 px wide works best.",
  });
};
