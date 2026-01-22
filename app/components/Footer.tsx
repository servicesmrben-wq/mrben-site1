import Link from "next/link";

type FooterProps = {
  privacyHref: string;
  privacyLabel: string;
};

export default function Footer({ privacyHref, privacyLabel }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
        <span className="font-semibold text-zinc-900">MrBen.ca</span>
        <Link
          href={privacyHref}
          className="text-xs font-medium text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline"
        >
          {privacyLabel}
        </Link>
      </div>
    </footer>
  );
}
