import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { isBlankTemplate } from "../resolve-initial-template";
import { studioWorkNameSignal } from "../../state/studio-work-name";
import { markDirty } from "../../state/studio-save-status";
import { trackEvent } from "@bitgrain/platform/tracker";
import { randomProjectName } from "@bitgrain/platform/projects/names/random-project-name";

const TITLE_REAPPLY_DELAY_MS = 50;
const FALLBACK_TITLE_NAME = "Studio";

interface UseWorkNameArgs {
  initial: TemplateDef;
  workId: string | undefined;
  layerCount: number;
}

export interface WorkNameState {
  workName: string;
  setWorkName: React.Dispatch<React.SetStateAction<string>>;
  workNameRef: React.MutableRefObject<string>;
  workCreatedAtRef: React.MutableRefObject<number>;
  handleRenameWork: (name: string) => void;
}

const initialWorkName = (initial: TemplateDef): string =>
  isBlankTemplate(initial) ? randomProjectName() : initial.name;

const useDocumentTitle = (
  workNameRef: React.MutableRefObject<string>, workId: string | undefined, layerCount: number,
): void => {
  useEffect(() => {
    const titleText = `${workNameRef.current || FALLBACK_TITLE_NAME}, Bitgrain`;
    document.title = titleText;
    const timer = setTimeout(() => { document.title = titleText; }, TITLE_REAPPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [workNameRef, workId, layerCount]);
};

export const useWorkName = ({ initial, workId, layerCount }: UseWorkNameArgs): WorkNameState => {
  const [workCreatedAt] = useState<number>(() => Date.now());
  const workCreatedAtRef = useRef<number>(workCreatedAt);
  const [workName, setWorkName] = useState<string>(() => initialWorkName(initial));
  const workNameRef = useRef<string>(workName);

  useEffect(() => {
    studioWorkNameSignal.value = workName;
  }, [workName]);

  const handleRenameWork = useCallback((name: string) => {
    setWorkName(name);
    workNameRef.current = name;
    markDirty();
    trackEvent("studio", "project_renamed");
  }, []);

  useDocumentTitle(workNameRef, workId, layerCount);

  return { workName, setWorkName, workNameRef, workCreatedAtRef, handleRenameWork };
};
