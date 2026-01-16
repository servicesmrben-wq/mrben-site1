import { notFound } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug } from "../city-data";
import { buildCityMetadata } from "../seo";

export function generateStaticParams() {
  return CITY_SLUGS.map((slug) => ({ slug }));
}

type PageProps = {
  params: {
    slug: string;
  };
};

export function generateMetadata({ params }: PageProps) {
  const city = getCityBySlug(params.slug);
  if (!city) {
    return {};
  }

  return buildCityMetadata(city, "fr");
}

export default function TerritoryCityPage({ params }: PageProps) {
  const city = getCityBySlug(params.slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} locale="fr" />;
}
