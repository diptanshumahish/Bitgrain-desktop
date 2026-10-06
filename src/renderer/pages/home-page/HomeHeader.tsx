import React from "react";
import { Sun, Moon } from "lucide-react";
import { UserAvatar } from "../../components/UserAvatar";
import { DesktopExportButton } from "../../components/toolbar/DesktopExportButton";
import { toggleTheme } from "../../store/global-theme-store";
import type { Palette } from "../../engine/types";
import type { TransformMode, DitherMethod } from "../../engine/types";
import type { DownloadRasterFn } from "../../engine/export/export-types";

interface HomeHeaderProps {
  isDark: boolean;
  credits: { png: number; svg: number };
  transparentBg: boolean;
  shareState: "idle" | "copied";
  lutId: string | null;
  image: string | null;
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  ditherFactor: number;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  isColor: boolean;
  palette: Palette | null;
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: number;
  onToggleTransparentBg: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent?: boolean) => void;
  onSharePreset: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  isDark, credits, transparentBg, shareState, lutId, image,
  modes, ditherMethod, ditherFactor, resolution, contrast, brightness,
  saturation, grain, hue, isColor, palette,
  hazeIntensity, bloomIntensity, bloomThreshold, hazeWarmth,
  onToggleTransparentBg, onDownloadRaster, onDownloadSvg, onSharePreset,
}) => {
  return (
    <div className="absolute top-5 right-5 z-40 flex items-center gap-2">
      <UserAvatar />
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-full hover:border-[var(--s-accent)] transition-all text-zinc-500 dark:text-zinc-400 active:scale-90"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
      </button>
      <DesktopExportButton
        credits={credits}
        transparentBg={transparentBg}
        onToggleTransparentBg={onToggleTransparentBg}
        onDownloadRaster={onDownloadRaster}
        onDownloadSvg={onDownloadSvg}
        onSharePreset={onSharePreset}
        shareState={shareState}
        isLUT={!!lutId}
        imageData={image ?? undefined}
        effectsData={{
          modes: modes as unknown as string[],
          lutId,
          ditherMethod: ditherMethod as unknown as string,
          ditherFactor,
          resolution, contrast, brightness, saturation, grain, hue, isColor,
          palette: palette
            ? {
                id: palette.id,
                colors: palette.colors.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`),
              }
            : null,
          hazeIntensity, bloomIntensity, bloomThreshold,
          hazeWarmth: hazeWarmth as unknown as string,
        }}
      />
    </div>
  );
};
