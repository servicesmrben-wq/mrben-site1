import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocaleFromRequest } from "./lib/locale";
import Header from "./components/Header";
import { LocaleProvider } from "./components/LocaleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "MrBen.ca",
    template: "%s | MrBen.ca",
  },
  description: "Professional window cleaning, gutter cleaning, and exterior washing",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon-180x180.png",
  },
};




export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromRequest();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          <Header />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
