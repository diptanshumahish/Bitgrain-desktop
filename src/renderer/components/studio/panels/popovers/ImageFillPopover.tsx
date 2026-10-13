import React from 'react'
import { X, Maximize, Minimize, StretchHorizontal } from 'lucide-react'
import { ScrubField, BtnGroup } from '../../ui/panelPrimitives'
import { resolveAssetUrl } from '../../../../lib/api-client'
import type { UploadLayer, ImageFilters, BlendMode } from '../../../../data/studioTypes'
import { ImageSourceTabs } from './ImageSourceTabs'

type ImageFit = "cover" | "contain" | "fill";

interface ImageFillPopoverProps {
  layer: UploadLayer | { src: string; fit: ImageFit; filters: ImageFilters; blendMode: BlendMode }
  onClose: () => void
  onChange: (updates: Partial<UploadLayer> | { src?: string; fit?: ImageFit; filters?: ImageFilters; blendMode?: BlendMode }) => void
  onUpload?: (dataUrl: string) => void
}

export const ImageFillPopover: React.FC<ImageFillPopoverProps> = ({
  layer, onClose, onChange, onUpload
}) => {
  const updateFilter = (key: keyof ImageFilters, value: number) => {
    const currentFilters = layer.filters || {}
    onChange({ filters: { ...currentFilters, [key]: value } })
  }

  const filters = layer.filters || {}
  const fit = layer.fit || 'cover'
  const currentSrc = (layer as { src?: string }).src

  const FIT_OPTIONS = [
    { icon: <Maximize size={12} />, value: 'cover', title: 'Cover' },
    { icon: <Minimize size={12} />, value: 'contain', title: 'Contain' },
    { icon: <StretchHorizontal size={12} />, value: 'fill', title: 'Fill' },
  ]

  return (
    <div className="w-[300px] p-0 overflow-hidden border border-[var(--s-border)] bg-[var(--s-bg-panel)] rounded-xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between px-3 pt-3 pb-1 border-b border-[var(--s-border)]">
        <span className="text-[11px] font-bold text-[var(--s-text)]">Image fill</span>
        <button onClick={onClose} className="text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[480px] no-scrollbar">
        {currentSrc && (
          <div className="px-3 pt-3">
            <div className="w-full aspect-video rounded-lg border border-[var(--s-border)] overflow-hidden bg-[var(--s-bg-input)]">
              <img src={resolveAssetUrl(currentSrc) ?? currentSrc} draggable={false} className="w-full h-full object-contain" alt="Current" />
            </div>
          </div>
        )}

        <ImageSourceTabs
          onPick={(src) => {
            if (onUpload) onUpload(src)
            onChange({ src })
          }}
        />

        <div className="px-3 pb-4 flex flex-col gap-4 border-t border-[var(--s-border)] pt-3">
          <div>
            <span className="text-[10px] font-bold text-[var(--s-text-subtle)] block mb-2 px-0.5">Fit</span>
            <BtnGroup
              options={FIT_OPTIONS}
              value={fit}
              onChange={v => onChange({ fit: v as ImageFit })}
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-[var(--s-text-subtle)] block mb-2 px-0.5">Adjustments</span>
            <div className="grid grid-cols-1 gap-2">
              <ScrubField label="Exposure" value={filters.brightness ?? 100} min={0} max={200} step={1} suffix="%" onChange={v => updateFilter('brightness', v)} />
              <ScrubField label="Contrast" value={filters.contrast ?? 100} min={0} max={200} step={1} suffix="%" onChange={v => updateFilter('contrast', v)} />
              <ScrubField label="Saturation" value={filters.saturation ?? 100} min={0} max={200} step={1} suffix="%" onChange={v => updateFilter('saturation', v)} />
              <ScrubField label="Temperature" value={filters.hueRotate ?? 0} min={0} max={360} step={1} suffix="°" onChange={v => updateFilter('hueRotate', v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
