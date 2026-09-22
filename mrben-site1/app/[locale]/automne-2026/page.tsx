import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FallCampaignContent from "../fall-2026/FallCampaignContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  
  const canonical = `${BASE_URL}/automne-2026`;
  const enUrl = `${BASE_URL}/en/fall-2026`;

  return {
    title: isEn ? "Fall 2026 Promotion" : "Automne 2026",
    description: isEn 
      ? "Reserve your spot for fall window and gutter maintenance. Quick VIP booking for returning customers."
      : "Réservez votre place pour l'entretien d'automne des vitres et gouttières. Réservation rapide pour nos clients fidèles.",
    alternates: {
      canonical,
      languages: {
        "fr-CA": canonical,
        "en-CA": enUrl,
        "x-default": canonical,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function FallCampaignFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  
  // If locale is English, we want to use the /en/fall-2026 URL
  if (locale === 'en') {
    redirect('/en/fall-2026');
  }

  return <FallCampaignContent locale="fr" />;
}
