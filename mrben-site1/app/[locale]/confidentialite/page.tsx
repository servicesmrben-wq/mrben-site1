import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MrBen",
  description:
    "Politique de confidentialité de MrBen.ca. Transparence sur la collecte de données, l'analyse par IA et la protection de vos renseignements personnels.",
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
            Dernière mise à jour : Mars 2026. Cette politique détaille comment MrBen.ca gère vos renseignements personnels conformément aux lois québécoises et canadiennes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-10 text-base leading-relaxed text-zinc-700">
          
          {/* 1. Collecte des renseignements */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">1. Renseignements recueillis</h2>
            <p>
              Nous recueillons uniquement les informations que vous fournissez volontairement via nos formulaires de contact et notre estimateur :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Identité :</strong> Nom et prénom.</li>
              <li><strong>Coordonnées :</strong> Adresse courriel, numéro de téléphone et adresse physique de la propriété.</li>
              <li><strong>Médias :</strong> Photos de l'extérieur de votre propriété (via l'estimateur).</li>
              <li><strong>Service :</strong> Détails de l'estimation et type de service demandé.</li>
            </ul>
          </div>

          {/* 2. Utilisation de l'Intelligence Artificielle */}
          <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-200/60">
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Traitement par Intelligence Artificielle (IA)</h2>
            <p>
              Notre outil d'estimation utilise l'intelligence artificielle (Google Gemini) pour analyser les photos téléversées. Ce traitement automatisé sert exclusivement à :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Compter le nombre de vitres et de panneaux de portes.</li>
              <li>Déterminer le nombre d'étages de la propriété.</li>
              <li>Générer une soumission de prix instantanée et précise.</li>
            </ul>
            <p className="mt-3 text-sm italic">
              Note : Aucune photo n'est utilisée pour entraîner des modèles d'IA publics ou vendue à des tiers.
            </p>
          </div>

          {/* 3. Communications SMS */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">3. Communications par SMS</h2>
            <p>
              En nous fournissant votre numéro de téléphone, vous acceptez de recevoir des messages texte liés exclusivement à vos services :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Confirmations et rappels de rendez-vous.</li>
              <li>Mises à jour sur l'heure d'arrivée de notre équipe.</li>
              <li>Suivis de satisfaction après service.</li>
            </ul>
            <p className="mt-3 font-medium">
              Nous n'envoyons aucun SMS marketing. Vous pouvez répondre "STOP" à tout moment pour cesser de recevoir ces messages.
            </p>
          </div>

          {/* 4. Stockage et Sécurité */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">4. Stockage et sécurité</h2>
            <p>
              Vos données sont stockées de manière sécurisée sur les serveurs de <strong>Google Workspace (Google Drive)</strong>. Nous appliquons des mesures de sécurité strictes pour protéger vos renseignements contre tout accès non autorisé. Nous ne vendons, ne louons, ni ne partageons vos données personnelles avec des tiers à des fins publicitaires.
            </p>
          </div>

          {/* 5. Vos Droits (Loi 25) */}
          <div className="border-t border-zinc-100 pt-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">5. Vos droits (Loi 25)</h2>
            <p>
              Conformément à la Loi 25 du Québec, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Droit d'accès :</strong> Consulter les renseignements que nous détenons sur vous.</li>
              <li><strong>Droit de rectification :</strong> Demander la correction de données inexactes.</li>
              <li><strong>Droit au retrait :</strong> Retirer votre consentement à l'utilisation de vos données.</li>
            </ul>
          </div>

          {/* Contact Responsable */}
          <div className="rounded-2xl bg-zinc-900 p-8 text-white">
            <h2 className="text-lg font-bold mb-2">Responsable de la protection de la vie privée</h2>
            <p className="text-zinc-400 mb-4">Pour toute question ou demande concernant vos données :</p>
            <p className="font-medium">Benjamin</p>
            <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4" href="mailto:info@mrben.ca">
              info@mrben.ca
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
