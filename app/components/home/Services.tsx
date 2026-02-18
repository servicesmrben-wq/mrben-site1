"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";

export default function Services({ onQuote, t }: { onQuote: () => void, t: (key: string, options?: any) => string }) {
  const locale = useLocale();

  const getServiceLink = (id: string) => {
    if (id === "vitres") {
      return locale === "fr" ? "/services/lavage-de-vitres" : "/services/window-cleaning";
    }
    if (id === "gouttieres") {
      return locale === "fr" ? "/services/nettoyage-de-gouttieres" : "/services/gutter-cleaning";
    }
    if (id === "revetement") {
      return locale === "fr" ? "/services/nettoyage-de-revetement" : "/services/siding-cleaning";
    }
    return "#";
  };

  const services = [
    {
      id: "vitres",
      title: t("serviceVitresT"),
      desc: t("serviceVitresD"),
      highlight: t("serviceVitresH"),
      iconSrc: "/icons/window-squeegee-90x70.png",
      iconAlt: t("serviceVitresIconAlt"),
      bullets: [t("serviceVitresB1"), t("serviceVitresB2"), t("serviceVitresB3")],
    },
    {
      id: "gouttieres",
      title: t("serviceGoutT"),
      desc: t("serviceGoutD"),
      highlight: t("serviceGoutH"),
      iconSrc: "/icons/gutter-leaves-90x70.png",
      iconAlt: t("serviceGoutIconAlt"),
      bullets: [t("serviceGoutB1"), t("serviceGoutB2"), t("serviceGoutB3")],
    },
    {
      id: "revetement",
      title: t("servicePressT"),
      desc: t("servicePressD"),
      highlight: t("servicePressH"),
      iconSrc: "/icons/pressure-wash-90x70.png",
      iconAlt: t("servicePressIconAlt"),
      bullets: [t("servicePressB1"), t("servicePressB2"), t("servicePressB3")],
    },
  ];

  return (
    <section id="services" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle kicker={t("secServicesK")} title={t("secServicesT")} subtitle={t("secServicesS")} />

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {services.map((s, idx) => (
            <Link 
              key={s.id} 
              href={getServiceLink(s.id)}
              className="block h-full"
            >
              <motion.div
                id={`service-${s.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="group h-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{s.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-zinc-600">{s.desc}</div>
                  </div>
                  <div className="flex h-[70px] w-[90px] items-center justify-center rounded-2xl">
                    <Image src={s.iconSrc} alt={s.iconAlt} width={90} height={70} className="object-contain" />
                  </div>
                </div>

                <div className="mt-5 hidden space-y-2 md:block">
                  {s.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-zinc-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 hidden h-1 w-full rounded-full bg-zinc-100 md:block">
                  <div className="h-1 w-1/2 rounded-full bg-zinc-900 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm md:mt-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="text-lg font-semibold text-zinc-900">{t("fastQuoteT")}</div>
              <p className="mt-1 text-sm text-zinc-600">{t("fastQuoteP")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <div className="flex flex-col items-center gap-1 sm:items-start">
                <button
                  type="button"
                  onClick={onQuote}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 cursor-pointer"
                >
                  <Mail className="h-4 w-4" /> {t("primaryCTA")}
                </button>
                <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
