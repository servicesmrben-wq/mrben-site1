const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function getAbsoluteUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(cleanPath, `${SITE_URL}/`).toString();
}

export function getLocalBusinessProvider() {
  return {
    "@type": "LocalBusiness",
    "@id": getAbsoluteUrl("/#localbusiness"),
    name: "MrBen.ca",
    url: getAbsoluteUrl("/"),
    telephone: "514-699-7145",
    email: "service@mrben.ca",
    logo: getAbsoluteUrl("/brand/mrben-logo.png"),
    image: getAbsoluteUrl("/hero.jpg"),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lachute",
      addressRegion: "QC",
      postalCode: "J8H",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.767731,
      longitude: -74.250247,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        opens: "06:30",
        closes: "21:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/MrBenLavagedeVitres",
      "https://maps.app.goo.gl/82eQKhoEpkAHebBS9",
      "https://www.yellowpages.ca/bus/Quebec/Lachute/MrBen-ca-Lavage-de-Vitres-Gouttieres/100668164.html"
    ],
  };
}

export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}
