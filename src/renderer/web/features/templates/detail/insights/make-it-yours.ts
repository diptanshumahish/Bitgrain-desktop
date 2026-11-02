import type { TemplateDetail, TemplateInsights, TemplateTextRole } from "../template-detail-types";
import { countLabel, joinWithAnd } from "./count-label";
import { printEffectLabels } from "./effect-labels";
import { isPrintCategory } from "./print-size";
import { isReadableLayerName } from "./readable-layer-name";

const ACCENT_COUNT = 2;

const headlineStep = (headline: TemplateTextRole): string =>
  isReadableLayerName(headline.layer)
    ? `Start with the largest text, the "${headline.layer}" layer set in ${headline.font}, and swap in your own words.`
    : `Start with the largest text, set in ${headline.font}, and swap in your own words.`;

const supportingStep = (roles: TemplateTextRole[]): string[] => {
  if (roles.length === 0) return [];
  const named = roles.filter((role) => isReadableLayerName(role.layer));
  if (named.length > 0) {
    return [`Then rewrite ${joinWithAnd(named.map((role) => `"${role.layer}" (${role.font})`))} with your details.`];
  }
  return [`Then rewrite the smaller lines in ${joinWithAnd([...new Set(roles.map((role) => role.font))])} with your details.`];
};

const textSteps = ([headline, ...rest]: TemplateTextRole[]): string[] =>
  headline ? [headlineStep(headline), ...supportingStep(rest)] : [];

const photoStep = (insights: TemplateInsights): string => {
  if (insights.imageLayers === 0) {
    return `There are no photos to replace, the design is built from ${insights.shapeLayers > 0 ? "type and shapes" : "type alone"}.`;
  }
  const looks = printEffectLabels(insights.effects);
  const swap =
    insights.imageLayers === 1
      ? "Replace the photo layer with your own picture."
      : `Replace the ${countLabel(insights.imageLayers, "photo layer", "photo layers")} with your own pictures.`;
  return looks.length > 0 ? `${swap} The ${joinWithAnd(looks)} stays live, so it applies to your photo too.` : swap;
};

const colourStep = (insights: TemplateInsights): string[] => {
  if (!insights.background) return [];
  const accents = insights.palette.filter((color) => color !== insights.background).slice(0, ACCENT_COUNT);
  const accentText = accents.length > 0 ? `, then recolour the accents in ${joinWithAnd(accents)}` : "";
  return [`Change the background from ${insights.background} to your own colour${accentText}.`];
};

const pagesStep = (detail: TemplateDetail): string[] =>
  detail.pageCount > 1
    ? [`Keep the ${detail.pageCount} pages you need, duplicate the ones you want more of and delete the rest.`]
    : [];

const exportStep = (detail: TemplateDetail): string =>
  isPrintCategory(detail.category)
    ? "Export a print-ready PDF for the printer, or a PNG to share online."
    : "Export a PNG to post, or a PDF if you need one.";

export const makeItYoursSteps = (detail: TemplateDetail): string[] => {
  const insights = detail.insights;
  if (!insights) return [];
  return [
    ...textSteps(insights.textRoles),
    photoStep(insights),
    ...colourStep(insights),
    ...pagesStep(detail),
    exportStep(detail),
  ];
};
