import { notFound } from "next/navigation";
import { CITY_PAGES } from "../city-data";

export function generateStaticParams() {
  return CITY_PAGES.map((c) => ({ slug: c.slug }));
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = CITY_PAGES.find((c) => c.slug === params.slug);
  if (!city) return notFound();

  const locale: "fr" | "en" = "fr";

  const content = city[locale];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{content.title}</h1>
      <p className="mt-3 text-lg opacity-80">{content.description}</p>

      <div className="mt-8 space-y-4">
        {content.paragraphs.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </main>
  );
}
