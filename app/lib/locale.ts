import { cookies, headers } from "next/headers";

export type Locale = "fr" | "en";

export async function getLocaleFromRequest(): Promise<Locale> {
  const cookieStore = await cookies();
  const c = cookieStore.get("mrben_locale")?.value;
  if (c === "en" || c === "fr") return c;

  // Fallback: Accept-Language header
  const h = await headers();
  const al = h.get("accept-language") || "";
  return al.toLowerCase().includes("en") ? "en" : "fr";
}
