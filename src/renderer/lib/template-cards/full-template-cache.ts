import type { TemplateDef } from "../../data/studioTypes";
import { callApi } from "../api-client";
import { toTemplateDef, type ApiTemplate } from "../templates-api";
import { scaleTemplateToMin } from "../../data/templates/scale-template";
import { STUDIO_MIN_LONGEST_SIDE } from "./studio-display-size";

const pending = new Map<string, Promise<TemplateDef | null>>();
const loaded = new Map<string, TemplateDef>();

async function requestFullTemplate(id: string): Promise<TemplateDef | null> {
  const result = await callApi<ApiTemplate>(`/api/templates/${encodeURIComponent(id)}`);
  if (!result) {
    pending.delete(id);
    return null;
  }
  const template = scaleTemplateToMin(toTemplateDef(result), STUDIO_MIN_LONGEST_SIDE);
  loaded.set(id, template);
  return template;
}

export function fetchFullTemplate(id: string): Promise<TemplateDef | null> {
  const existing = pending.get(id);
  if (existing) return existing;
  const request = requestFullTemplate(id);
  pending.set(id, request);
  return request;
}

export function peekFullTemplate(id: string): TemplateDef | undefined {
  return loaded.get(id);
}
