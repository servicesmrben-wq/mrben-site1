"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/navigation"; // Use custom Link
import { Phone, Mail, Star } from "lucide-react";

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
  email: "service@mrben.ca",
  googleReviewsUrl: "https://maps.app.goo.gl/tDWmLSud1LPRVFBLA",
};

const Footer = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Footer'); // Assuming 'Footer' namespace in your translation files

  const isLevis = pathname === "/levis";
  const phoneDisplay = isLevis ? "418-741-2217" : BRAND.phoneDisplay;
  const phoneHref = isLevis ? "tel:+14187412217" : BRAND.phoneHref;

  const services = [
    {
      href: locale === "fr" ? "/services/lavage-de-vitres" : "/services/window-cleaning",
      text: t('services.vitres')
    },
    {
      href: locale === "fr" ? "/services/nettoyage-de-gouttieres" : "/services/gutter-cleaning",
      text: t('services.gouttieres')
    },
    {
      href: locale === "fr" ? "/services/nettoyage-de-revetement" : "/services/siding-cleaning",
      text: t('services.pression')
    },
  ];

  const territories = [
    { href: "/territoire/lachute", text: t('territories.lachute') },
    { href: "/territoire/saint-jerome", text: t('territories.stJerome') },
    { href: "/territoire/mirabel", text: t('territories.mirabel') },
    { href: "/territoire/blainville", text: t('territories.blainville') },
  ];

  return (
    <footer className="bg-zinc-100 border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-lg font-semibold text-zinc-900">{BRAND.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800">{t('company')}</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800">{t('nav.services')}</h4>
            <ul className="mt-4 space-y-2">
              {services.map((service) => (
                <li key={service.text}>
                  <Link href={service.href} className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
                    {service.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800">{t('nav.territory')}</h4>
            <ul className="mt-4 space-y-2">
              {territories.map((city) => (
                <li key={city.href}>
                  <Link href={city.href} className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline">
                    {city.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800">{t('contact')}</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-500" />
                <a href={phoneHref} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-500" />
                <a href={`mailto:${BRAND.email}`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-zinc-500" />
                <a href={BRAND.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('reviewLink')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. {t('rights')}</p>
          <p className="mt-1">
            <Link href={locale === "fr" ? "/confidentialite" : "/privacy-policy"} className="hover:underline">
              {t('privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
