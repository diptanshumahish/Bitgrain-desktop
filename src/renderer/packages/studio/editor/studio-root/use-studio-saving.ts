import { useEffect, useMemo } from "react";
import type { ApiTemplate } from "@bitgrain/platform/templates/templates-api";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import { useStudioPersist } from "../use-studio-persist";
import { useTemplatePersist, type TemplateMetadata } from "../use-template-persist";
import { useStudioAutosave } from "../use-studio-autosave";
import { useGuestHandoff } from "@bitgrain/platform/guest-mode/use-guest-handoff";
import { useProjectVersions } from "../../features/versions/use-project-versions";
import { DRAFT_PROJECT_KEY } from "../../features/versions/version-types";
import { canvasGestureSignal } from "../workspace/gesture-freeze";
import { useGestureSettledEffect } from "./use-gesture-settled-effect";
import type { StudioDocument } from "./use-studio-document";
import { useDesktopStudioInstance } from "../../../../shell/studio/use-desktop-studio-instance";
import type { WorkNameState } from "./use-work-name";

export interface StudioTemplateMode {
  templateId: string;
  metadata: TemplateMetadata;
  onSaveReady?: (save: () => Promise<void>) => void;
  onPersistStateChange?: (state: {
    saving: boolean;
    loading: boolean;
    lastError: string | null;
  }) => void;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
  onTemplateLoaded?: (template: ApiTemplate) => void;
  onExit?: () => void;
}

interface UseStudioSavingArgs {
  templateMode: StudioTemplateMode | undefined;
  workId: string | undefined;
  instanceId?: string;
  studioDocument: StudioDocument;
  work: WorkNameState;
  pushHistory: () => void;
}

interface StudioSaving {
  handleManualSave: () => Promise<unknown>;
  retryLoad: () => Promise<void>;
}

const EMPTY_TEMPLATE_METADATA: TemplateMetadata = {
  name: "", category: "poster", isFree: false, sortOrder: 0, tags: [],
};

const isCanvasGestureRunning = (): boolean => canvasGestureSignal.value;

const useTemplateModeBridge = (
  templateMode: StudioTemplateMode | undefined,
  templatePersist: ReturnType<typeof useTemplatePersist>,
  studioDocument: StudioDocument,
): void => {
  const onSaveReady = templateMode?.onSaveReady;
  const { canvasW, canvasH } = studioDocument;
  useEffect(() => {
    if (!onSaveReady) return;
    onSaveReady(templatePersist.handleManualSave);
  }, [onSaveReady, templatePersist.handleManualSave]);

  useEffect(() => {
    if (!templateMode?.onPersistStateChange) return;
    templateMode.onPersistStateChange({
      saving: templatePersist.saving,
      loading: templatePersist.loading,
      lastError: templatePersist.lastError,
    });
  }, [templateMode, templatePersist.saving, templatePersist.loading, templatePersist.lastError]);

  useEffect(() => {
    templateMode?.onCanvasSizeChange?.({ width: canvasW, height: canvasH });
  }, [templateMode, canvasW, canvasH]);
};

const useSettledAutosave = (
  save: () => Promise<CloudSyncOutcome>, enabled: boolean, studioDocument: StudioDocument, workName: string,
): void => {
  const scheduleAutosave = useStudioAutosave({ enabled, save });
  const { canvasW, canvasH, pagesApi } = studioDocument;
  const { pages, activePageId } = pagesApi;
  const autosaveToken = useMemo(
    () => ({ scheduleAutosave, pages, activePageId, canvasW, canvasH, workName }),
    [scheduleAutosave, pages, activePageId, canvasW, canvasH, workName],
  );
  useGestureSettledEffect(autosaveToken, (token) => token.scheduleAutosave());
};

export const useStudioSaving = ({
  templateMode, workId, instanceId, studioDocument, work, pushHistory,
}: UseStudioSavingArgs): StudioSaving => {
  const { template, setTemplate, pagesApi, canvasW, canvasH, setCanvasW, setCanvasH, image, setImage } = studioDocument;
  const { layers, background, pages, activePageId, setPages, setActivePageId } = pagesApi;

  const desktopInstanceId = templateMode ? undefined : instanceId;
  const saveDesktopInstance = useDesktopStudioInstance({
    instanceId: desktopInstanceId,
    template, layers, background, pages, activePageId, canvasW, canvasH, image,
    workNameRef: work.workNameRef, workCreatedAtRef: work.workCreatedAtRef,
    setPages, setActivePageId, setCanvasW, setCanvasH, setImage, setWorkName: work.setWorkName,
  });

  const studioPersist = useStudioPersist({
    workId: templateMode || desktopInstanceId ? undefined : workId,
    template, layers, background, pages, canvasW, canvasH, image,
    workNameRef: work.workNameRef, workCreatedAtRef: work.workCreatedAtRef,
    setPages, setActivePageId, setCanvasW, setCanvasH, setImage, setWorkName: work.setWorkName,
  });

  const templatePersist = useTemplatePersist({
    templateId: templateMode?.templateId ?? "",
    metadata: templateMode?.metadata ?? EMPTY_TEMPLATE_METADATA,
    template, layers, background, pages, canvasW, canvasH, image,
    setTemplate, setPages, setActivePageId, setCanvasW, setCanvasH,
    onTemplateLoaded: templateMode?.onTemplateLoaded,
  });

  useProjectVersions({
    enabled: !templateMode,
    isBusy: isCanvasGestureRunning,
    projectKey: desktopInstanceId ?? workId ?? DRAFT_PROJECT_KEY,
    source: { template, pages, activePageId, canvasW, canvasH },
    pushHistory, setPages, setActivePageId, setCanvasW, setCanvasH,
  });

  const guest = useGuestHandoff({
    resumePath: !templateMode && workId ? `/studio/edit/${workId}` : null,
    persist: studioPersist.handleManualSave,
  });
  const saveDocument = desktopInstanceId ? saveDesktopInstance : studioPersist.handleManualSave;
  useSettledAutosave(saveDocument, !templateMode && !guest, studioDocument, work.workName);
  useTemplateModeBridge(templateMode, templatePersist, studioDocument);

  return {
    handleManualSave: templateMode ? templatePersist.handleManualSave : saveDocument,
    retryLoad: studioPersist.retryLoad,
  };
};
