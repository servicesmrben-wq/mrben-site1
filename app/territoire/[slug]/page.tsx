import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug } from "../city-data";
import { buildCityMetadata } from "../seo";
import { getLocaleFromRequest } from "@/app/lib/locale";

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

  const locale = getLocaleFromRequest();
  return buildCityMetadata(city, locale);
}

export default async function Page({ params }: PageProps) {
  const p = await params;
  const city = getCityBySlug(p.slug);

  if (!city) {
    notFound();
  }

  const locale = getLocaleFromRequest();
  return <CityPage city={city} locale={locale} />;
}
