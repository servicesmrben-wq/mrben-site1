import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Droplets,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const HERO_IMAGE = "/gallery/merged-horizonta-windows.jpg";

const QUOTE_HREF = "/#contact";

type Props = {
  t: (key: string) => string;
};

export default function WindowCleaningContent({ t }: Props) {
  const whyUsItems = [
    {
      icon: ShieldCheck,
      title: t("windowCleaning.whyUs.point1.title"),
      desc: t("windowCleaning.whyUs.point1.desc"),
    },
    {
      icon: BadgeCheck,
      title: t("windowCleaning.whyUs.point2.title"),
      desc: t("windowCleaning.whyUs.point2.desc"),
    },
    {
      icon: Leaf,
      title: t("windowCleaning.whyUs.point3.title"),
      desc: t("windowCleaning.whyUs.point3.desc"),
    },
    {
      icon: Clock,
      title: t("windowCleaning.whyUs.point4.title"),
      desc: t("windowCleaning.whyUs.point4.desc"),
    },
  ];

  const processSteps = [
    {
      icon: Sparkles,
      title: t("windowCleaning.process.step1.title"),
      desc: t("windowCleaning.process.step1.desc"),
    },
    {
      icon: Droplets,
      title: t("windowCleaning.process.step2.title"),
      desc: t("windowCleaning.process.step2.desc"),
    },
    {
      icon: CheckCircle2,
      title: t("windowCleaning.process.step3.title"),
      desc: t("windowCleaning.process.step3.desc"),
    },
    {
      icon: Star,
      title: t("windowCleaning.process.step4.title"),
      desc: t("windowCleaning.process.step4.desc"),
    },
  ];

  const includedItems = [
    t("windowCleaning.process.included1"),
    t("windowCleaning.process.included2"),
    t("windowCleaning.process.included3"),
    t("windowCleaning.process.included4"),
    t("windowCleaning.process.included5"),
  ];

  const stats = [
    {
      icon: Sparkles,
      title: t("windowCleaning.stats.years.title"),
      desc: t("windowCleaning.stats.years.desc"),
    },
    {
      icon: Droplets,
      title: t("windowCleaning.stats.windows.title"),
      desc: t("windowCleaning.stats.windows.desc"),
    },
    {
      icon: Star,
      title: t("windowCleaning.stats.rating.title"),
      desc: t("windowCleaning.stats.rating.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("windowCleaning.stats.guarantee.title"),
      desc: t("windowCleaning.stats.guarantee.desc"),
    },
  ];

  const faqItems = [
    {
      question: t("windowCleaning.faq.q1.question"),
      answer: t("windowCleaning.faq.q1.answer"),
    },
    {
      question: t("windowCleaning.faq.q2.question"),
      answer: t("windowCleaning.faq.q2.answer"),
    },
    {
      question: t("windowCleaning.faq.q3.question"),
      answer: t("windowCleaning.faq.q3.answer"),
    },
    {
      question: t("windowCleaning.faq.q4.question"),
      answer: t("windowCleaning.faq.q4.answer"),
    },
  ];

  const serviceAreas = [
    { href: "/territoire/lachute", label: t("windowCleaning.serviceAreas.cities.lachute") },
    { href: "/territoire/saint-jerome", label: t("windowCleaning.serviceAreas.cities.saintJerome") },
    { href: "/territoire/saint-sauveur", label: t("windowCleaning.serviceAreas.cities.saintSauveur") },
    { href: "/territoire/mirabel", label: t("windowCleaning.serviceAreas.cities.mirabel") },
    { href: "/territoire/blainville", label: t("windowCleaning.serviceAreas.cities.blainville") },
    { href: "/territoire/laval", label: t("windowCleaning.serviceAreas.cities.laval") },
  ];

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt={t("windowCleaning.heroImageAlt")}
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
              {t("windowCleaning.heroKicker")}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              {t("windowCleaning.heroTitle")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              {t("windowCleaning.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href={QUOTE_HREF}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-300 sm:w-auto"
              >
                {t("common.getQuote")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="text-sm text-white/70">{t("windowCleaning.heroCtaNote")}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/80">
              {[
                t("windowCleaning.heroTrust1"),
                t("windowCleaning.heroTrust2"),
                t("windowCleaning.heroTrust3"),
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
            {t("windowCleaning.whyUsTitle")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            {t("windowCleaning.whyUsSubtitle")}
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
              {t("windowCleaning.processTitle")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              {t("windowCleaning.processSubtitle")}
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
              {t("windowCleaning.process.includedTitle")}
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
            {t("windowCleaning.stats.title")}
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
          {t("windowCleaning.testimonials.title")}
        </h2>
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <blockquote className="text-lg italic text-zinc-700">
                “{t("windowCleaning.testimonials.quote1.text")}”
              </blockquote>
              <p className="mt-3 text-sm font-semibold text-zinc-900">
                {t("windowCleaning.testimonials.quote1.author")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {t("windowCleaning.faq.title")}
          </h2>
          <div className="mt-8 grid gap-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-zinc-200 bg-white p-5"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-zinc-900">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          {t("windowCleaning.serviceAreas.title")}
        </h2>
        <p className="mt-3 text-sm text-zinc-600">
          {t("windowCleaning.serviceAreas.lead")} {" "}
          {serviceAreas.map((area, index) => (
            <span key={area.href}>
              <Link href={area.href} className="font-semibold text-zinc-900 hover:text-zinc-700">
                {area.label}
              </Link>
              {index < serviceAreas.length - 2 ? ", " : ""}
              {index === serviceAreas.length - 2
                ? ` ${t("windowCleaning.serviceAreas.conjunction")} `
                : ""}
            </span>
          ))}
          {" "}{t("windowCleaning.serviceAreas.outro")}
        </p>
      </section>

      {/* Final CTA Section */}
      <section className="bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {t("windowCleaning.finalCTA.title")}
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              {t("windowCleaning.finalCTA.subtitle")}
            </p>
          </div>
          <Link
            href={QUOTE_HREF}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
          >
            {t("common.getQuote")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
