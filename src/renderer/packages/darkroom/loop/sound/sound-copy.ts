import type { LoopFormat } from "../loop-settings";
import type { SoundDrive, SoundFrameId, SoundReact } from "./sound-settings";

export const SOUND_REACT_LABELS: Record<SoundReact, string> = {
  bass: "Bass",
  beat: "Beat",
  track: "Whole track",
};

export const SOUND_DRIVE_LABELS: Record<SoundDrive, string> = {
  dots: "Dot size",
  light: "Light",
  grain: "Grain",
};

export const SOUND_FRAME_LABELS: Record<SoundFrameId, string> = {
  photo: "Photo",
  canvas: "Canvas",
  reels: "Reels",
  square: "1:1",
  portrait: "4:5",
};

export const SOUND_FRAME_HINTS: Record<SoundFrameId, string> = {
  photo: "Keeps the shape of your photo",
  canvas: "Spotify Canvas, 9:16 at 1080 by 1920. Spotify plays it without sound",
  reels: "Reels, Shorts and TikTok, 9:16 at 1080 by 1920 with your track",
  square: "Square posts, 1080 by 1080",
  portrait: "Portrait feed posts, 1080 by 1350",
};

export const SOUND_REACT_HINTS: Record<SoundReact, string> = {
  bass: "Follows the low end, so kicks and bass lines push the look",
  beat: "Snaps on every hit, then settles back",
  track: "Rides the overall loudness, slower and smoother",
};

const SOUND_EXPORT_PRO_HINT = "Previewing is free. Exporting a sound loop is part of Pro.";
const SOUND_VIDEO_HINT = "Up to 1920 pixels on the long edge, no watermark";
const SOUND_GIF_SIZE_HINT = "Up to 480 pixels, without sound";
export const SOUND_GIF_HINT = "GIFs stay silent, the look still moves with your track";

export const soundExportHint = (locked: boolean, format: LoopFormat): string => {
  if (locked) return SOUND_EXPORT_PRO_HINT;
  return format === "gif" ? SOUND_GIF_SIZE_HINT : SOUND_VIDEO_HINT;
};
