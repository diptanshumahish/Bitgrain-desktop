import { useCallback, useEffect, useRef, useState } from "react";
import { loadTemplateForEditing, saveTemplateDraft } from "./template-draft-api";
import { renderStudioToDataUrl } from "../../components/studio/hooks/useStudioExport";
import type { ApiTemplate } from "../../lib/templates-api";
import { toTemplateDef } from "../../lib/templates-api";
import { scaleTemplateToMin } from "../../data/templates/scale-template";
import { getTemplatePages } from "../../data/templates/template-pages";
import { markClean } from "../../store/studio-save-status";
import type {
  Layer,
  TemplateDef,
  TemplatePage,
} from "../../data/studioTypes";

const TARGET_LONGEST_SIDE = 1080;
const THUMB_W = 400;

export const TEMPLATE_DRAFT_SAVED_EVENT = "bg:template-draft-saved";

export interface TemplateMetadata {
  name: string;
  category: TemplateDef["category"];
  isFree: boolean;
  sortOrder: number;
  tags: string[];
}

interface UseTemplatePersistArgs {
  templateId: string;
  metadata: TemplateMetadata;
  template: TemplateDef;
  layers: Layer[];
  background: string;
  pages: TemplatePage[];
  canvasW: number;
  canvasH: number;
  image: string | null;
  setTemplate: (t: TemplateDef) => void;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  onLoaded?: (loaded: TemplateDef) => void;
  onTemplateLoaded?: (template: ApiTemplate) => void;
}

export interface UseTemplatePersistResult {
  loading: boolean;
  saving: boolean;
  lastError: string | null;
  handleManualSave: () => Promise<void>;
}

export const useTemplatePersist = ({
  templateId,
  metadata,
  template,
  layers,
  background,
  pages,
  canvasW,
  canvasH,
  image,
  setTemplate,
  setPages,
  setActivePageId,
  setCanvasW,
  setCanvasH,
  onLoaded,
  onTemplateLoaded,
}: UseTemplatePersistArgs): UseTemplatePersistResult => {
  const [loading, setLoading] = useState(() => Boolean(templateId));
  const [saving, setSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const metadataRef = useRef(metadata);
  const featuredRef = useRef(false);
  const onLoadedRef = useRef(onLoaded);
  const onTemplateLoadedRef = useRef(onTemplateLoaded);

  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    onTemplateLoadedRef.current = onTemplateLoaded;
  }, [onTemplateLoaded]);

  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    loadTemplateForEditing(templateId).then((editable) => {
      if (cancelled) return;
      if (!editable) {
        setLoading(false);
        return;
      }
      const result = editable.template;
      featuredRef.current = result.featured;

      onTemplateLoadedRef.current?.(result);
      const loaded = scaleTemplateToMin(toTemplateDef(result), TARGET_LONGEST_SIDE);
      setTemplate(loaded);
      setCanvasW(loaded.width);
      setCanvasH(loaded.height);

      const loadedPages = getTemplatePages(loaded);
      setPages(loadedPages);
      setActivePageId(loadedPages[0].id);
      onLoadedRef.current?.(loaded);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [templateId, setTemplate, setPages, setActivePageId, setCanvasW, setCanvasH]);

  const handleManualSave = useCallback(async () => {
    if (!templateId) {
      setLastError("No template id");
      return;
    }
    setSaving(true);
    setLastError(null);

    const meta = metadataRef.current;
    if (!meta.name.trim()) {
      setSaving(false);
      setLastError("Name is required");
      return;
    }

    const firstPage = pages[0];
    const pageW = firstPage?.width ?? canvasW;
    const pageH = firstPage?.height ?? canvasH;
    const pageBackground = firstPage?.background ?? background;
    const pageLayers = firstPage?.layers ?? layers;

    const effectiveTpl: TemplateDef = {
      ...template,
      width: pageW,
      height: pageH,
      background: pageBackground,
      layers: pageLayers,
    };

    const thumbH = Math.round((THUMB_W * pageH) / pageW);
    let thumbnail: string | null = null;
    try {
      thumbnail = await renderStudioToDataUrl(
        effectiveTpl,
        pageBackground,
        pageLayers,
        firstPage?.image ?? image,
        THUMB_W,
        thumbH,
      );
    } catch {
      thumbnail = null;
    }

    const data = {
      width: pageW,
      height: pageH,
      background: pageBackground,
      exportScale: template.exportScale ?? 1,
      layers: pageLayers,
      image: firstPage?.image ?? image,
      pages: pages.map((page) => ({
        id: page.id,
        name: page.name,
        layers: page.layers,
        background: page.background,
        width: page.width,
        height: page.height,
        image: page.image ?? null,
      })),
      overlay: template.overlay,
      tags: meta.tags,
      description: template.description,
      useCases: template.useCases,
      addedAt: template.addedAt,
    };

    const body = {
      id: templateId,
      name: meta.name,
      category: meta.category,
      data,
      thumbnail,
      isFree: meta.isFree,
      featured: featuredRef.current,
      sortOrder: meta.sortOrder,
    };

    try {
      const result = await saveTemplateDraft(templateId, body);
      if (!result) {
        setLastError("Failed to save draft");
      } else {
        markClean();
        document.dispatchEvent(new CustomEvent(TEMPLATE_DRAFT_SAVED_EVENT, { detail: result }));
      }
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }, [templateId, template, layers, background, pages, canvasW, canvasH, image]);

  return { loading, saving, lastError, handleManualSave };
};
