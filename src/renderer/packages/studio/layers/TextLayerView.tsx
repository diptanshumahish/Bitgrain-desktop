import React, { useCallback, useEffect, useRef } from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { SelectionHandles } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { buildBaseTextStyle } from "./text-style-utils";
import {
  registerEditor,
  unregisterEditor,
  updateEditorBase,
  refreshSelection,
  showSavedHighlight,
  clearHighlight,
  endSelectionPreview,
} from "@bitgrain/studio-core/text/rich-text/text-edit-bus";
import { layerBaseStyle } from "@bitgrain/studio-core/text/rich-text/rich-text-read";
import { handleEditorClickSelection } from "@bitgrain/studio-core/text/rich-text/text-click-select";
import { handleFormatShortcut } from "@bitgrain/studio-core/text/rich-text/format-shortcuts";
import { NEW_TEXT_CONTENT } from "@bitgrain/studio-core/layers/studio-layers";
import { TextStaticBody } from "./text-view/TextStaticBody";
import { fillEditor, readEditor } from "./text-view/text-editor-content";
import { TextPathView } from "@bitgrain/studio-core/text/path/TextPathView";
import { hasParagraphBlocks, refreshParagraphMarkers } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-serialize";
import { PARAGRAPH_CLASS, paragraphVars } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-vars";
import { resolveTextSizing } from "@bitgrain/studio-core/text/layout/text-sizing";
import { verticalJustify } from "@bitgrain/studio-core/text/layout/text-vertical-align";
import { usesParagraphMode } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { ensureParagraphBlocks } from "@bitgrain/studio-core/text/layout/paragraphs/editor-paragraphs";
import { halfLeading } from "@bitgrain/core/layout/text-block-height";
import { useSignalValue } from "@bitgrain/core/signal";
import { textPreviewSignal, withTextPreview } from "../fonts/text-preview-signal";
import { textBoxGeometry } from "./text-view/editing-box-style";
import { TEXT_PASS_THROUGH_CLASS, useTextClickThrough } from "./text-view/use-text-click-through";

const CLICK_SLOP_PX = 4;

interface TextLayerViewProps {
  layer: TextLayer;
  selected: boolean;
  editing: boolean;
  scale: number;
  zIndex?: number;
  hideSelectionUi?: boolean;
  interactive?: boolean;
  onSelect: (multi?: boolean) => void;
  onStartEdit: () => void;
  onEndEdit: (content: string, richContent: string) => void;
  onCommitText: (content: string, richContent: string) => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const TextLayerView: React.FC<TextLayerViewProps> = ({
  layer: storedLayer, selected, editing, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onStartEdit, onEndEdit, onCommitText, onMoveDelta, onMoveEnd,
  onResizeDelta, onResizeEnd, onContextMenu,
}) => {
  const layer = withTextPreview(storedLayer, useSignalValue(textPreviewSignal));
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const wasSelectedOnPress = useRef(false);
  const pressPointRef = useRef({ x: 0, y: 0 });
  const drag = useLayerDrag({
    onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive,
    blocked: editing,
    onBeforePress: (e) => {
      wasSelectedOnPress.current = selected;
      pressPointRef.current = { x: e.clientX, y: e.clientY };
    },
  });
  const showChrome = selected && !hideSelectionUi;
  const passThroughMove = useTextClickThrough(wrapRef, !selected && !editing);

  const autoWidth = resolveTextSizing(layer) === "auto-width";
  const box = textBoxGeometry(layer, editing && autoWidth && !layer.textPath);
  const baseStyle = buildBaseTextStyle(layer);
  const leading = halfLeading(layer.fontSize, layer.lineHeight);
  const leadingTrim = { marginTop: -leading, marginBottom: -leading };

  const baseRef = useRef(layerBaseStyle(storedLayer));
  const commitTextRef = useRef(onCommitText);
  const endEditRef = useRef(onEndEdit);
  const layerIdRef = useRef(storedLayer.id);
  const listStylesRef = useRef(storedLayer.listStyles);

  useEffect(() => {
    baseRef.current = layerBaseStyle(storedLayer);
    commitTextRef.current = onCommitText;
    endEditRef.current = onEndEdit;
    layerIdRef.current = storedLayer.id;
    listStylesRef.current = storedLayer.listStyles;
  });

  const commitNow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = readEditor(el, layerIdRef.current);
    commitTextRef.current(next.content, next.richContent);
  }, []);

  const endNow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    endSelectionPreview();
    const next = readEditor(el, layerIdRef.current);
    endEditRef.current(next.content, next.richContent);
  }, []);

  useEffect(() => {
    if (!editing || !ref.current) return;
    const el = ref.current;
    fillEditor(el, layer);
    const range = document.createRange();
    range.selectNodeContents(el);
    if (layer.content !== NEW_TEXT_CONTENT) range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
    // initial population on enter-edit only; subsequent content changes are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    registerEditor({ editorEl: el, base: baseRef.current, commit: commitNow, end: endNow });
    const onSelectionChange = () => refreshSelection();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (wrapRef.current?.contains(target)) return;
      if (target.closest('[data-tutorial="studio-properties"]')) return;
      if (target.closest("[data-popover-root]")) return;
      endNow();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("pointerdown", onPointerDown, true);
      unregisterEditor(el);
    };
  }, [editing, commitNow, endNow]);

  const paragraphMode = usesParagraphMode(layer);
  useEffect(() => {
    if (editing && paragraphMode && ref.current) ensureParagraphBlocks(ref.current, { listStyles: listStylesRef.current });
  }, [editing, paragraphMode]);

  useEffect(() => {
    if (editing && ref.current) updateEditorBase(ref.current, baseRef.current);
  }, [editing, layer.color, layer.fontFamily, layer.fontWeight, layer.fontStyle, layer.fontSize, layer.textDecoration, layer.textTransform, layer.letterSpacing]);

  return (
    <div
      ref={wrapRef}
      className={`absolute overflow-visible origin-center pointer-events-auto ${TEXT_PASS_THROUGH_CLASS}`}
      style={{
        left: box.left,
        top: layer.y,
        width: box.width,
        minWidth: box.minWidth,
        height: autoWidth ? "auto" : layer.height,
        minHeight: layer.height,
        opacity: layer.opacity,
        zIndex,
        cursor: editing ? "text" : selected ? "move" : "default",
        outline:
          showChrome || editing
            ? `${1 / scale}px solid var(--s-canvas-selection)`
            : "none",
        outlineOffset: 0,
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
        transform: `${box.shift}rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (editing) return;
        if (drag.directSelect) {
          const dragged = Math.hypot(e.clientX - pressPointRef.current.x, e.clientY - pressPointRef.current.y) > CLICK_SLOP_PX;
          if (!e.shiftKey && !dragged && wasSelectedOnPress.current && selected) onStartEdit();
          return;
        }
        if (!selected || e.shiftKey) {
          onSelect(e.shiftKey);
          return;
        }
        onStartEdit();
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={editing ? (e) => e.stopPropagation() : drag.onPointerDown}
      onPointerMove={(e) => {
        passThroughMove(e);
        drag.onPointerMove(e);
      }}
      onPointerUp={drag.onPointerUp}
    >
      <div
        className={`w-full relative min-h-full [overflow-x:clip] overflow-y-visible ${editing && !autoWidth ? "flex flex-col h-full" : ""}`}
        style={editing && !autoWidth ? { justifyContent: verticalJustify(layer.verticalAlign) } : undefined}
      >
        {editing ? (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            className={`selection:bg-[var(--s-canvas-selection-fill)] selection:text-[var(--text-edit-ink)] ${PARAGRAPH_CLASS}`}
            onFocus={clearHighlight}
            onBlur={showSavedHighlight}
            onClick={(e) => handleEditorClickSelection(e.detail)}
            onInput={(e) => refreshParagraphMarkers(e.currentTarget)}
            onKeyDown={(e) => {
              if (handleFormatShortcut(e)) return;
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                endNow();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                document.execCommand(hasParagraphBlocks(e.currentTarget) ? "insertParagraph" : "insertLineBreak");
              }
            }}
            style={{
              ...baseStyle,
              ...leadingTrim,
              ...paragraphVars(layer, 1),
              ["--text-edit-ink" as string]: layer.color,
              background: "none",
              WebkitBackgroundClip: "unset",
              WebkitTextFillColor: layer.gradientText?.enabled ? "unset" : undefined,
              backgroundClip: "unset",
              color: layer.color,
              userSelect: "text",
              pointerEvents: "auto",
            }}
          />
        ) : layer.textPath ? (
          <TextPathView layer={layer} />
        ) : (
          <TextStaticBody layer={layer} scale={scale} />
        )}
      </div>

      {showChrome && !editing && (
        <SelectionHandles
          scale={scale}
          boxWidth={layer.width}
          boxHeight={layer.height}
          onResizeDelta={onResizeDelta}
          onResizeEnd={onResizeEnd}
        />
      )}
    </div>
  );
};
