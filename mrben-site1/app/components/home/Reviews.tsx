"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionTitle from "./SectionTitle";
import { classNames } from "@/app/lib/utils";
import { GoogleBusinessProfile } from "@/app/hooks/useGoogleBusinessProfile";

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <div className="text-sm text-zinc-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews({ t, onQuote, googleProfile, hideReviewCount = false }: { t: (key: string, options?: any) => string, onQuote: () => void, googleProfile: GoogleBusinessProfile, hideReviewCount?: boolean }) {
  const tFooter = useTranslations('Footer');
  const [showAllTrust] = useState(false);

  const staticReviews = [
    {
      name: tFooter("review1Name"),
      text: tFooter("review1Text"),
      stars: 5,
      photo: null,
      date: "Google Review"
    },
    {
      name: tFooter("review2Name"),
      text: tFooter("review2Text"),
      stars: 5,
      photo: null,
      date: "Google Review"
    },
    {
      name: tFooter("review3Name"),
      text: tFooter("review3Text"),
      stars: 5,
      photo: null,
      date: "Google Review"
    },
  ];

  const liveReviews = googleProfile.reviews;
  
  const reviewsToDisplay = liveReviews.length > 0 ? liveReviews.map(r => ({
    name: r.author_name,
    text: r.text.length > 120 ? r.text.substring(0, 120) + "..." : r.text,
    stars: r.rating,
    photo: r.profile_photo_url,
    date: r.relative_time_description
  })) : staticReviews;

  return (
    <section id="avis" className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle kicker={t("secRevK")} title={t("secRevT")} subtitle={t("secRevS")} />

        <div className="mt-8 flex gap-4 overflow-x-auto md:mt-10 md:hidden">
          {reviewsToDisplay.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="w-[280px] flex-shrink-0 flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {r.photo ? (
                      <Image 
                        src={r.photo} 
                        alt={r.name} 
                        width={32} 
                        height={32} 
                        className="rounded-full" 
                        unoptimized
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-xs font-semibold text-zinc-900">{r.name}</div>
                  </div>
                  <Image src="/public/google-g.svg" alt="Google" width={16} height={16} className="opacity-60" />
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: Math.max(0, Math.floor(r.stars || 0)) }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-zinc-600">
                  “{r.text}”
                </p>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-400">
                {r.date}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:grid-cols-3 md:gap-5">
          {reviewsToDisplay.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {r.photo ? (
                      <Image 
                        src={r.photo} 
                        alt={r.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full" 
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-500">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{r.name}</div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.max(0, Math.floor(r.stars || 0)) }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-6 relative opacity-80">
                     <Image src="/google-g.svg" alt="Google" fill />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600">
                  “{r.text}”
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                 <span className="text-xs font-medium text-zinc-400">{r.date}</span>
                 <span className="text-xs font-medium text-blue-600">Verified Review</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:grid-cols-3 md:gap-5">
          <ValueCard icon={<Clock className="h-5 w-5" />} title={t("val1T")} desc={t("val1D")} />
          <div className={classNames("hidden md:block", showAllTrust && "block md:block")}>
            <ValueCard icon={<Shield className="h-5 w-5" />} title={t("val2T")} desc={t("val2D")} />
          </div>
          <div className={classNames("hidden md:block", showAllTrust && "block md:block")}>
            <ValueCard icon={<Sparkles className="h-5 w-5" />} title={t("val3T")} desc={t("val3D")} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 place-items-center md:mt-10">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={onQuote}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 cursor-pointer"
              >
                {t("primaryCTA")} <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
