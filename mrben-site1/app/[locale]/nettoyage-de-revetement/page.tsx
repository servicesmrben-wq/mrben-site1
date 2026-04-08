import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import SidingCleaningContent from "../siding-cleaning/SidingCleaningContent";

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sidingCleaning" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: locale === "fr" 
        ? "https://mrben.ca/nettoyage-de-revetement"
        : "https://mrben.ca/en/siding-cleaning",
      languages: {
        "en-CA": "https://mrben.ca/en/siding-cleaning",
        "fr-CA": "https://mrben.ca/nettoyage-de-revetement",
        "x-default": "https://mrben.ca/nettoyage-de-revetement",
      },
    },
  };
}

export default function SidingCleaningPage() {
  const t = useTranslations("sidingCleaning");
  return <SidingCleaningContent t={t} pagePath="/nettoyage-de-revetement" />;
}
