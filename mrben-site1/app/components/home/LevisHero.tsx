"use client";

import { RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  Shield,
  Briefcase,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";
import { useLocale } from "next-intl";
import { IMAGE_URLS, BRAND } from "@/app/lib/constants";
import { classNames } from "@/app/lib/utils";
import { GoogleBusinessProfile } from "@/app/hooks/useGoogleBusinessProfile";

function HeroStat({ icon, title, sub, className }: { icon: React.ReactNode, title: string, sub: string, className?: string }) {
  const heroTextShadow = { textShadow: "0 1px 2px rgba(0,0,0,0.35)" };

  return (
    <div className={classNames("rounded-2xl bg-white/5 p-4 ring-1 ring-white/10", className)}>
      <div className="flex items-center gap-2 text-white">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">{icon}</div>
        <div>
          <div className="text-sm font-semibold" style={heroTextShadow}>
            {title}
          </div>
          <div className="hidden text-xs text-white/85 md:block" style={heroTextShadow}>
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ 
  onQuote, 
  t, 
  heroRef, 
  sourceOfTruth,
  googleProfile,
  phoneNumber,
  phoneHref,
  hideReviewCount = false
}: { 
  onQuote: () => void, 
  t: (key: string, options?: any) => string, 
  heroRef: RefObject<HTMLElement | null>, 
  sourceOfTruth?: string,
  googleProfile: GoogleBusinessProfile,
  phoneNumber: string,
  phoneHref: string,
  hideReviewCount?: boolean
}) {
  const locale = useLocale();
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
  const shouldReduceMotion = useReducedMotion();
  const heroTextShadow = { textShadow: "0 1px 2px rgba(0,0,0,0.35)" };

  // Custom strings for Lévis
  const heroBadgeB = locale === 'fr' ? "Lévis & Lotbinière" : "Lévis & Lotbinière";
  const heroH1a = locale === 'fr' 
    ? "Lavage de vitres résidentiel et commercial à Lévis" 
    : "Residential and commercial window cleaning in Lévis";
  const heroH1b = locale === 'fr'
    ? "Lévis, Saint-Nicolas et la région de Lotbinière"
    : "Lévis, Saint-Nicolas and the Lotbinière region";
  const heroTrust2 = locale === 'fr' ? "Entreprise locale de Lévis" : "Local Lévis business";

  const rating = googleProfile.rating;
  const reviewCount = googleProfile.count;

  const animatedStars = Array.from({ length: 5 }).map((_, index) => (
    <motion.span
      key={index}
      className="inline-flex"
      variants={{
        hidden: { opacity: 0, y: 2 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      }}
    >
      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
    </motion.span>
  ));

  const ratingLine = (
    <a 
      href={BRAND.googleReviewsUrlLevis} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex flex-wrap items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <span className="tabular-nums font-semibold" style={heroTextShadow}>
        {rating.toFixed(1)}
      </span>
      {shouldReduceMotion ? (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: Number.isFinite(rating) ? Math.max(0, Math.floor(rating)) : 0 }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          ))}
        </span>
      ) : (
        <motion.span
          className="flex items-center gap-0.5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {animatedStars}
        </motion.span>
      )}
      {!hideReviewCount && (
        <span className="tabular-nums" style={heroTextShadow}>
          ({reviewCount || 61})
        </span>
      )}
      <span aria-hidden="true" style={heroTextShadow}>
        ·
      </span>
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="8" fill="#34A853" />
        <path
          d="M4.4 8.3 6.9 10.6 11.6 5.6"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={heroTextShadow}>{t("heroVerifiedByGoogle")}</span>
    </a>
  );

  const heroImage = IMAGE_URLS[0];
  const heroAlt = locale === 'fr' ? heroImage.altFr : heroImage.altEn;

  return (
    <section ref={heroRef} id="hero" className="relative -mt-24 overflow-hidden bg-zinc-950 lg:-mt-28">
      <div className="absolute inset-0 opacity-100">
        <Image src={heroImage.src} alt={heroAlt} fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/50 to-zinc-950/80" />

      
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-20 md:pb-20 md:pt-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-5xl text-center lg:text-left"
        >
          {/* NOTE: Hero intentionally uses two width bands:
              - Wide: badge + H1 (SEO/impact)
              - Narrow: heroP + trust + CTAs + stats (conversion)
              Avoid merging these wrappers unless redesigning the hero layout. */}
          <div className="mx-auto w-full">
            <div className="hidden items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15 md:inline-flex lg:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span style={heroTextShadow}>{t("heroBadgeA")}</span>
              <span className="mx-1 text-white/30" style={heroTextShadow}>
                •
              </span>
              <MapPin className="h-3.5 w-3.5" />
              <span style={heroTextShadow}>{heroBadgeB}</span>
            </div>

            <h1
              className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl md:leading-normal"
              style={heroTextShadow}
            >
              {heroH1a}
              <span
                className="block text-lg font-normal leading-snug text-white sm:text-xl md:text-3xl md:leading-normal"
                style={heroTextShadow}
              >
                {heroH1b}
              </span>
            </h1>
            {sourceOfTruth ? (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base" style={heroTextShadow}>
                {sourceOfTruth}
              </p>
            ) : null}
          </div>
          <div className="mx-auto mt-4 w-full max-w-3xl lg:mx-0">
            <p className="hidden text-base leading-relaxed text-white/95 md:block" style={heroTextShadow}>
              {t("heroP")}
            </p>
            <div className="mt-4 md:mt-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              <div className="flex flex-col items-center gap-3 text-xs text-white/90 sm:gap-3 sm:text-sm lg:col-span-7 lg:items-start">
                <div className="flex flex-wrap items-center justify-center gap-2 transition-opacity hover:opacity-90 lg:justify-start">
                  {ratingLine}
                </div>
                <div className="flex flex-col items-center gap-2 lg:items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{heroTrust2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{t("heroTrust3")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{t("heroTrust4")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-center lg:col-span-5 lg:mt-0 lg:justify-start">
                <div className="flex flex-col items-center gap-1 lg:items-start">
                  <button
                    onClick={onQuote}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 cursor-pointer"
                  >
                    {t("primaryCTA")} <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white/85" style={heroTextShadow}>
                    {t("ctaReassurance")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 hidden gap-3 overflow-x-auto pb-1 md:mt-6 md:grid md:grid-cols-3 md:gap-3 lg:mt-10">
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Sparkles className="h-4 w-4" />}
                title={t("heroStat1T")}
                sub={t("heroStat1S")}
              />
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Clock className="h-4 w-4" />}
                title={t("heroStat2T")}
                sub={t("heroStat2S")}
              />
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Shield className="h-4 w-4" />}
                title={t("heroStat3T")}
                sub={t("heroStat3S")}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
