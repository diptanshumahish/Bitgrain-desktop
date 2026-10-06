import React from 'react'
import type { UploadLayer } from '../../../data/studioTypes'
import { resolveAssetUrl } from '../../../lib/api-client'
import { emitModal } from '../../../lib/event-bus'
import { Section, BtnGroup } from '../ui/panelPrimitives'
import { PositionSizeFields } from '../ui/position-size-fields'
import { AlignRow } from '../ui/align-row'
import { AppearanceControls } from './appearance-controls'
import { BitgrainEffectControls } from './BitgrainEffectControls'
import { EdgeFrameControls } from './EdgeFrameControls'
import { TapeControls } from './TapeControls'
import { ShadowGlowControls } from './shadow-glow-controls'
import { MatchPageButton } from './match-page-button'

interface UploadPropertiesProps {
  layer: UploadLayer
  onChange: (updates: Partial<UploadLayer>) => void
  onAlign?: (alignment: string) => void
  onMatchPage?: () => void
}

const FIT_OPTIONS = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Fill', value: 'fill' },
]

export const UploadProperties: React.FC<UploadPropertiesProps> = ({ layer, onChange, onAlign, onMatchPage }) => {
  const openPicker = () => {
    emitModal({
      type: 'add-image',
      title: layer.src ? 'Replace image' : 'Choose image',
      onPick: (src) => onChange({ src }),
    })
  }

  return (
    <div className="flex flex-col font-editorial">
      <div className="px-3.5 pt-4 pb-2">
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex items-center gap-3 p-2 bg-[var(--s-bg-panel)] rounded-lg border border-[var(--s-border)] group hover:border-[var(--s-accent)] transition-all cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-md border border-[var(--s-border)] overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
            {layer.src ? (
              <img src={resolveAssetUrl(layer.src) ?? layer.src} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-[var(--s-text)]">Image</div>
            <div className="text-[10px] text-[var(--s-text-muted)] font-medium">
              {layer.src ? 'Replace image...' : 'Choose image'}
            </div>
          </div>
        </button>
      </div>

      <Section title="Format">
        <BtnGroup
          options={FIT_OPTIONS.map(opt => ({ ...opt, value: opt.value as string }))}
          value={layer.fit}
          onChange={v => onChange({ fit: v as UploadLayer['fit'] })}
        />
      </Section>

      <Section title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation ?? 0,
            borderRadius: layer.borderRadius,
          }}
          onChange={onChange}
        />
        {onMatchPage && <MatchPageButton onClick={onMatchPage} />}
      </Section>

      <Section title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          filters={layer.filters}
          onOpacityChange={opacity => onChange({ opacity })}
          onBlendModeChange={blendMode => onChange({ blendMode })}
          onFiltersChange={filters => onChange({ filters })}
        />
      </Section>

      <Section title="Image effects">
        <BitgrainEffectControls
          effect={layer.bitgrainEffect}
          onChange={effect => onChange({ bitgrainEffect: effect })}
        />
      </Section>

      <Section title="Shadow & glow">
        <ShadowGlowControls
          shadow={layer.shadow}
          onChange={shadow => onChange({ shadow })}
        />
      </Section>

      <EdgeFrameControls
        effect={layer.tornEdge}
        layerId={layer.id}
        onChange={tornEdge => onChange({ tornEdge })}
      />

      <TapeControls
        tape={layer.tape}
        onChange={tape => onChange({ tape })}
      />
    </div>
  )
}
