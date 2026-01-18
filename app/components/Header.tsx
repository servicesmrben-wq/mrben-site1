"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
    quote: "Demande en ligne",
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
    quote: "Online request",
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/mrben-logo-transparent.png"
            alt="MrBen.ca"
            width={220}
            height={88}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-zinc-200 bg-white p-1 text-xs font-semibold text-zinc-600 sm:flex">
            <button
              type="button"
              onClick={() => handleLocaleChange("fr")}
              className={`rounded-full px-2 py-1 transition ${
                locale === "fr" ? "bg-zinc-900 text-white" : "hover:text-zinc-900"
              }`}
              aria-pressed={locale === "fr"}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange("en")}
              className={`rounded-full px-2 py-1 transition ${
                locale === "en" ? "bg-zinc-900 text-white" : "hover:text-zinc-900"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <a
            href={BRAND.phoneHref}
            className="hidden rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 sm:inline-flex"
          >
            {labels.call}
          </a>
          <Link
            href="/#contact"
            className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 sm:inline-flex"
          >
            {labels.quote}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 p-2 text-zinc-700 shadow-sm transition hover:bg-zinc-50 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      <div>
        <nav className="mx-auto hidden w-full max-w-6xl px-4 py-2 text-lg font-semibold text-zinc-700 lg:grid lg:grid-cols-6 lg:place-items-center">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-900">
              {item.label}
            </Link>
          ))}
        </nav>
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
              >
                {labels.call}
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                onClick={() => setMenuOpen(false)}
              >
                {labels.quote}
              </Link>
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
