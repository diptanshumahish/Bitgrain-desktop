interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const centerCropBox = (width: number, height: number, aspect: number | null): CropBox => {
  if (!aspect) return { x: 0, y: 0, width, height };
  if (width / height > aspect) {
    const cropWidth = Math.max(1, Math.round(height * aspect));
    return { x: Math.round((width - cropWidth) / 2), y: 0, width: cropWidth, height };
  }
  const cropHeight = Math.max(1, Math.round(width / aspect));
  return { x: 0, y: Math.round((height - cropHeight) / 2), width, height: cropHeight };
};
