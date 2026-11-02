import { signal } from "@bitgrain/core/signal";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { fetchFullTemplate, peekFullTemplate } from "@bitgrain/platform/templates/cards/full-template-cache";
import { ensureStudioFontsLoaded } from "@bitgrain/studio/fonts/load-studio-fonts";
import { ensureAdminFontsLoaded } from "@bitgrain/studio-core/fonts/admin-fonts";
import type { TemplatePreviewRequest } from "./template-preview-events";

export type ActivePreview = TemplatePreviewRequest;

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
  loadFonts();
  void loadFullTemplate(preview.template.id);
}

export function closeTemplatePreview(): void {
  activePreviewSignal.value = null;
  previewFullTemplateSignal.value = null;
}
