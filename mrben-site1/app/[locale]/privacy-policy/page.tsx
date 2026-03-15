import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MrBen",
  description:
    "Privacy policy for MrBen.ca. We use your information only for service communications and SMS updates; reply STOP to opt out. No marketing or data sales.",
  robots: {
    index: false,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Legal
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            This Privacy Policy explains how MrBen.ca collects, uses, and protects your
            information when you request our window cleaning and exterior maintenance services.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6 text-base leading-relaxed text-zinc-700">
          <p>
            We only collect the information you choose to provide (such as your name, address,
            phone number, and email) so we can prepare estimates, schedule service, and communicate
            with you about the services you request.
          </p>
          <p>
            If you opt in to SMS updates, we use text messages solely for service communications,
            including appointment confirmations, arrival updates, and service follow-ups. Reply
            STOP at any time to opt out. Standard message and data rates may apply.
          </p>
          <p>
            We do not send marketing or promotional messages, and we do not sell, rent, or share
            your personal information with third parties for marketing purposes.
          </p>

          <h3 className="pt-4 text-lg font-semibold text-zinc-900">AI Estimator Tool & Photo Uploads</h3>
          <p>
            To provide instant, accurate service quotes, we offer an interactive AI Estimator tool on our website. When you use this tool, the following data practices apply:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Temporary Session Tracking:</strong> When you request a quote, our system generates a temporary, randomized Reference ID (e.g., EST-12345) to connect your uploaded photos to your final estimate. This is a temporary memory function strictly necessary to provide the quoting service you requested. We do not use persistent tracking cookies or cross-site tracking files for this tool.
            </li>
            <li>
              <strong>Property Photos:</strong> The photos you upload of your property&apos;s exterior are processed to calculate window counts and service requirements.
            </li>
            <li>
              <strong>Secure Storage & Service Improvement:</strong> If you choose to submit your contact information to lock in your quote, your photos and the associated AI estimate breakdown are securely stored in our enterprise Google Workspace infrastructure. This allows us to fulfill your service request and is also used internally to improve the accuracy of our quoting algorithms over time.
            </li>
            <li>
              <strong>No Third-Party Sale:</strong> We will never sell your property photos or personal contact information to third parties.
            </li>
          </ul>
          <p>
            If you prefer not to use the automated tool, you can always request a standard quote by contacting us directly.
          </p>

          <p>
            If you have questions about this policy or your information, please contact us at{" "}
            <a className="font-medium text-zinc-900 underline-offset-4 hover:underline" href="mailto:info@mrben.ca">
              info@mrben.ca
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
