import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import GutterCleaningContent from "../gutter-cleaning/GutterCleaningContent";

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gutterCleaning" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: locale === "fr" 
        ? "https://mrben.ca/services/nettoyage-de-gouttieres"
        : "https://mrben.ca/en/services/gutter-cleaning",
      languages: {
        "en-CA": "https://mrben.ca/en/services/gutter-cleaning",
        "fr-CA": "https://mrben.ca/services/nettoyage-de-gouttieres",
        "x-default": "https://mrben.ca/services/nettoyage-de-gouttieres",
      },
    },
  };
}

export default function GutterCleaningPage() {
  const t = useTranslations("gutterCleaning");
  return <GutterCleaningContent t={t} pagePath="/services/nettoyage-de-gouttieres" />;
}
