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
  let digits = value.replace(/\D/g, "");

  // If starts with 1 and has 11 digits (e.g. 15145555555), strip the 1
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};
