import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug } from "../city-data";
import { buildCityMetadata } from "../seo";

type Params = { slug: string };

type PageProps = {
  params: Promise<Params> | Params;
};

export function generateStaticParams() {
  return CITY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const city = getCityBySlug(p.slug);

  if (!city) {
    notFound();
  }

  return buildCityMetadata(city, "fr");
}

export default async function Page({ params }: PageProps) {
  const p = await params;
  const city = getCityBySlug(p.slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} locale="fr" />;
}
