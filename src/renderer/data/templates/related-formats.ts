import { TEMPLATE_CATEGORIES, type TemplateCategory } from "./categories";

const RELATED_LIMIT = 5;

const RELATED_FORMATS: Record<string, string[]> = {
  poster: ["flyer", "signage", "grand-opening", "social", "banner"],
  social: ["thumbnail", "banner", "stream-kit", "link-preview", "flyer"],
  album: ["poster", "book-cover", "social", "packaging", "wallpaper"],
  wallpaper: ["app-screenshot", "social", "album", "poster", "frame"],
  invitation: ["greeting", "ticket", "menu", "flyer", "certificate"],
  certificate: ["grade-card", "letterhead", "id-card", "invitation", "business-docs"],
  resume: ["portfolio", "letterhead", "business-card", "business-docs", "pitch-deck"],
  portfolio: ["resume", "pitch-deck", "business-card", "book-cover", "social"],
  "pitch-deck": ["portfolio", "business-docs", "letterhead", "social", "banner"],
  letterhead: ["business-docs", "business-card", "resume", "certificate", "invitation"],
  menu: ["recipe-card", "flyer", "signage", "grand-opening", "poster"],
  "business-card": ["letterhead", "id-card", "resume", "business-docs", "flyer"],
  flyer: ["poster", "signage", "grand-opening", "social", "menu"],
  "book-cover": ["album", "poster", "planner", "packaging", "social"],
  thumbnail: ["stream-kit", "banner", "social", "link-preview", "poster"],
  banner: ["social", "thumbnail", "link-preview", "signage", "stream-kit"],
  planner: ["grade-card", "business-docs", "book-cover", "recipe-card", "wallpaper"],
  packaging: ["album", "recipe-card", "menu", "poster", "flyer"],
  "app-screenshot": ["wallpaper", "social", "link-preview", "banner", "pitch-deck"],
  "business-docs": ["letterhead", "pitch-deck", "business-card", "resume", "planner"],
  sports: ["poster", "social", "ticket", "flyer", "stream-kit"],
  "stream-kit": ["thumbnail", "banner", "social", "sports", "wallpaper"],
  signage: ["poster", "flyer", "grand-opening", "menu", "banner"],
  ticket: ["invitation", "id-card", "sports", "poster", "flyer"],
  greeting: ["invitation", "certificate", "social", "frame", "poster"],
  "link-preview": ["banner", "social", "thumbnail", "app-screenshot", "pitch-deck"],
  "recipe-card": ["menu", "packaging", "planner", "social", "flyer"],
  frame: ["social", "greeting", "wallpaper", "album", "poster"],
  "id-card": ["business-card", "ticket", "certificate", "letterhead", "grade-card"],
  "grade-card": ["certificate", "planner", "id-card", "business-docs", "resume"],
  "grand-opening": ["flyer", "signage", "poster", "social", "menu"],
};

const CATEGORY_BY_KEY = new Map(TEMPLATE_CATEGORIES.map((category) => [category.key, category]));

export function relatedFormats(key: string): TemplateCategory[] {
  const related = (RELATED_FORMATS[key] ?? [])
    .map((relatedKey) => CATEGORY_BY_KEY.get(relatedKey))
    .filter((category): category is TemplateCategory => !!category);
  if (related.length > 0) return related.slice(0, RELATED_LIMIT);
  return TEMPLATE_CATEGORIES.filter((category) => category.key !== key).slice(0, RELATED_LIMIT);
}
