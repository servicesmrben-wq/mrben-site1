"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import SectionTitle from "./SectionTitle";

export default function Pricing({ onQuote, t }: { onQuote: () => void, t: (key: string, options?: any) => string }) {
  const cards = [
    {
      key: "card1",
      highlight: false
    },
    {
      key: "card2",
      highlight: true
    },
    {
      key: "card3",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="bg-zinc-50 border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionTitle 
          kicker={t("pricing.kicker")} 
          title={t("pricing.title")} 
          subtitle={t("pricing.subtitle")} 
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
          {cards.map((card) => (
            <div 
              key={card.key}
              className={`relative flex flex-col rounded-3xl p-6 shadow-sm ring-1 transition-all hover:shadow-md ${
                card.highlight 
                  ? "bg-white ring-zinc-200 lg:-my-4 lg:py-10 lg:shadow-lg lg:ring-zinc-300" 
                  : "bg-white/60 ring-zinc-200/80"
              }`}
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {t(`pricing.${card.key}.title`)}
              </h3>
              <div className="mt-4 flex items-baseline text-zinc-900">
                <span className="text-xl font-bold tracking-tight">
                  {t(`pricing.${card.key}.price`)}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                {t(`pricing.${card.key}.desc`)}
              </p>

              <ul role="list" className="mt-6 space-y-3 text-sm text-zinc-600 flex-1">
                {[0, 1, 2].map((idx) => {
                  const key = `pricing.${card.key}.features.${idx}`;
                  const feature = t(key);
                  if (!feature || feature === key || feature.includes(key)) return null;
                  return (
                    <li key={idx} className="flex gap-3">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${card.highlight ? "text-zinc-900" : "text-zinc-500"}`} />
                      <span>{feature}</span>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={onQuote}
                className={`mt-8 block w-full rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer ${
                  card.highlight
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-zinc-900 shadow-sm"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:outline-zinc-600"
                }`}
              >
                {t("primaryCTA")}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            {t("pricing.note")}
          </p>
        </div>
      </div>
    </section>
  );
}
