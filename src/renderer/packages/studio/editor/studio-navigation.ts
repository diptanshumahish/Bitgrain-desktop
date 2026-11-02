import { promptSaveOrLeave } from "./studio-modals";
import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { dirtySignal } from "../state/studio-save-status";
import { trackEvent } from "@bitgrain/platform/tracker";
import { isGuest } from "@bitgrain/platform/guest-mode/is-guest";
import { promptGuestSignIn } from "@bitgrain/platform/guest-mode/prompt-guest-sign-in";
import { GUEST_LEAVE_PROMPT } from "@bitgrain/platform/guest-mode/guest-prompt-copy";

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
  if (isGuest()) {
    promptGuestSignIn(GUEST_LEAVE_PROMPT, () => navigate("/studio"));
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

export const buildHandleOpenAccount = ({ handleManualSave, navigate }: NavigationConfig) => () => {
  trackEvent("nav", "account_link_clicked", { details: { location: "studio_top_bar", dirty: dirtySignal.value } });
  if (!dirtySignal.value) {
    navigate("/account");
    return;
  }
  promptSaveOrLeave({
    title: "Save changes?",
    message: "Save your current work before opening your account.",
    confirmLabel: "Save and open account",
    cancelLabel: "Open without saving",
    onSaveAndGo: async () => { await handleManualSave(); navigate("/account"); },
    onJustGo: () => navigate("/account"),
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
  if (isGuest()) {
    promptGuestSignIn(GUEST_LEAVE_PROMPT, () => navigate("/studio"));
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

export const promptTemplateSwitch = (hasContent: boolean, onApply: () => void) => {
  if (!hasContent) {
    onApply();
    return;
  }
  emitDialog({
    type: "confirm",
    title: "Replace your design?",
    message: "This template will replace everything on your pages. You can bring your design back with undo.",
    confirmLabel: "Replace design",
    cancelLabel: "Keep my design",
    danger: true,
    safeDefault: true,
    onConfirm: onApply,
  });
};
