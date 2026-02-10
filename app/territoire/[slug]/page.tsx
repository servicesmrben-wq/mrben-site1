import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug } from "../city-data";
import { buildCityMetadata } from "../seo";
import { getLocaleFromRequest } from "@/app/lib/locale";

type Params = { slug: string };

type PageProps = {
  params: Promise<Params>;
};

export function generateStaticParams() {
  return CITY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const locale = await getLocaleFromRequest();
  return buildCityMetadata(city, locale);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "st-sauveur") {
    redirect("/territoire/saint-sauveur");
  }

  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const locale = await getLocaleFromRequest();
  return <CityPage city={city} locale={locale} />;
}
