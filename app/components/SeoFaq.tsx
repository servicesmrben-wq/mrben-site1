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
            <article key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="text-base font-semibold text-zinc-900">{item.q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
            </article>
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
