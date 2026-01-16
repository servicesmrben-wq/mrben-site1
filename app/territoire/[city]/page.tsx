import { notFound } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug } from "../city-data";
import { buildCityMetadata } from "../seo";

export const dynamicParams = false;

type PageProps = {
  params: {
    city: string;
  };
};

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

export function generateMetadata({ params }: PageProps) {
  const city = getCityBySlug(params.city);
  if (!city) {
    return {};
  }

  return buildCityMetadata(city, "fr");
}

export default function TerritoryCityPage({ params }: PageProps) {
  const city = getCityBySlug(params.city);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} locale="fr" />;
}
