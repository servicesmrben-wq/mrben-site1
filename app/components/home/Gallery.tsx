"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { IMAGE_URLS } from "@/app/lib/constants";
import { classNames } from "@/app/lib/utils";
import SectionTitle from "./SectionTitle";

export default function Gallery({ t }: { t: (key: string) => string }) {
  const locale = useLocale();
  const imgs = useMemo(() => IMAGE_URLS.slice(1), []);
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleImages = imgs.slice(0, 6);

  const toggleGallery = () => {
    setShowAll((prev) => {
      const next = !prev;
      if (!next && active > 5) {
        setActive(0);
      }
      return next;
    });
  };

  const getAlt = (img: { altEn: string; altFr: string }) => {
    return locale === 'fr' ? img.altFr : img.altEn;
  };

  return (
    <section id="galerie" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 md:pb-16">
        <SectionTitle kicker={t("secGalK")} title={t("secGalT")} subtitle={t("secGalS")} />

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto md:mt-10 md:hidden">
          {imgs.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setActive(i)}
              className="w-[240px] flex-shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-200 shadow-sm"
              aria-label={`View image ${i + 1}`}
            >
              <div className="relative h-[160px] w-full">
                <Image src={img.src} alt={getAlt(img)} fill className="object-cover" sizes="240px" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 shadow-sm h-[320px] sm:h-[420px]">
              <Image 
                src={imgs[active].src} 
                alt={getAlt(imgs[active])} 
                fill 
                className="object-cover" 
                sizes="(max-width: 1024px) 100vw, 60vw" 
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="max-h-none overflow-visible lg:max-h-[420px] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                {visibleImages.map((img, i) => (
                  <button
                    key={img.src}
                    onClick={() => setActive(i)}
                    className={classNames(
                      "overflow-hidden rounded-2xl border shadow-sm transition",
                      i === active ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                    )}
                    aria-label={`${getAlt(img)} ${i + 1}`}
                  >
                    <div className="relative h-28 w-full">
                      <Image src={img.src} alt={getAlt(img)} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                    </div>
                  </button>
                ))}
                {imgs.slice(6).map((img, index) => {
                  const i = index + 6;
                  return (
                    <button
                      key={img.src}
                      onClick={() => setActive(i)}
                      className={classNames(
                        "overflow-hidden rounded-2xl border shadow-sm transition hidden md:block",
                        showAll && "block md:block",
                        i === active ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                      )}
                      aria-label={`${getAlt(img)} ${i + 1}`}
                    >
                      <div className="relative h-28 w-full">
                        <Image src={img.src} alt={getAlt(img)} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 hidden justify-center md:hidden">
          <button
            type="button"
            onClick={toggleGallery}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm"
          >
            {showAll ? t("galleryToggleLess") : t("galleryToggleMore")}
          </button>
        </div>
      </div>
    </section>
  );
}
