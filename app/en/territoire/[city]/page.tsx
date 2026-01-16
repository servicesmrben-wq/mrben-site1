import { notFound } from "next/navigation";

import { CityPage } from "../../../territoire/CityPage";
import { CITY_SLUGS, getCityBySlug } from "../../../territoire/city-data";
import { buildCityMetadata } from "../../../territoire/seo";

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

  return buildCityMetadata(city, "en");
}

export default function TerritoryCityPage({ params }: PageProps) {
  const city = getCityBySlug(params.city);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} locale="en" />;
}
