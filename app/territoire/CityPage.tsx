import Link from "next/link";

import type { CityPage as CityPageData, Locale } from "./city-data";

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
};

const LOCALE_LABELS: Record<
  Locale,
  { servicesLabel: string; cta: string; ctaReassurance: string; napLabel: string }
> = {
  fr: {
    servicesLabel: "Services offerts",
    cta: "Obtenir une estimation gratuite",
    ctaReassurance: "Réponse rapide • Aucune obligation",
    napLabel: "Coordonnées",
  },
  en: {
    servicesLabel: "Services offered",
    cta: "Get a free estimate",
    ctaReassurance: "Fast response • No obligation",
    napLabel: "Business info",
  },
};

export function CityPage({ city, locale }: { city: CityPageData; locale: Locale }) {
  const content = city[locale];
  const labels = LOCALE_LABELS[locale];

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {city.name}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            {content.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Lavage de vitres
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Vidange de gouttières
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Nettoyage de revêtement
            </span>
          </div>
          <div className="mt-8 flex flex-col items-start gap-1">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {labels.cta}
            </Link>
            <span className="text-xs text-zinc-500">{labels.ctaReassurance}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <aside className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.servicesLabel}
            </div>
            <ul className="mt-4 space-y-2">
              <li>Lavage de vitres</li>
              <li>Vidange de gouttières</li>
              <li>Nettoyage de revêtement</li>
            </ul>
            <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.napLabel}
            </div>
            <div className="mt-3">
              <div className="font-semibold text-zinc-900">{BRAND.name}</div>
              <div>{BRAND.phoneDisplay}</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-center">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                {labels.cta}
              </Link>
              <span className="text-xs text-zinc-500">{labels.ctaReassurance}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{BRAND.name}</span> • {BRAND.phoneDisplay}
        </div>
      </footer>
    </main>
  );
}
