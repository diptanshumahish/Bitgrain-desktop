import React from "react";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import type { TemplateDetail } from "./template-detail-types";
import { PageSeo } from "../../seo/PageSeo";
import { templateDetailSeo } from "../../seo/route-meta/template-seo";

export const TemplateDetailHead: React.FC<{ detail: TemplateDetail }> = ({ detail }) => (
  <PageSeo meta={templateDetailSeo(detail, resolveAssetUrl(detail.thumbnail) ?? undefined)} />
);
