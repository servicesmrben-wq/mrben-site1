import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <Script
          id="gtag-consent"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag("consent", "default", {
                  ad_personalization: "denied",
                  ad_storage: "denied",
                  ad_user_data: "denied",
                  analytics_storage: "denied",
                  functionality_storage: "denied",
                  personalization_storage: "denied",
                  security_storage: "granted",
                  wait_for_update: 500,
              });
              gtag("set", "ads_data_redaction", true);
              gtag("set", "url_passthrough", false);
            `
          }}
        />
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="87cd4632-6174-4bb4-8b65-fc961ba5f6c1"
          data-blockingmode="auto"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning translate="no">
        {children}
      </body>
    </html>
  );
}
