import { PRODUCT_SITE_URLS } from "@bitgrain/platform/products/product-sites";

export interface FooterLink {
  to: string;
  label: string;
}

export const RECIPES_PATH = "/recipes";

export const FOOTER_LINKS: FooterLink[] = [
  { to: "/editor", label: "Photo effects" },
  { to: "/studio", label: "Design studio" },
  { to: "/video", label: "Video" },
  { to: "/template-gallery", label: "Templates" },
  { to: "/pricing", label: "Pricing" },
  { to: "/showcase", label: "Showcase" },
  { to: RECIPES_PATH, label: "Recipes" },
  { to: "/mcp", label: "MCP" },
  { to: "/docs", label: "Docs" },
  { to: "/blog", label: "Blog" },
  { to: "/support", label: "Report a bug" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const PRODUCT_LINKS: FooterLink[] = [
  { to: PRODUCT_SITE_URLS.apparel, label: "Drapeshot apparel mockups" },
  { to: PRODUCT_SITE_URLS.menus, label: "Platebill menu maker" },
  { to: PRODUCT_SITE_URLS.albums, label: "Bindwell wedding albums" },
  { to: PRODUCT_SITE_URLS.qr, label: "QR code generator" },
];

export const FREE_TOOL_LINKS: FooterLink[] = [
  { to: "/heic-to-jpg", label: "HEIC to JPG" },
  { to: "/raw-to-jpg", label: "RAW to JPG" },
  { to: "/halftone", label: "Halftone effect" },
  { to: "/dither", label: "Dither effect" },
  { to: "/risograph", label: "Riso effect" },
  { to: "/canva-alternatives", label: "Canva alternatives" },
];

export const EFFECT_LINKS: FooterLink[] = [
  { to: "/grunge", label: "Grunge texture" },
  { to: "/manga-screentone", label: "Manga screentone" },
  { to: "/newspaper-effect", label: "Newspaper print" },
  { to: "/duotone", label: "Duotone" },
  { to: "/gig-poster-maker", label: "Gig poster maker" },
  { to: "/dither-boy-alternative", label: "Dither Boy alternative" },
];

export const LEGAL_LINKS: FooterLink[] = [
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy" },
  { to: "/refund", label: "Refunds" },
];
