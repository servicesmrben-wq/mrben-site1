import type { Metadata } from "next";

import MrBenRedesignPreview from "./MrBenRedesignPreview";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr-CA": BASE_URL,
      "en-CA": BASE_URL,
      "x-default": BASE_URL,
    },
  },
};

export default function Page() {
  return <MrBenRedesignPreview />;
}
