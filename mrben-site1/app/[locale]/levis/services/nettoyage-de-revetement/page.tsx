import type { Metadata } from "next";
import { redirect } from "next/navigation";

import SidingCleaningContent from "../../../services/siding-cleaning/SidingCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/fr/levis/services/nettoyage-de-revetement`;
  const enUrl = `${BASE_URL}/en/levis/services/siding-cleaning`;
  const t = await getTranslations({locale, namespace: 'sidingCleaning'});

  return {
    title: `${t("metaTitle")} à Lévis`,
    description: t("metaDescription").replace("Laurentides", "région de Lévis"),
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

export default async function LevisSidingCleaningFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  
  if (locale === 'en') {
    redirect('/en/levis/services/siding-cleaning');
  }

  const t = await getTranslations({locale, namespace: 'sidingCleaning'});

  return <SidingCleaningContent t={t} pagePath="/levis/services/nettoyage-de-revetement" isLevis={true} />;
}
