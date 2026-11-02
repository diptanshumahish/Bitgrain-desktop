export type OrientAction = "rotate-left" | "rotate-right" | "flip-horizontal" | "flip-vertical";

const QUARTER_TURN = Math.PI / 2;

const applyOrientTransform = (context: CanvasRenderingContext2D, action: OrientAction): void => {
  if (action === "rotate-left") context.rotate(-QUARTER_TURN);
  else if (action === "rotate-right") context.rotate(QUARTER_TURN);
  else if (action === "flip-horizontal") context.scale(-1, 1);
  else context.scale(1, -1);
};

export const orientImage = (source: HTMLImageElement, action: OrientAction): HTMLCanvasElement => {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  const swapsSides = action === "rotate-left" || action === "rotate-right";
  const canvas = document.createElement("canvas");
  canvas.width = swapsSides ? height : width;
  canvas.height = swapsSides ? width : height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the photo for rotating");
  context.translate(canvas.width / 2, canvas.height / 2);
  applyOrientTransform(context, action);
  context.drawImage(source, -width / 2, -height / 2);
  return canvas;
};
