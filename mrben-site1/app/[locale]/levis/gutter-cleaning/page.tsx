import type { Metadata } from "next";
import { redirect } from "next/navigation";

import GutterCleaningContent from "@/app/[locale]/gutter-cleaning/GutterCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/levis/nettoyage-de-gouttieres`;
  const enUrl = `${BASE_URL}/en/levis/gutter-cleaning`;
  const t = await getTranslations({locale, namespace: 'gutterCleaning'});

  return {
    title: `${t("metaTitle")} in Lévis`,
    description: t("metaDescription").replace("Laurentides", "Lévis region"),
    alternates: {
      canonical: enUrl,
      languages: {
        "fr-CA": canonical,
        "en-CA": enUrl,
        "x-default": canonical,
      },
    },
  };
}

export default async function LevisGutterCleaningEnPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;

  if (locale === 'fr') {
    redirect('/levis/nettoyage-de-gouttieres');
  }

  const t = await getTranslations({locale, namespace: 'gutterCleaning'});

  return <GutterCleaningContent t={t} pagePath="/levis/gutter-cleaning" isLevis={true} />;
}
