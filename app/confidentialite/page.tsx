import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MrBen",
  description:
    "Communications liées au service uniquement, sans SMS non sollicités. Répondez STOP pour vous désabonner; des frais de messagerie peuvent s’appliquer.",
  alternates: {
    canonical: `${BASE_URL}/confidentialite`,
    languages: {
      "fr-CA": `${BASE_URL}/confidentialite`,
      "en-CA": `${BASE_URL}/privacy-policy`,
      "x-default": `${BASE_URL}/confidentialite`,
    },
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Dernière mise à jour : janvier 2026
        </p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-zinc-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              Renseignements collectés
            </h2>
            <p>
              Nous recueillons votre nom, votre numéro de téléphone, votre adresse
              courriel, l’adresse ou le lieu du service, ainsi que les photos que
              vous fournissez volontairement pour une estimation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Utilisation</h2>
            <p>
              Nous utilisons vos renseignements pour répondre à vos demandes,
              fournir des estimations, planifier un service et communiquer à propos
              d’un service demandé ou en cours. Aucun SMS publicitaire ni envoi
              massif n’est effectué.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              Messages texte (SMS)
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Uniquement liés au service (estimation, horaire, confirmation).</li>
              <li>Aucun SMS non sollicité.</li>
              <li>Aucun message promotionnel ou publicitaire.</li>
              <li>Fréquence variable selon la demande.</li>
              <li>Désabonnement en répondant STOP.</li>
              <li>Des frais de messagerie peuvent s’appliquer.</li>
              <li>Nous ne vendons ni ne partageons les numéros utilisés pour les SMS.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Partage</h2>
            <p>
              Nous ne vendons, louons ni n’échangeons vos renseignements. Nous les
              partageons uniquement avec les fournisseurs nécessaires (téléphonie
              ou courriel) pour offrir le service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Sécurité</h2>
            <p>Nous appliquons des mesures raisonnables pour protéger vos données.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Contact</h2>
            <p>
              Écrivez-nous à{" "}
              <a
                href="mailto:info@mrben.ca"
                className="font-medium text-zinc-900 underline underline-offset-4"
              >
                info@mrben.ca
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
