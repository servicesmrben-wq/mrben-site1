import type { Metadata } from "next";
import { redirect } from "next/navigation";

import SidingCleaningContent from "@/app/[locale]/siding-cleaning/SidingCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/levis/nettoyage-de-revetement`;
  const enUrl = `${BASE_URL}/en/levis/siding-cleaning`;
  const t = await getTranslations({locale, namespace: 'sidingCleaning'});

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

export default async function LevisSidingCleaningEnPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;

  if (locale === 'fr') {
    redirect('/levis/nettoyage-de-revetement');
  }

  const t = await getTranslations({locale, namespace: 'sidingCleaning'});

  return <SidingCleaningContent t={t} pagePath="/levis/siding-cleaning" isLevis={true} />;
}
