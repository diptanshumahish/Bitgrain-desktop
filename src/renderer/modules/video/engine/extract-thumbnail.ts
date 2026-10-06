const THUMB_MAX_WIDTH = 240;
const THUMB_QUALITY = 0.7;

interface ThumbnailResult {
  dataUrl: string;
  width: number;
  height: number;
  duration: number;
}

function pickSize(srcW: number, srcH: number): { w: number; h: number } {
  if (srcW <= THUMB_MAX_WIDTH) return { w: srcW, h: srcH };
  const scale = THUMB_MAX_WIDTH / srcW;
  return { w: THUMB_MAX_WIDTH, h: Math.round(srcH * scale) };
}

function drawToDataUrl(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
): string {
  const { w, h } = pickSize(srcW, srcH);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", THUMB_QUALITY);
}

export async function extractVideoThumbnail(
  blob: Blob,
): Promise<ThumbnailResult> {
  const url = URL.createObjectURL(blob);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("video metadata failed"));
    });

    const seekTime = Math.min(1, Math.max(0, video.duration * 0.1));
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("video seek failed"));
      video.currentTime = seekTime;
    });

    const dataUrl = drawToDataUrl(video, video.videoWidth, video.videoHeight);
    return {
      dataUrl,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: isFinite(video.duration) ? video.duration : 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function extractImageThumbnail(
  blob: Blob,
): Promise<ThumbnailResult> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
    });
    const dataUrl = drawToDataUrl(img, img.naturalWidth, img.naturalHeight);
    return {
      dataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      duration: 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
