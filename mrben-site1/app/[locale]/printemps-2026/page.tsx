import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SpringCampaignContent from "../spring-2026/SpringCampaignContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  
  const canonical = `${BASE_URL}/printemps-2026`;
  const enUrl = `${BASE_URL}/en/spring-2026`;

  return {
    title: isEn ? "Spring 2026 Promotion" : "Promotion Printemps 2026",
    description: isEn 
      ? "Reserve your spot for spring window, gutter, and siding maintenance. Quick VIP booking for returning customers."
      : "Réservez votre place pour l'entretien printanier des vitres, gouttières et revêtement. Réservation rapide pour nos clients fidèles.",
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

export default async function SpringCampaignFrPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  
  // If locale is English, we want to use the /en/spring-2026 URL
  if (locale === 'en') {
    redirect('/en/spring-2026');
  }

  return <SpringCampaignContent locale="fr" />;
}
