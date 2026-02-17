export function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export const toMailto = (href: string) => {
  if (!href) return href;
  const trimmedHref = href.trim();
  const lowerHref = trimmedHref.toLowerCase();
  if (lowerHref.startsWith("mailto:") || lowerHref.startsWith("http")) return trimmedHref;
  if (!trimmedHref.includes("@")) return trimmedHref;
  return `mailto:${trimmedHref}`;
};

export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};
