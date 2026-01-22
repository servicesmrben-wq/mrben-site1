import type { Metadata } from "next";

import WindowCleaningContent from "../window-cleaning/WindowCleaningContent";
import { getTranslations } from "@/app/lib/translations";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function generateMetadata(): Metadata {
  const canonical = `${BASE_URL}/services/lavage-de-vitres`;
  const t = getTranslations("fr");

  return {
    title: t("windowCleaning.metaTitle"),
    description: t("windowCleaning.metaDescription"),
    alternates: {
      canonical,
      languages: {
        "fr-CA": canonical,
        "en-CA": canonical,
        "x-default": canonical,
      },
    },
  };
}

export default function WindowCleaningFrPage() {
  const t = getTranslations("fr");

  return <WindowCleaningContent t={t} />;
}
