import { promptSaveOrLeave } from "./studio-modals";
import { dirtySignal } from "../../store/studio-save-status";
import { trackEvent } from "../../lib/tracker";

interface NavigationConfig {
  handleManualSave: () => Promise<unknown>;
  navigate: (path: string) => void;
  onExit?: () => void;
}

export const buildHandleExit = ({ handleManualSave, navigate, onExit }: NavigationConfig) => () => {
  trackEvent("studio", "exit_clicked", { details: { dirty: dirtySignal.value } });
  if (onExit) {
    onExit();
    return;
  }
  if (!dirtySignal.value) {
    navigate("/studio");
    return;
  }
  promptSaveOrLeave({
    title: "Save changes?",
    message: "Do you want to save your current work before leaving?",
    confirmLabel: "Save & Leave",
    cancelLabel: "Just Leave",
    onSaveAndGo: async () => { await handleManualSave(); navigate("/studio"); },
    onJustGo: () => navigate("/studio"),
  });
};

export const buildHandleNewProject = ({ handleManualSave, navigate, onExit }: NavigationConfig) => async () => {
  trackEvent("studio", "new_project_clicked", { details: { dirty: dirtySignal.value } });
  if (onExit) {
    onExit();
    return;
  }
  if (!dirtySignal.value) {
    navigate("/studio");
    return;
  }
  promptSaveOrLeave({
    title: "Go to Studio Home?",
    message: "Save your work and head back to the studio home to create or open another project.",
    confirmLabel: "Save & Go Home",
    cancelLabel: "Just Go Home",
    onSaveAndGo: async () => { await handleManualSave(); navigate("/studio"); },
    onJustGo: () => navigate("/studio"),
  });
};

export const promptTemplateSwitch = (
  handleManualSave: () => Promise<unknown>,
  onApply: () => void,
) => {
  if (!dirtySignal.value) {
    onApply();
    return;
  }
  promptSaveOrLeave({
    title: "Switch Template?",
    message: "Do you want to save your current work before switching to a new template?",
    confirmLabel: "Save & Switch",
    cancelLabel: "Just Switch",
    onSaveAndGo: async () => { await handleManualSave(); onApply(); },
    onJustGo: onApply,
  });
};
