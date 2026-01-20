import type { Locale } from "./locale";

import en from "./messages/en.json";
import fr from "./messages/fr.json";

type Messages = Record<string, unknown>;

const MESSAGES: Record<Locale, Messages> = { en, fr };

function getMessageValue(messages: Messages, key: string): string {
  const parts = key.split(".");
  let value: unknown = messages;

  for (const part of parts) {
    if (!value || typeof value !== "object" || !(part in value)) {
      return key;
    }
    value = (value as Record<string, unknown>)[part];
  }

  return typeof value === "string" ? value : key;
}

export function getTranslations(locale: Locale) {
  const messages = MESSAGES[locale] ?? MESSAGES.fr;
  return (key: string) => getMessageValue(messages, key);
}
