import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export const metadata: Metadata = {
  title: "Privacy Policy | MrBen",
  description:
    "Service-related communications only. No unsolicited or promotional SMS; reply STOP to opt out. Message and data rates may apply.",
  alternates: {
    canonical: `${BASE_URL}/privacy-policy`,
    languages: {
      "en-CA": `${BASE_URL}/privacy-policy`,
      "fr-CA": `${BASE_URL}/confidentialite`,
      "x-default": `${BASE_URL}/privacy-policy`,
    },
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: January 2026</p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-zinc-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              Information We Collect
            </h2>
            <p>
              We collect your name, phone number, email, address or service location,
              and photos you voluntarily provide for quoting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              How We Use Your Information
            </h2>
            <p>
              We use your information to respond to inquiries, provide estimates,
              schedule service, and communicate about your service. We do not use
              your information for mass marketing or ad campaigns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              SMS / Text Messaging
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Service-related only (quotes, scheduling, confirmations).</li>
              <li>No unsolicited SMS.</li>
              <li>No promotional or advertising SMS.</li>
              <li>Frequency varies based on request.</li>
              <li>Reply STOP to opt out.</li>
              <li>Msg &amp; data rates may apply.</li>
              <li>We do not sell or share phone numbers used for texting.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              Information Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your information. We only share
              information with service providers necessary to operate (such as email
              or phone services).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Data Security</h2>
            <p>We use reasonable measures to protect your information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">Contact</h2>
            <p>
              Email us at{" "}
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
