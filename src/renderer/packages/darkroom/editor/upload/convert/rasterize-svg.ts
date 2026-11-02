const SVG_TYPE = "image/svg+xml";
const SVG_EXTENSION = /\.svg$/i;
const SVG_RENDER_EDGE = 2400;
const SVG_FALLBACK_EDGE = 1024;

export const isSvgFile = (file: File): boolean => file.type === SVG_TYPE || SVG_EXTENSION.test(file.name);

const loadSvg = async (url: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
};

const drawToPng = async (image: HTMLImageElement): Promise<Blob | null> => {
  const width = image.naturalWidth || SVG_FALLBACK_EDGE;
  const height = image.naturalHeight || SVG_FALLBACK_EDGE;
  const scale = SVG_RENDER_EDGE / Math.max(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};

export const rasterizeSvg = async (file: File): Promise<File> => {
  const url = URL.createObjectURL(file);
  try {
    const blob = await drawToPng(await loadSvg(url));
    if (!blob) return file;
    return new File([blob], file.name.replace(SVG_EXTENSION, ".png"), { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
};
