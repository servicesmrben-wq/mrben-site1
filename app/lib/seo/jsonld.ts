export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

