import { watermarkCanvasForPlan } from "@bitgrain/platform/plans/gate/watermark-for-plan";

export const imageDataToPng = async (data: ImageData, plan: string): Promise<Uint8Array> => {
  const canvas = document.createElement("canvas");
  canvas.width = data.width;
  canvas.height = data.height;
  canvas.getContext("2d")?.putImageData(data, 0, 0);
  await watermarkCanvasForPlan(canvas, plan);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("This browser couldn't encode a print layer.");
  return new Uint8Array(await blob.arrayBuffer());
};
