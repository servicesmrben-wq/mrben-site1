import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GoogleAdsTracker from "../components/GoogleAdsTracker";
import Script from "next/script";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return {
    title: {
      default: t("metaTitle"),
      template: `%s | ${t("metaTitle")}`,
    },
    description: t("metaDescription"),
    icons: {
      icon: "/favicon-32x32.png",
      apple: "/apple-touch-icon-180x180.png",
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
      <GoogleAdsTracker />
      <Header />
      {children}
      <Footer />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-969249151"
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
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
