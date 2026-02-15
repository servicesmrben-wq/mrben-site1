import { toJsonLdString } from "@/app/lib/seo/jsonld";

type FaqItem = {
  q: string;
  a: string;
};

type SeoFaqProps = {
  title: string;
  items: FaqItem[];
};

export default function SeoFaq({ title, items }: SeoFaqProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section className="border-t border-zinc-200 bg-zinc-50" aria-labelledby="faq">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="faq" className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h2>
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-zinc-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-zinc-900 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400">
                <span>{item.q}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(faqSchema) }}
      />
    </section>
  );
}
