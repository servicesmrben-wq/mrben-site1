import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function generateMetadata(): Metadata {
  const canonical = `${BASE_URL}/services/lavage-de-vitres`;
  const alternate = `${BASE_URL}/services/window-cleaning`;

  return {
    title: "Lavage de vitres | MrBen.ca",
    description:
      "Un service de lavage de vitres complet et soigné pour les maisons et commerces dans les Laurentides et environs.",
    alternates: {
      canonical,
      languages: {
        "fr-CA": canonical,
        "en-CA": alternate,
      },
    },
  };
}

export default function WindowCleaningFrPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Services
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Lavage de vitres
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            Offrez à votre propriété des fenêtres impeccables avec un service
            méticuleux, adapté aux surfaces résidentielles et commerciales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Demander une soumission
            </Link>
            <Link
              href="/territoire"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400"
            >
              Voir notre territoire
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-zinc-900">Ce qui est inclus</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Nettoyage intérieur et extérieur, cadrages, moustiquaires et vitres
              en hauteur avec un équipement adapté pour une finition sans traces.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Comment on travaille</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Évaluation rapide des surfaces, protection des zones sensibles et
              exécution efficace pour limiter les interruptions et respecter votre
              horaire.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <h2 className="text-xl font-semibold text-zinc-900">Pourquoi MrBen</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Service courtois, communication claire et souci du détail pour des
              fenêtres lumineuses qui rehaussent immédiatement l’apparence de votre
              propriété.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
