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
              
              var consentState = {
                ad_personalization: "denied",
                ad_storage: "denied",
                ad_user_data: "denied",
                analytics_storage: "denied",
                functionality_storage: "denied",
                personalization_storage: "denied",
                security_storage: "granted",
                wait_for_update: 500
              };

              try {
                var stored = localStorage.getItem("cookie-consent");
                if (stored) {
                  var parsed = JSON.parse(stored);
                  if (parsed && parsed.accepted === true) {
                    consentState.ad_personalization = "granted";
                    consentState.ad_storage = "granted";
                    consentState.ad_user_data = "granted";
                    consentState.analytics_storage = "granted";
                  }
                }
              } catch (e) {}

              gtag("consent", "default", consentState);
              gtag("set", "ads_data_redaction", true);
              gtag("set", "url_passthrough", false);
            `
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning translate="no">
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
