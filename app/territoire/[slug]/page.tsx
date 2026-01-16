export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>territoire dynamic OK</h1>
      <div>slug: {params.slug}</div>
    </main>
  );
}
