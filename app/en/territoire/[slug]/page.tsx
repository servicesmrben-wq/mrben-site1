import { notFound } from "next/navigation";

import { CityPage } from "../../../territoire/CityPage";
import { CITY_SLUGS, getCityBySlug } from "../../../territoire/city-data";
import { buildCityMetadata } from "../../../territoire/seo";

type PageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return CITY_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps) {
  const city = getCityBySlug(params.slug);
  if (!city) {
    return {};
  }

  return buildCityMetadata(city, "en");
}

export default function TerritoryCityPage({ params }: PageProps) {
  const city = getCityBySlug(params.slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} locale="en" />;
}
