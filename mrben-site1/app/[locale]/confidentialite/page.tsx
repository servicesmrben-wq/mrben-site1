import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MrBen",
  description:
    "Politique de confidentialité de MrBen.ca. Vos renseignements servent uniquement aux communications de service et aux SMS; répondez STOP pour vous désabonner. Aucun marketing ni vente de données.",
  robots: {
    index: false,
  },
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Mentions légales
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Politique de confidentialité
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            Cette politique explique comment MrBen.ca collecte, utilise et protège vos
            renseignements lorsque vous demandez nos services de lavage de vitres et
            d’entretien extérieur.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6 text-base leading-relaxed text-zinc-700">
          <p>
            Nous recueillons uniquement les informations que vous choisissez de fournir (nom,
            adresse, téléphone et courriel) afin de préparer une estimation, planifier le service
            et communiquer avec vous au sujet des services demandés.
          </p>
          <p>
            Si vous acceptez de recevoir des SMS, ces messages servent exclusivement aux
            communications de service, y compris les confirmations de rendez-vous, les mises à
            jour d’arrivée et les suivis de service. Répondez STOP en tout temps pour vous
            désabonner. Des frais de messagerie et de données peuvent s’appliquer.
          </p>
          <p>
            Nous n’envoyons aucun message marketing ou promotionnel et nous ne vendons, ne louons
            ni ne partageons vos renseignements personnels à des tiers à des fins de marketing.
          </p>
          <p>
            Pour toute question concernant cette politique ou vos renseignements, écrivez-nous à{" "}
            <a className="font-medium text-zinc-900 underline-offset-4 hover:underline" href="mailto:info@mrben.ca">
              info@mrben.ca
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
