import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MrBen",
  description:
    "Privacy policy for MrBen.ca. Transparency on data collection, AI analysis, and the protection of your personal information.",
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            Last Updated: March 2026. This policy details how MrBen.ca manages your personal information in accordance with Quebec and Canadian laws.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-10 text-base leading-relaxed text-zinc-700">
          
          {/* 1. Data Collection */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">1. Information Collected</h2>
            <p>
              We only collect information that you voluntarily provide through our contact forms and our estimator:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Identity:</strong> First and last name.</li>
              <li><strong>Contact Info:</strong> Email address, phone number, and physical property address.</li>
              <li><strong>Media:</strong> Photos of your property's exterior (via the estimator).</li>
              <li><strong>Service:</strong> Estimate details and the type of service requested.</li>
            </ul>
          </div>

          {/* 2. Use of Artificial Intelligence */}
          <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-200/60">
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Artificial Intelligence (AI) Processing</h2>
            <p>
              Our estimation tool uses artificial intelligence (Google Gemini) to analyze uploaded photos. This automated processing is used exclusively to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Count the number of window panes and door panels.</li>
              <li>Determine the number of stories of the property.</li>
              <li>Generate an instant and accurate price quote.</li>
            </ul>
            <p className="mt-3 text-sm italic">
              Note: No photos are used to train public AI models or sold to third parties.
            </p>
          </div>

          {/* 3. SMS Communications */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">3. SMS Communications</h2>
            <p>
              By providing your phone number, you agree to receive text messages related to your services:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Appointment confirmations and reminders.</li>
              <li>Arrival time updates from our team.</li>
              <li>Post-service satisfaction follow-ups and related communications.</li>
            </ul>
            <p className="mt-3 font-medium">
              You can reply "STOP" at any time to opt out of these messages.
            </p>
          </div>

          {/* 4. Storage and Security */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">4. Storage and Security</h2>
            <p>
              Your data is securely stored on <strong>Google Workspace (Google Drive)</strong> servers. We apply strict security measures to protect your information against unauthorized access. We do not sell or rent your personal data to third parties for advertising purposes.
            </p>
          </div>

          {/* 5. Your Rights (Law 25 & PIPEDA) */}
          <div className="border-t border-zinc-100 pt-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">5. Your Rights</h2>
            <p>
              In accordance with Quebec's Law 25 and Canada's PIPEDA, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Right of Access:</strong> Consult the information we hold about you.</li>
              <li><strong>Right of Rectification:</strong> Request the correction of inaccurate data.</li>
              <li><strong>Right of Withdrawal:</strong> Withdraw your consent to the use of your data.</li>
            </ul>
          </div>

          {/* Privacy Officer Contact */}
          <div className="rounded-2xl bg-zinc-900 p-8 text-white">
            <h2 className="text-lg font-bold mb-2">Privacy Officer</h2>
            <p className="text-zinc-400 mb-4">For any questions or requests regarding your data:</p>
            <p className="font-medium">Benjamin</p>
            <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4" href="mailto:admin@mrben.ca">
              admin@mrben.ca
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
