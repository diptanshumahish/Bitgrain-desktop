export type UpgradeFeature = "svg" | "watermark";

export interface UpgradeCopy {
  title: string;
  detail: string;
}

export const UPGRADE_COPY: Record<UpgradeFeature, UpgradeCopy> = {
  svg: {
    title: "SVG export is part of Pro",
    detail: "Vector files stay sharp at any size, for print, signage and plotters. Your edit stays right here while you decide.",
  },
  watermark: {
    title: "Export without the watermark",
    detail: "Pro removes the small watermark and the size cap. Your edit stays right here while you decide.",
  },
};

export const UPGRADE_PERKS: string[] = [
  "Clean exports with no watermark",
  "Full source resolution, no size cap",
  "SVG vectors, 4K video and batch export",
];

export const TRIAL_DAYS = 7;
