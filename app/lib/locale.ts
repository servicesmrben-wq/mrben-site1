import { cookies, headers } from "next/headers";

export type Locale = "fr" | "en";

export function getLocaleFromRequest(): Locale {
  const c = cookies().get("mrben_locale")?.value;
  if (c === "en" || c === "fr") return c;

  // Fallback: Accept-Language header
  const al = headers().get("accept-language") || "";
  return al.toLowerCase().includes("en") ? "en" : "fr";
}
