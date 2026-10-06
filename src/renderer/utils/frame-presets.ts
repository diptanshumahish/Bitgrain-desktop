export interface FramePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  group: string;
}

export const FRAME_PRESETS: FramePreset[] = [
  { id: "square", label: "square 1080", width: 1080, height: 1080, group: "Social" },
  { id: "portrait", label: "portrait 4:5", width: 1080, height: 1350, group: "Social" },
  { id: "story", label: "story 9:16", width: 1080, height: 1920, group: "Social" },
  { id: "landscape", label: "landscape 16:9", width: 1920, height: 1080, group: "Social" },
  { id: "banner", label: "wide banner", width: 1500, height: 500, group: "Social" },
  { id: "web-desktop", label: "desktop 1440", width: 1440, height: 1024, group: "Web" },
  { id: "web-hd", label: "desktop 1920", width: 1920, height: 1080, group: "Web" },
  { id: "web-laptop", label: "laptop 1280", width: 1280, height: 800, group: "Web" },
  { id: "iphone", label: "iphone", width: 393, height: 852, group: "Device" },
  { id: "iphone-max", label: "iphone pro max", width: 430, height: 932, group: "Device" },
  { id: "android", label: "android", width: 360, height: 800, group: "Device" },
  { id: "ipad", label: "ipad", width: 820, height: 1180, group: "Device" },
  { id: "ipad-pro", label: "ipad pro", width: 1024, height: 1366, group: "Device" },
  { id: "a4", label: "a4", width: 2480, height: 3508, group: "Print" },
  { id: "a5", label: "a5", width: 1748, height: 2480, group: "Print" },
  { id: "letter", label: "us letter", width: 2550, height: 3300, group: "Print" },
  { id: "poster", label: "poster 3000", width: 3000, height: 3000, group: "Print" },
];

export const DEFAULT_FRAME_PRESET: FramePreset = FRAME_PRESETS[0];

export const FRAME_PRESET_GROUPS: string[] = ["Social", "Web", "Device", "Print"];
