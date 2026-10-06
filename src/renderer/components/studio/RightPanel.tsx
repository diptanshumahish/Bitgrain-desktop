import React, { useState } from 'react'
import type { Layer, TextLayer, ImageLayer, ShapeLayer, UploadLayer, GroupLayer, FrameLayer, VectorLayer, InkLayer, AdjustmentLayer, CustomFontEntry, TemplatePage } from '../../data/studioTypes'
import { TextProperties } from './panels/TextProperties'
import { ImageProperties } from './panels/ImageProperties'
import { ShapeProperties } from './panels/ShapeProperties'
import { UploadProperties } from './panels/UploadProperties'
import { AdjustmentProperties } from './panels/AdjustmentProperties'
import { GroupProperties } from './panels/GroupProperties'
import { PatternProperties } from './panels/PatternProperties'
import { PanelGroup } from './ui/panel-group'
import { PositionSizeFields } from './ui/position-size-fields'
import { VectorProperties } from './panels/VectorProperties'
import { InkProperties } from './panels/InkProperties'
import { FrameProperties } from './panels/FrameProperties'
import { MultiSelectProperties } from './panels/MultiSelectProperties'
import { PageCanvasPanel } from './panels/PageCanvasPanel'
import { ChevronDown, Trash2 } from 'lucide-react'
import { RightPanelHeader, LayerOptionsMenu } from './panels/right-panel-header'
import { toggleRightPanel } from '../../store/studio-panels-store'

const ShortcutHint: React.FC<{ keys: string; label: string }> = ({ keys, label }) => (
  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--s-text-muted)]">
    <span className="truncate">{label}</span>
    <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--s-bg-input)] text-[10px] [font-variant-numeric:tabular-nums] text-[var(--s-text-subtle)] shrink-0 border border-[var(--s-border)]">
      {keys}
    </kbd>
  </div>
);

const ShortcutsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 pt-2 pb-5 select-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 text-left"
      >
        <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Quick keys</span>
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          className={`text-[var(--s-text-subtle)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-2.5 mt-3">
          <ShortcutHint keys="V" label="Select tool" />
          <ShortcutHint keys="H" label="Pan canvas" />
          <ShortcutHint keys="P" label="Pen tool" />
          <ShortcutHint keys="⌘ Z" label="Undo" />
          <ShortcutHint keys="⌘ D" label="Duplicate" />
          <ShortcutHint keys="⌘ G" label="Group selection" />
          <ShortcutHint keys="⌫" label="Delete selection" />
        </div>
      )}
    </div>
  );
};

interface RightPanelProps {
  selectedIds: string[]
  selectedLayer: Layer | null
  editingId?: string | null
  onPageBackgroundBind?: (pageId: string, varId: string, value: string) => void
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
  onMatchPageToLayer?: (id: string) => void
  onAlign: (alignment: string) => void
  onScatterCollage?: () => void
  onGroup: () => void
  onUngroup: () => void
  customFonts?: CustomFontEntry[]
  onFontUpload?: (font: CustomFontEntry) => void
  onImageUpload?: (dataUrl: string) => void
  onDeleteLayer?: (id: string) => void
  onMoveLayerUp?: (id: string) => void
  onMoveLayerDown?: (id: string) => void
  onFlipLayerH?: (id: string) => void
  onFlipLayerV?: (id: string) => void
  selectedFramePage?: TemplatePage | null
  selectedFramePageIndex?: number
  totalPages?: number
  onRenamePage?: (id: string, name: string) => void
  onPageBackgroundChange?: (id: string, color: string) => void
  onPageResize?: (id: string, width: number, height: number) => void
  onPageMove?: (id: string, x: number, y: number) => void
  onDeletePage?: (id: string) => void
  pageImage?: string | null
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedIds, selectedLayer, editingId, onPageBackgroundBind,
  onUpdateLayer, onMatchPageToLayer,
  onAlign, onScatterCollage, onGroup, onUngroup,
  customFonts = [], onFontUpload, onImageUpload,
  onDeleteLayer, onMoveLayerUp, onMoveLayerDown, onFlipLayerH, onFlipLayerV,
  selectedFramePage, selectedFramePageIndex = 0, totalPages = 1,
  onRenamePage, onPageBackgroundChange, onPageResize, onPageMove, onDeletePage,
  pageImage,
}) => {
  const commonHeaderProps = (l: Layer) => ({
    onMoveUp: () => onMoveLayerUp?.(l.id),
    onMoveDown: () => onMoveLayerDown?.(l.id),
    onFlipH: () => onFlipLayerH?.(l.id),
    onFlipV: () => onFlipLayerV?.(l.id),
    onDelete: () => onDeleteLayer?.(l.id),
  });

  const layerTitle = (l: Layer): string => {
    switch (l.type) {
      case 'text': return 'Text';
      case 'image': return 'Image';
      case 'upload': return 'Image';
      case 'shape': return 'Shape';
      case 'vector': return 'Vector';
      case 'ink': return 'Brush';
      case 'adjustment': return 'Adjustment';
      case 'group': return (l as GroupLayer).pattern ? 'Pattern' : 'Group';
      case 'frame': return 'Page';
    }
  };

  let headerTitle = 'Properties';
  let headerAction: React.ReactNode = null;

  if (selectedIds.length > 1) {
    headerTitle = `${selectedIds.length} selected`;
  } else if (selectedIds.length === 0 && selectedFramePage) {
    headerTitle = 'Page';
    headerAction = (
      <button
        type="button"
        onClick={() => onDeletePage?.(selectedFramePage.id)}
        aria-label="Delete page"
        className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 size={13} strokeWidth={1.75} />
      </button>
    );
  } else if (selectedIds.length === 0) {
    headerTitle = 'Page';
  } else if (selectedLayer) {
    headerTitle = layerTitle(selectedLayer);
    headerAction = <LayerOptionsMenu {...commonHeaderProps(selectedLayer)} />;
  }

  return (
    <div
      data-tutorial="studio-properties"
      className="w-[252px] min-w-[252px] flex flex-col bg-[var(--s-bg-panel)] border-l border-[var(--s-border)] font-editorial h-full overflow-hidden animate-panel-in-right"
    >
      <RightPanelHeader title={headerTitle} onCollapse={toggleRightPanel} action={headerAction} />

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
      {selectedIds.length > 1 && (
        <MultiSelectProperties
          count={selectedIds.length}
          onAlign={onAlign}
          onGroup={onGroup}
          onScatterCollage={onScatterCollage}
        />
      )}

      {selectedIds.length === 0 && selectedFramePage && onRenamePage && onPageBackgroundChange && onPageResize && onPageMove && (
        <>
          <FrameProperties
            name={selectedFramePage.name}
            background={selectedFramePage.background}
            backgroundVar={selectedFramePage.backgroundVar}
            width={selectedFramePage.width}
            height={selectedFramePage.height}
            x={selectedFramePage.x}
            y={selectedFramePage.y}
            clip={selectedFramePage.clip ?? true}
            indexLabel={`Page ${selectedFramePageIndex + 1} of ${totalPages}`}
            namePlaceholder={`Page ${selectedFramePageIndex + 1}`}
            onRename={(name) => onRenamePage(selectedFramePage.id, name)}
            onBackgroundChange={(color) => onPageBackgroundChange(selectedFramePage.id, color)}
            onBackgroundBind={
              onPageBackgroundBind
                ? (varId, value) => onPageBackgroundBind(selectedFramePage.id, varId, value)
                : undefined
            }
            onResize={(width, height) => onPageResize(selectedFramePage.id, width, height)}
            onMove={(x, y) => onPageMove(selectedFramePage.id, x, y)}
          />
        </>
      )}

      {selectedIds.length === 0 && !selectedFramePage && (
        <>
          <PageCanvasPanel />
          <ShortcutsPanel />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'text' && (
        <>
          <TextProperties
            layer={selectedLayer as TextLayer}
            editing={editingId === selectedLayer.id}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            customFonts={customFonts}
            onFontUpload={onFontUpload}
            onAlign={onAlign}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'image' && (
        <>
          <ImageProperties
            layer={selectedLayer as ImageLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onUpload={onImageUpload}
            onAlign={onAlign}
            onMatchPage={onMatchPageToLayer ? () => onMatchPageToLayer(selectedLayer.id) : undefined}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'shape' && (
        <>
          <ShapeProperties
            layer={selectedLayer as ShapeLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'upload' && (
        <>
          <UploadProperties
            layer={selectedLayer as UploadLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
            onMatchPage={onMatchPageToLayer ? () => onMatchPageToLayer(selectedLayer.id) : undefined}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'adjustment' && (
        <>
          <AdjustmentProperties
            layer={selectedLayer as AdjustmentLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'group' && (selectedLayer as GroupLayer).pattern && (
        <>
          <PanelGroup title="Position & Size">
            <PositionSizeFields
              values={{
                x: selectedLayer.x,
                y: selectedLayer.y,
                width: selectedLayer.width,
                height: selectedLayer.height,
                rotation: (selectedLayer as GroupLayer).rotation ?? 0,
                borderRadius: 0,
              }}
              onChange={(updates) => onUpdateLayer(selectedLayer.id, updates as Partial<GroupLayer>)}
              showRadius={false}
            />
          </PanelGroup>
          <PatternProperties
            pattern={(selectedLayer as GroupLayer).pattern!}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'group' && !(selectedLayer as GroupLayer).pattern && (
        <>
          <GroupProperties
            layer={selectedLayer as GroupLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
            onUngroup={onUngroup}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'frame' && (
        <>
          <FrameProperties
            name={selectedLayer.name}
            background={(selectedLayer as FrameLayer).background}
            backgroundVar={(selectedLayer as FrameLayer).backgroundVar}
            width={selectedLayer.width}
            height={selectedLayer.height}
            x={selectedLayer.x}
            y={selectedLayer.y}
            clip={(selectedLayer as FrameLayer).clip ?? true}
            namePlaceholder="Page"
            onRename={(name) => onUpdateLayer(selectedLayer.id, { name })}
            onBackgroundChange={(color) =>
              onUpdateLayer(selectedLayer.id, { background: color, backgroundVar: undefined } as Partial<FrameLayer>)
            }
            onBackgroundBind={(varId, value) =>
              onUpdateLayer(selectedLayer.id, { background: value, backgroundVar: varId } as Partial<FrameLayer>)
            }
            onResize={(width, height) => onUpdateLayer(selectedLayer.id, { width, height })}
            onMove={(x, y) => onUpdateLayer(selectedLayer.id, { x, y })}
            onClipChange={(clip) => onUpdateLayer(selectedLayer.id, { clip } as Partial<FrameLayer>)}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'vector' && (
        <>
          <VectorProperties
            layer={selectedLayer as VectorLayer}
            pageImage={pageImage}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
          />
        </>
      )}

      {selectedIds.length === 1 && selectedLayer?.type === 'ink' && (
        <>
          <InkProperties
            layer={selectedLayer as InkLayer}
            onChange={(updates) => onUpdateLayer(selectedLayer.id, updates)}
            onAlign={onAlign}
          />
        </>
      )}

      <div className="shrink-0 h-24" />
      </div>
    </div>
  );
};
