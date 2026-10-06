import React, { createElement } from "react";
import * as Icons from "lucide-react";

const FALLBACK_ICON: keyof typeof Icons = "Puzzle";

export function renderPluginIcon(name: string | null, className: string): React.ReactElement {
  const lookup = Icons as Record<string, unknown>;
  let component = lookup[FALLBACK_ICON] as React.ComponentType<{ className?: string }>;
  if (name) {
    const key = name
      .split(/[-_\s]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
    const candidate = lookup[key];
    if (candidate) {
      component = candidate as React.ComponentType<{ className?: string }>;
    }
  }
  return createElement(component, { className });
}
