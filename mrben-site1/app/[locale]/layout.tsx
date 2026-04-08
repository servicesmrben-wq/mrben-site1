import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
      <Header />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
