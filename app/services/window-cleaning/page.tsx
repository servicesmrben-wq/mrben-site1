import type { Metadata } from "next";

import WindowCleaningContent from "./WindowCleaningContent";
import { getTranslations } from "@/app/lib/translations";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function generateMetadata(): Metadata {
  const canonical = `${BASE_URL}/services/lavage-de-vitres`;
  const enUrl = `${BASE_URL}/services/window-cleaning`;
  const t = getTranslations("en");

  return {
    title: t("windowCleaning.metaTitle"),
    description: t("windowCleaning.metaDescription"),
    alternates: {
      canonical,
      languages: {
        "fr-CA": canonical,
        "en-CA": enUrl,
        "x-default": canonical,
      },
    },
  };
}

export default function WindowCleaningEnPage() {
  const t = getTranslations("en");

  return <WindowCleaningContent t={t} pagePath="/services/window-cleaning" />;
}
