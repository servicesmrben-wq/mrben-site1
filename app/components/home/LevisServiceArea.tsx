"use client";

import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import SectionTitle from "./SectionTitle";
import { BRAND } from "@/app/lib/constants";
import { GoogleBusinessProfile } from "@/app/hooks/useGoogleBusinessProfile";

export default function ServiceArea({ t, googleProfile }: { t: (key: string, options?: any) => string, googleProfile: GoogleBusinessProfile }) {
  const locale = useLocale();
  const cities = useMemo(() => {
    return [
      { name: "Lévis", slug: "levis" },
      { name: "Saint-Nicolas", slug: "saint-nicolas" },
      { name: "Charny", slug: "charny" },
      { name: "Dosquet", slug: "dosquet" },
    ];
  }, []);

  const rating = googleProfile.rating;
  const count = googleProfile.count ? `(${googleProfile.count})` : t("territory.googleTile.reviewCount");

  return (
    <section
      id="territoire"
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url('/territoire-levis.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Light overlay so text/cards stay readable */}
      <div className="absolute inset-0 bg-white/70" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle
          kicker={t("secAreaK")}
          title={t("secAreaT")}
          subtitle={t("secAreaS")}
          subtitleClassName="hidden md:block"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="text-sm font-semibold text-zinc-900">
              {t("cities")}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/territoire/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-700 md:px-3 md:py-1 md:text-sm hover:bg-zinc-100 transition-colors"
                >
                  <MapPin className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                  {c.name}
                </Link>
              ))}
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-700 md:px-3 md:py-1 md:text-sm">
                <MapPin className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                {t("nearbyCities")}
              </span>
            </div>

            <p className="mt-5 hidden text-sm text-zinc-600 md:block">{t("areaP")}</p>
            <p className="mt-4 text-xs text-zinc-600"></p>
          </div>

          <a
            className="flex cursor-pointer items-center justify-center rounded-3xl border border-zinc-200 bg-white p-6 text-left shadow-sm"
            href={BRAND.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("territory.googleTile.aria")}
          >
            <div className="flex w-full max-w-[82%] flex-col gap-2">
              <div className="text-xl font-semibold text-zinc-900">
                {t("territory.googleTile.title")}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-base text-zinc-700">
                <span className="font-semibold text-zinc-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-yellow-500">★★★★★</span>
                <span>{count}</span>
              </div>
              <div className="text-base text-zinc-600">
                {t("territory.googleTile.subtitle")}
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
