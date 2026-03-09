import { Link } from "@/navigation";
import { getSortedPostsData } from "@/app/lib/blog";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function LevisBlogIndex({ params: rawParams }: { params: Promise<{ locale: string }> }) {
  const { locale } = await rawParams;
  const allPosts = getSortedPostsData(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8">
          {allPosts.map(({ slug, title, date, summary, thumbnail }) => (
            <article key={slug}>
              <Link href={`/levis/blog/${slug}`} className="block group">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 group-hover:border-zinc-300 transition-colors duration-200 flex flex-col md:flex-row h-full">
                  {thumbnail && (
                    <div className="relative h-48 w-full md:h-auto md:w-64 shrink-0 overflow-hidden">
                      <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col justify-center">
                    <p className="text-sm text-zinc-500">{formatDate(date)}</p>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-sky-600 transition-colors duration-200">
                      {title}
                    </h2>
                    <p className="mt-3 text-base text-zinc-600 line-clamp-3">{summary}</p>
                    <p className="mt-4 text-sm font-semibold text-sky-600 group-hover:underline">
                      {t("readMore")}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
