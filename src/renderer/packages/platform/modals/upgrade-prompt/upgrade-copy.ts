export type UpgradeFeature = "svg" | "watermark" | "resize-formats" | "live" | "brand-kit" | "sound-loop";

interface UpgradeCopy {
  title: string;
  detail: string;
}

export const UPGRADE_COPY: Record<UpgradeFeature, UpgradeCopy> = {
  svg: {
    title: "SVG export is part of Pro",
    detail: "SVG vector export, still or animated, and Lottie come with Pro. Vector files stay sharp at any size, for print, signage, plotters and the web. Your edit stays right here while you decide.",
  },
  "sound-loop": {
    title: "Sound loops are part of Pro",
    detail: "Play with your track as long as you like. Pro exports the loop as an MP4 with your music in it, ready for Spotify Canvas, Reels and Shorts. Your edit and your track stay right here while you decide.",
  },
  watermark: {
    title: "Export without the watermark",
    detail: "Pro removes the watermark and the size cap. Your edit stays right here while you decide.",
  },
  "resize-formats": {
    title: "Every format in one go",
    detail: "Free lets you make one new size at a time. Pro lays your design out in as many sizes as you like, plus the social and release kits. Your design stays right here while you decide.",
  },
  live: {
    title: "Go live without the watermark",
    detail: "Pro takes the Bitgrain mark off your live feed and the pop-out window, and lets clips run the full 10 seconds. Your camera stays on while you decide.",
  },
  "brand-kit": {
    title: "Brand kits that look after themselves",
    detail: "Pro gives you unlimited kits, logos in your kit, kits that apply to new designs on their own, and a brand check that fixes stray colors and fonts. Your design stays right here while you decide.",
  },
};

export const UPGRADE_PERKS: string[] = [
  "Clean exports with no watermark",
  "Full source resolution, no size cap",
  "SVG vector, Lottie, 4K video and batch export",
];
