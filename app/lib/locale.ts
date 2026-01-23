import { cookies } from "next/headers";

export type Locale = "fr" | "en";

export const DEFAULT_LOCALE: Locale = "fr";

export async function getLocaleFromRequest(): Promise<Locale> {
  const cookieStore = await cookies();
  const c = cookieStore.get("mrben_locale")?.value;
  if (c === "en" || c === "fr") return c;

  // Default to French unless the user has explicitly chosen another locale.
  return DEFAULT_LOCALE;
}
