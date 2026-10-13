import { signal } from "../../../lib/signal";
import type { TemplateDef } from "../../../data/studioTypes";
import { fetchFullTemplate, peekFullTemplate } from "../../../lib/template-cards/full-template-cache";
import { ensureStudioFontsLoaded } from "../../../lib/load-studio-fonts";
import { ensureAdminFontsLoaded } from "../../../lib/admin-fonts";
import type { TemplatePreviewRequest } from "./template-preview-events";

export interface ActivePreview extends TemplatePreviewRequest {
  locked: boolean;
}

export const activePreviewSignal = signal<ActivePreview | null>(null);
export const previewFullTemplateSignal = signal<TemplateDef | null>(null);

const loadFonts = (): void => {
  ensureStudioFontsLoaded();
  void ensureAdminFontsLoaded();
};

async function loadFullTemplate(id: string): Promise<void> {
  const full = peekFullTemplate(id) ?? (await fetchFullTemplate(id));
  if (activePreviewSignal.value?.template.id !== id) return;
  previewFullTemplateSignal.value = full;
}

export function openTemplatePreview(preview: ActivePreview): void {
  activePreviewSignal.value = preview;
  previewFullTemplateSignal.value = peekFullTemplate(preview.template.id) ?? null;
  if (preview.locked) return;
  loadFonts();
  void loadFullTemplate(preview.template.id);
}

export function closeTemplatePreview(): void {
  activePreviewSignal.value = null;
  previewFullTemplateSignal.value = null;
}
