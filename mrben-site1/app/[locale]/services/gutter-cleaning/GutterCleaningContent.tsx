import Image from "next/image";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  ShieldCheck,
  Leaf,
  Droplets,
  HardHat,
  Trash2,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";
import SeoFaq from "@/app/components/SeoFaq";
import { toJsonLdString } from "@/app/lib/seo/jsonld";
import { getAbsoluteUrl, getLocalBusinessProvider, getBreadcrumbSchema } from "@/app/lib/seo/schema";

const HERO_IMAGE = "/gallery/nettoyage-gouttieres-maison.jpg";

type Props = {
  t: (key: string) => string;
  pagePath: string;
  isLevis?: boolean;
};

export default function GutterCleaningContent({ t, pagePath, isLevis = false }: Props) {
  const locale = useLocale();
  const prefix = locale === "en" ? "window-cleaning" : "lavage-de-vitre";
  const QUOTE_HREF = isLevis ? "/levis#contact" : "/#contact";

  const whyUsItems = [
    {
      icon: HardHat,
      title: t("whyUs.point1.title"),
      desc: t("whyUs.point1.desc"),
    },
    {
      icon: Leaf,
      title: t("whyUs.point2.title"),
      desc: t("whyUs.point2.desc"),
    },
    {
      icon: Droplets,
      title: t("whyUs.point3.title"),
      desc: t("whyUs.point3.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("whyUs.point4.title"),
      desc: t("whyUs.point4.desc"),
    },
  ];

  const processSteps = [
    {
      icon: Leaf,
      title: t("process.step1.title"),
      desc: t("process.step1.desc"),
    },
    {
      icon: Droplets,
      title: t("process.step2.title"),
      desc: t("process.step2.desc"),
    },
    {
      icon: CheckCircle2,
      title: t("process.step3.title"),
      desc: t("process.step3.desc"),
    },
    {
      icon: Trash2,
      title: t("process.step4.title"),
      desc: t("process.step4.desc"),
    },
  ];

  const includedItems = [
    t("process.included1"),
    t("process.included2"),
    t("process.included3"),
    t("process.included4"),
    t("process.included5"),
  ];

  const stats = [
    {
      icon: Droplets,
      title: t("stats.years.title"),
      desc: t("stats.years.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("stats.windows.title"),
      desc: t("stats.windows.desc"),
    },
    {
      icon: Leaf,
      title: t("stats.rating.title"),
      desc: t("stats.rating.desc"),
    },
    {
      icon: HardHat,
      title: t("stats.guarantee.title"),
      desc: t("stats.guarantee.desc"),
    },
  ];

  const faqItems = [
    {
      q: t("faq.items.0.q"),
      a: t("faq.items.0.a"),
    },
    {
      q: t("faq.items.1.q"),
      a: t("faq.items.1.a"),
    },
    {
      q: t("faq.items.2.q"),
      a: t("faq.items.2.a"),
    },
    {
      q: t("faq.items.3.q"),
      a: t("faq.items.3.a"),
    },
    {
      q: t("faq.items.4.q"),
      a: t("faq.items.4.a"),
    },
    {
      q: t("faq.items.5.q"),
      a: t("faq.items.5.a"),
    },
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("jsonld.service.name"),
    serviceType: t("jsonld.service.name"),
    description: t("jsonld.service.description"),
    provider: getLocalBusinessProvider(),
    areaServed: isLevis ? [
      "Lévis, Québec, Canada",
      "Saint-Nicolas, Québec, Canada",
      "Charny, Québec, Canada",
      "Dosquet, Québec, Canada",
    ] : [
      "Laurentides, Québec, Canada",
      t("serviceAreas.cities.lachute"),
      t("serviceAreas.cities.saintJerome"),
      t("serviceAreas.cities.saintSauveur"),
      t("serviceAreas.cities.mirabel"),
      t("serviceAreas.cities.blainville"),
      t("serviceAreas.cities.laval"),
    ],
    url: getAbsoluteUrl(pagePath),
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: locale === "fr" ? "Accueil" : "Home", item: locale === "fr" ? "https://mrben.ca" : "https://mrben.ca/en" },
    { name: t("jsonld.service.name"), item: getAbsoluteUrl(pagePath) },
  ]);

  const serviceAreas = isLevis ? [
    { href: `/${prefix}-levis`, label: "Lévis" },
    { href: `/${prefix}-saint-nicolas`, label: "Saint-Nicolas" },
    { href: `/${prefix}-charny`, label: "Charny" },
    { href: `/${prefix}-dosquet`, label: "Dosquet" },
  ] : [
    { href: `/${prefix}-lachute`, label: t("serviceAreas.cities.lachute") },
    { href: `/${prefix}-saint-jerome`, label: t("serviceAreas.cities.saintJerome") },
    { href: `/${prefix}-saint-sauveur`, label: t("serviceAreas.cities.saintSauveur") },
    { href: `/${prefix}-mirabel`, label: t("serviceAreas.cities.mirabel") },
    { href: `/${prefix}-blainville`, label: t("serviceAreas.cities.blainville") },
    { href: `/${prefix}-laval`, label: t("serviceAreas.cities.laval") },
  ];

  const heroTitle = isLevis
    ? t("heroTitle").replace("dans les Laurentides", "à Lévis").replace("in the Laurentians", "in Lévis")
    : t("heroTitle");

  const heroSubtitle = isLevis 
    ? "MrBen offre le nettoyage de gouttières résidentiel et commercial à Lévis, incluant Saint-Nicolas, Charny et Dosquet."
    : t("heroSubtitle");

  const testimonialAuthor = isLevis
    ? t("testimonials.quote1.author")
        .replace(", Laval", "")
        .replace(", Saint-Sauveur", "")
        .replace(", Mirabel", "")
    : t("testimonials.quote1.author");

  const finalCTASubtitle = isLevis
    ? t("finalCTA.subtitle").replace("dans les Laurentides", "à Lévis").replace("in the Laurentians", "in Lévis")
    : t("finalCTA.subtitle");

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt={t("heroImageAlt")}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-zinc-950/70" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              {t("heroKicker")}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              {heroSubtitle}
            </p>
            {!isLevis && (
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                {t("sourceOfTruth")}
              </p>
            )}
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href={QUOTE_HREF}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-300 sm:w-auto"
              >
                {t("heroCTA")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="text-sm text-white/70">{t("heroCtaNote")}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/80">
              {[
                t("heroTrust1"),
                t("heroTrust2"),
                t("heroTrust3"),
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <Star className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {t("whyUsTitle")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            {t("whyUsSubtitle")}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {whyUsItems.map((item) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              {t("processTitle")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              {t("processSubtitle")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">
              {t("process.includedTitle")}
            </h3>
            <ul className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2" role="list">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-14 text-white">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("stats.title")}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <stat.icon className="h-6 w-6 text-amber-300" aria-hidden="true" />
                <div>
                  <div className="text-lg font-semibold">{stat.title}</div>
                  <p className="mt-1 text-sm text-white/70">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {t("testimonials.title")}
        </h2>
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <blockquote className="text-lg italic text-zinc-700">
                “{t("testimonials.quote1.text")}”
              </blockquote>
              <p className="mt-3 text-sm font-semibold text-zinc-900">
                {testimonialAuthor}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <SeoFaq title={t("faq.title")} items={faqItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(breadcrumbSchema) }}
      />

      {/* Service Areas Section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          {t("serviceAreas.title")}
        </h2>
        <p className="mt-3 text-sm text-zinc-600">
          {t("serviceAreas.lead")} {" "}
          {serviceAreas.map((area, index) => (
            <span key={area.href}>
              <Link href={area.href} className="font-semibold text-zinc-900 hover:text-zinc-700">
                {area.label}
              </Link>
              {index < serviceAreas.length - 2 ? ", " : ""}
              {index === serviceAreas.length - 2
                ? ` ${t("serviceAreas.conjunction")} `
                : ""}
            </span>
          ))}
          {" "}{t("serviceAreas.outro")}
        </p>
      </section>

      {/* Final CTA Section */}
      <section className="bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {t("finalCTA.title")}
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              {finalCTASubtitle}
            </p>
          </div>
          <Link
            href={QUOTE_HREF}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
          >
            {t("heroCTA")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
