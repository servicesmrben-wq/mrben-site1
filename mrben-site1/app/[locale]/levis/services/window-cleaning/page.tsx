import type { Metadata } from "next";
import { redirect } from "next/navigation";

import WindowCleaningContent from "@/app/[locale]/services/window-cleaning/WindowCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/fr/levis/services/lavage-de-vitres`;
  const enUrl = `${BASE_URL}/en/levis/services/window-cleaning`;
  const t = await getTranslations({locale, namespace: 'windowCleaning'});

  return {
    title: `${t("metaTitle")} in Lévis`,
    description: t("metaDescription").replace("Laurentides", "Lévis region"),
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

export default async function LevisWindowCleaningEnPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;

  if (locale === 'fr') {
    redirect('/fr/levis/services/lavage-de-vitres');
  }

  const t = await getTranslations({locale, namespace: 'windowCleaning'});

  return <WindowCleaningContent t={t} pagePath="/levis/services/window-cleaning" isLevis={true} />;
}
