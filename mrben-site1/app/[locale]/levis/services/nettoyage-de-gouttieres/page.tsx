import type { Metadata } from "next";
import { redirect } from "next/navigation";

import GutterCleaningContent from "../../../services/gutter-cleaning/GutterCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/fr/levis/services/nettoyage-de-gouttieres`;
  const enUrl = `${BASE_URL}/en/levis/services/gutter-cleaning`;
  const t = await getTranslations({locale, namespace: 'gutterCleaning'});

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

export default async function LevisGutterCleaningFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  
  if (locale === 'en') {
    redirect('/en/levis/services/gutter-cleaning');
  }

  const t = await getTranslations({locale, namespace: 'gutterCleaning'});

  return <GutterCleaningContent t={t} pagePath="/levis/services/nettoyage-de-gouttieres" isLevis={true} />;
}
