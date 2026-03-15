import { getPostData, getSortedPostsData } from "@/app/lib/blog";
import { getLocale } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { locales } from "@/navigation";
import Image from "next/image";

type Params = {
  slug: string;
  locale: string;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) => {
    const posts = getSortedPostsData(locale);
    return posts.map((post) => ({
      locale,
      slug: post.slug,
    }));
  });
}

export default async function BlogPostPage({ params: rawParams }: { params: Promise<Params> | Params }) {
  const { slug, locale } = await rawParams;
  let post;
  try {
    post = await getPostData(slug, locale);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return (
      <main className="min-h-screen bg-white text-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-2xl font-bold text-red-600">Error loading post</h1>
          <p className="mt-4 text-zinc-700">A problem occurred while trying to load the blog post. This is likely due to an issue with finding the post file.</p>
          <pre className="mt-4 whitespace-pre-wrap bg-zinc-100 p-4 text-sm text-red-800 rounded-lg">
            {errorMessage}
          </pre>
        </div>
      </main>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <article>
        <header className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <p className="text-sm font-semibold text-zinc-500">
              {formatDate(post.date)}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-12">
          {post.thumbnail && (
            <div className="relative mb-10 h-64 w-full overflow-hidden rounded-3xl sm:h-[400px]">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          {/* Add basic prose styling for markdown content */}
          <div className="prose prose-zinc max-w-none lg:prose-lg">
             <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}

