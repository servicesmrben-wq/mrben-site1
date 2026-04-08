import type { Metadata } from "next";
import { redirect } from "next/navigation";

import WindowCleaningContent from "../../window-cleaning/WindowCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/levis/lavage-de-vitre`;
  const enUrl = `${BASE_URL}/en/levis/window-cleaning`;
  const t = await getTranslations({locale, namespace: 'windowCleaning'});

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

export default async function LevisWindowCleaningFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;

  if (locale === 'en') {
    redirect('/en/levis/window-cleaning');
  }

  const t = await getTranslations({locale, namespace: 'windowCleaning'});

  return <WindowCleaningContent t={t} pagePath="/levis/lavage-de-vitre" isLevis={true} />;
}
