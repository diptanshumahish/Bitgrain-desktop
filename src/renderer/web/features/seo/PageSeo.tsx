import type React from "react";
import type { PageSeoMeta } from "./page-seo-meta";

// Desktop (PORTED.md): web writes Helmet meta tags here. Search metadata means
// nothing in a desktop window, so the component renders nothing and
// react-helmet-async is not bundled. AppPageSeo delegates here unchanged.
export const PageSeo: React.FC<{ meta: PageSeoMeta }> = () => null;
