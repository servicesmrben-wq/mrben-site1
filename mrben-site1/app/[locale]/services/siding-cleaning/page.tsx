import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import SidingCleaningContent from "./SidingCleaningContent";

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sidingCleaning" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: locale === "fr" 
        ? "https://mrben.ca/services/nettoyage-de-revetement"
        : "https://mrben.ca/en/services/siding-cleaning",
      languages: {
        "en-CA": "https://mrben.ca/en/services/siding-cleaning",
        "fr-CA": "https://mrben.ca/services/nettoyage-de-revetement",
        "x-default": "https://mrben.ca/services/nettoyage-de-revetement",
      },
    },
  };
}

export default function SidingCleaningPage() {
  const t = useTranslations("sidingCleaning");
  return <SidingCleaningContent t={t} pagePath="/services/siding-cleaning" />;
}
