import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function generateMetadata(): Metadata {
  const canonical = `${BASE_URL}/services/window-cleaning`;
  const alternate = `${BASE_URL}/services/lavage-de-vitres`;

  return {
    title: "Window cleaning | MrBen.ca",
    description:
      "Detailed window cleaning for homes and businesses across the Laurentians and nearby areas.",
    alternates: {
      canonical,
      languages: {
        "fr-CA": alternate,
        "en-CA": canonical,
      },
    },
  };
}

export default function WindowCleaningEnPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Services
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Window cleaning
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            Keep your property bright and polished with careful window cleaning
            tailored for residential and commercial spaces.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Request a quote
            </Link>
            <Link
              href="/territoire"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400"
            >
              View service area
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-zinc-900">What’s included</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Interior and exterior panes, frames, screens, and high-access glass
              cleaned with the right equipment for a streak-free finish.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">How we work</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              We assess surfaces, protect sensitive areas, and work efficiently so
              your schedule stays on track and the results look crisp.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <h2 className="text-xl font-semibold text-zinc-900">Why MrBen</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Friendly service, clear communication, and attention to detail that
              leaves windows bright and your property looking its best.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
