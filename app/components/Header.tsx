"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/navigation"; // Use custom navigation hooks

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Header'); // Assuming 'Header' namespace in your translation files
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLevis = pathname === "/levis";
  const phoneDisplay = isLevis ? "418-741-2217" : "514-699-7145";
  const phoneHref = isLevis ? "tel:+14187412217" : "tel:+15146997145";

  const navLinks = useMemo(
    () => [
      { label: t('nav.home'), href: "/" },
      { label: t('nav.services'), href: "/#services" },
      { label: t('nav.reviews'), href: "/#avis" },
      { label: t('nav.territory'), href: "/#territoire" },
      { label: t('nav.blog'), href: "/blog" },
      { label: t('nav.contact'), href: "/#contact" },
    ],
    [t]
  );

  const cleaningLinks = [
    { label: t('nav.windows'), href: "/#service-vitres" },
    { label: t('nav.gutters'), href: "/#service-gouttieres" },
    { label: t('nav.siding'), href: "/#service-revetement" },
  ];

  const servicesDropdownLinks = [
    {
      label: t('servicesDropdown.windowCleaning'),
      href: locale === "fr" ? "/services/lavage-de-vitres" : "/services/window-cleaning"
    },
    {
      label: t('nav.gutters'),
      href: locale === "fr" ? "/services/nettoyage-de-gouttieres" : "/services/gutter-cleaning"
    },
    {
      label: t('nav.siding'),
      href: locale === "fr" ? "/services/nettoyage-de-revetement" : "/services/siding-cleaning"
    },
  ];

  const territoryDropdownLinks = [
    { label: t('territoryDropdown.lachute'), href: "/territoire/lachute" },
    { label: t('territoryDropdown.saintJerome'), href: "/territoire/saint-jerome" },
    { label: t('territoryDropdown.saintSauveur'), href: "/territoire/saint-sauveur" },
    { label: t('territoryDropdown.mirabel'), href: "/territoire/mirabel" },
    { label: t('territoryDropdown.blainville'), href: "/territoire/blainville" },
    { label: t('territoryDropdown.laval'), href: "/territoire/laval" },
  ];

  const handleLocaleChange = (nextLocale: "en" | "fr") => {
    if (nextLocale === locale) {
      return;
    }
    
    // For specialized service pages, we should redirect to the correct slug
    if (pathname === '/services/lavage-de-vitres' && nextLocale === 'en') {
      router.replace('/services/window-cleaning', { locale: 'en' });
    } else if (pathname === '/services/window-cleaning' && nextLocale === 'fr') {
      router.replace('/services/lavage-de-vitres', { locale: 'fr' });
    } else {
      router.replace(pathname, { locale: nextLocale });
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
            if (item.href === "/#services") {
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

            if (item.href === "/#territoire") {
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
              {t('locale.fr_short')}
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
              {t('locale.en_short')}
            </button>
          </div>
          <a
            href={phoneHref}
            className={`hidden items-center text-xs font-semibold transition sm:inline-flex sm:text-sm ${
              headerIsDark
                ? "text-white/80 hover:text-white hover:underline focus-visible:ring-white/60"
                : "text-zinc-700 hover:text-zinc-900 hover:underline focus-visible:ring-zinc-300"
            } rounded underline-offset-4 focus-visible:outline-none focus-visible:ring-2`}
          >
            {phoneDisplay}
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
              {t('quote')}
            </Link>
            <span
              className={`text-[10px] font-medium ${
                headerIsDark ? "text-white/70" : "text-zinc-500"
              }`}
            >
              {t('ctaReassurance')}
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
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>

              {/* Services Dropdown */}
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900">
                  {t('nav.services')}
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="ml-4 mt-1 flex flex-col border-l border-zinc-200 pl-3">
                  {servicesDropdownLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-zinc-600 hover:text-zinc-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/#avis"
                className="rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.reviews')}
              </Link>

              {/* Territory Dropdown */}
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900">
                  {t('nav.territory')}
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="ml-4 mt-1 flex flex-col border-l border-zinc-200 pl-3">
                  {territoryDropdownLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-zinc-600 hover:text-zinc-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/blog"
                className="rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.blog')}
              </Link>

              <Link
                href="/#contact"
                className="rounded-xl px-3 py-2.5 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </div>

            <hr className="border-zinc-100 my-2" />

            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleLocaleChange("fr")}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  locale === "fr" 
                    ? "bg-zinc-900 text-white border-zinc-900" 
                    : "bg-white text-zinc-600 border-zinc-200"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  locale === "en" 
                    ? "bg-zinc-900 text-white border-zinc-900" 
                    : "bg-white text-zinc-600 border-zinc-200"
                }`}
              >
                English
              </button>
            </div>

            <div className="mt-2 flex flex-col items-center gap-4">
              <a
                href={phoneHref}
                className="text-lg font-semibold text-zinc-900"
              >
                {phoneDisplay}
              </a>
              <Link
                href="/#contact"
                className="w-full text-center rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-sm active:bg-zinc-800"
                onClick={() => setMenuOpen(false)}
              >
                {t('quote')}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
