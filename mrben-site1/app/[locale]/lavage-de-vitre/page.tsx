import type { Metadata } from "next";
import { redirect } from "next/navigation";

import WindowCleaningContent from "../window-cleaning/WindowCleaningContent";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}/lavage-de-vitre`;
  const enUrl = `${BASE_URL}/en/window-cleaning`;
  const t = await getTranslations({locale, namespace: 'windowCleaning'});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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

export default async function WindowCleaningFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  
  if (locale === 'en') {
    redirect('/en/window-cleaning');
  }

  const t = await getTranslations({locale, namespace: 'windowCleaning'});

  return <WindowCleaningContent t={t} pagePath="/lavage-de-vitre" />;
}
