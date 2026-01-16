import type { Metadata } from "next";

type Params = { slug: string };

type PageProps = {
  params: Promise<Params> | Params;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  return {
    title: `Territoire ${p.slug}`,
  };
}

export default async function Page({ params }: PageProps) {
  const p = await params;
  return (
    <main style={{ padding: 24 }}>
      <h1>territoire dynamic OK</h1>
      <div>slug: {p.slug}</div>
    </main>
  );
}
