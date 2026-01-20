"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "../lib/locale";

const LABELS: Record<Locale, {
  cleaning: string;
  home: string;
  services: string;
  gallery: string;
  reviews: string;
  territory: string;
  contact: string;
  windows: string;
  gutters: string;
  siding: string;
  call: string;
  quote: string;
  ctaReassurance: string;
}> = {
  fr: {
    cleaning: "Nettoyage",
    home: "Accueil",
    services: "Services",
    gallery: "Réalisations",
    reviews: "Avis",
    territory: "Territoire",
    contact: "Contact",
    windows: "Vitres",
    gutters: "Gouttières",
    siding: "Revêtement",
    call: "Appeler",
    quote: "Obtenir une estimation gratuite",
    ctaReassurance: "Réponse rapide • Aucune obligation",
  },
  en: {
    cleaning: "Cleaning",
    home: "Home",
    services: "Services",
    gallery: "Projects",
    reviews: "Reviews",
    territory: "Service area",
    contact: "Contact",
    windows: "Windows",
    gutters: "Gutters",
    siding: "Siding",
    call: "Call",
    quote: "Get a free estimate",
    ctaReassurance: "Fast response • No obligation",
  },
};

const LOCALE_ROUTE_MAP: Record<Locale, Record<string, string>> = {
  fr: {
    "/services/window-cleaning": "/services/lavage-de-vitres",
  },
  en: {
    "/services/lavage-de-vitres": "/services/window-cleaning",
  },
};

const BRAND = {
  phoneHref: "tel:+15146997145",
  phoneDisplay: "514-699-7145",
};

export default function Header() {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const labels = LABELS[locale];
  const navLinks = useMemo(
    () => [
      { label: labels.home, href: "/" },
      { label: labels.services, href: "/#services" },
      { label: labels.gallery, href: "/#galerie" },
      { label: labels.reviews, href: "/#avis" },
      { label: labels.territory, href: "/#territoire" },
      { label: labels.contact, href: "/#contact" },
    ],
    [labels]
  );

  const cleaningLinks = [
    { label: labels.windows, href: "/#service-vitres" },
    { label: labels.gutters, href: "/#service-gouttieres" },
    { label: labels.siding, href: "/#service-revetement" },
  ];

  const servicesDropdownLinks = [
    { label: "Lavage de vitre", href: "/services/lavage-de-vitres" },
  ];

  const territoryDropdownLinks = [
    { label: "Lachute", href: "/territoire/lachute" },
    { label: "Saint-Jerome", href: "/territoire/saint-jerome" },
    { label: "Saint-Sauveur", href: "/territoire/saint-sauveur" },
    { label: "Mirabel", href: "/territoire/mirabel" },
    { label: "Blainville", href: "/territoire/blainville" },
    { label: "Laval", href: "/territoire/laval" },
  ];

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);

    const search = searchParams?.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const mappedPath = LOCALE_ROUTE_MAP[nextLocale][pathname] ?? pathname;
    const nextUrl = `${mappedPath}${search ? `?${search}` : ""}${hash}`;

    if (mappedPath !== pathname || search || hash) {
      router.push(nextUrl);
    } else if (pathname.startsWith("/territoire")) {
      router.refresh();
    }

    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const headerIsScrolled = scrolled || menuOpen;
  const headerIsDark = true;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-200 ${
        headerIsScrolled
          ? "border-black/20 bg-zinc-950/72"
          : "border-black/20 bg-zinc-950/72"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/brand/mrben-logo-transparent.png"
            alt="MrBen.ca"
            width={220}
            height={88}
            className="h-[3.25rem] w-auto sm:h-14 md:h-16"
            priority
          />
        </Link>

        <nav
          className={`hidden flex-1 items-center justify-center gap-6 text-base font-semibold lg:flex ${
            headerIsDark ? "text-white/80" : "text-zinc-700"
          }`}
        >
          {navLinks.map((item) => {
            if (item.label === labels.services) {
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={headerIsDark ? "hover:text-white" : "hover:text-zinc-900"}
                  >
                    {item.label}
                  </Link>
                  <div className="absolute left-0 top-full z-20 hidden min-w-[12rem] flex-col rounded-md border border-zinc-200 bg-white py-2 text-sm text-zinc-700 shadow-lg group-hover:flex">
                    {servicesDropdownLinks.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="px-3 py-2 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            if (item.label === labels.territory) {
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={headerIsDark ? "hover:text-white" : "hover:text-zinc-900"}
                  >
                    {item.label}
                  </Link>
                  <div className="absolute left-0 top-full z-20 hidden min-w-[14rem] flex-col rounded-md border border-zinc-200 bg-white py-2 text-sm text-zinc-700 shadow-lg group-hover:flex">
                    {territoryDropdownLinks.map((territory) => (
                      <Link
                        key={territory.href}
                        href={territory.href}
                        className="px-3 py-2 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        {territory.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={headerIsDark ? "hover:text-white" : "hover:text-zinc-900"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className={`hidden items-center rounded-full border p-0.5 text-xs font-semibold sm:flex ${
              headerIsDark
                ? "border-white/20 bg-white/10 text-white/80"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            <button
              type="button"
              onClick={() => handleLocaleChange("fr")}
              className={`rounded-full px-2.5 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                locale === "fr"
                  ? headerIsDark
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-900 text-white"
                  : headerIsDark
                    ? "text-white/60 hover:text-white"
                    : "text-zinc-500 hover:text-zinc-900"
              }`}
              aria-pressed={locale === "fr"}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange("en")}
              className={`rounded-full px-2.5 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                locale === "en"
                  ? headerIsDark
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-900 text-white"
                  : headerIsDark
                    ? "text-white/60 hover:text-white"
                    : "text-zinc-500 hover:text-zinc-900"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <a
            href={BRAND.phoneHref}
            className={`hidden items-center text-xs font-semibold transition sm:inline-flex sm:text-sm ${
              headerIsDark
                ? "text-white/80 hover:text-white hover:underline focus-visible:ring-white/60"
                : "text-zinc-700 hover:text-zinc-900 hover:underline focus-visible:ring-zinc-300"
            } rounded underline-offset-4 focus-visible:outline-none focus-visible:ring-2`}
          >
            {BRAND.phoneDisplay}
          </a>
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/#contact"
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition sm:text-sm ${
                headerIsDark
                  ? "bg-white text-zinc-900 hover:bg-white/90"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {labels.quote}
            </Link>
            <span
              className={`text-[10px] font-medium ${
                headerIsDark ? "text-white/70" : "text-zinc-500"
              }`}
            >
              {labels.ctaReassurance}
            </span>
          </div>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full border p-2 shadow-sm transition lg:hidden ${
              headerIsDark
                ? "border-white/40 text-white hover:bg-white/10"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-zinc-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm text-zinc-700">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {labels.cleaning}
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {cleaningLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLocaleChange("fr")}
                className={`rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold ${
                  locale === "fr" ? "bg-zinc-900 text-white" : "text-zinc-700"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                className={`rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold ${
                  locale === "en" ? "bg-zinc-900 text-white" : "text-zinc-700"
                }`}
              >
                EN
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center text-sm font-semibold text-zinc-700 underline-offset-4 transition hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
              >
                {BRAND.phoneDisplay}
              </a>
              <div className="flex flex-col items-center gap-1">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                  onClick={() => setMenuOpen(false)}
                >
                  {labels.quote}
                </Link>
                <span className="text-[10px] font-medium text-zinc-500">
                  {labels.ctaReassurance}
                </span>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {BRAND.phoneDisplay}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
