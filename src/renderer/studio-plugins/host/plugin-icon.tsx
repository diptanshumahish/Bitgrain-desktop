import React, { createElement } from "react";
import { PLUGIN_FALLBACK_ICON, PLUGIN_ICONS } from "./plugin-icons";

interface PluginIconProps {
  name: string | null;
  className: string;
}

const toKebabCase = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const PluginIcon: React.FC<PluginIconProps> = ({ name, className }) => {
  const icon = (name ? PLUGIN_ICONS[toKebabCase(name)] : null) ?? PLUGIN_FALLBACK_ICON;
  return createElement(icon, { className });
};
