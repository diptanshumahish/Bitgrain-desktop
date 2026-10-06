import { useCallback, useEffect, useRef, useState } from "react";
import { callApi } from "../../lib/api-client";
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
    callApi<ApiTemplate>(`/api/admin/templates/${templateId}`).then((result) => {
      if (cancelled) return;
      if (!result) {
        setLoading(false);
        return;
      }

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
      addedAt: template.addedAt,
    };

    const body = {
      id: templateId,
      name: meta.name,
      category: meta.category,
      data,
      thumbnail,
      isFree: meta.isFree,
      sortOrder: meta.sortOrder,
    };

    try {
      const result = await callApi<ApiTemplate>(
        `/api/admin/templates/${templateId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        30_000,
      );
      if (!result) {
        setLastError("Failed to save template");
      } else {
        markClean();
      }
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }, [templateId, template, layers, background, pages, canvasW, canvasH, image]);

  return { loading, saving, lastError, handleManualSave };
};
