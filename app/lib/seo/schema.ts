const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function getAbsoluteUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(cleanPath, `${SITE_URL}/`).toString();
}

export function getLocalBusinessProvider() {
  return {
    "@type": "LocalBusiness",
    name: "MrBen.ca",
    url: getAbsoluteUrl("/"),
    telephone: "514-699-7145",
    email: "info@mrben.ca",
    logo: getAbsoluteUrl("/brand/mrben-logo.png"),
  };
}
