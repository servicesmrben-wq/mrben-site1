import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GoogleAdsTracker from "../components/GoogleAdsTracker";
import CookieBanner from "../components/CookieBanner";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const titleText = t("metaTitle");
  const descText = t("metaDescription");
  const localePath = locale === 'fr' ? '' : '/en';
  
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: titleText,
      template: `%s | ${titleText}`,
    },
    description: descText,
    icons: {
      icon: "/favicon-32x32.png",
      apple: "/apple-touch-icon-180x180.png",
    },
    openGraph: {
      title: titleText,
      description: descText,
      url: `${BASE_URL}${localePath}`,
      siteName: "MrBen.ca",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
      images: [
        {
          url: "/hero.jpg",
          width: 1200,
          height: 630,
          alt: "MrBen.ca Cleaning Services / Services de nettoyage MrBen.ca",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descText,
      images: ["/hero.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col" key={locale}>
        <GoogleAdsTracker />
        <Header key={`header-${locale}`} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer key={`footer-${locale}`} />
      </div>
      <CookieBanner />
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-969249151"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-969249151');
        `}
      </Script>
    </NextIntlClientProvider>
  );
}
