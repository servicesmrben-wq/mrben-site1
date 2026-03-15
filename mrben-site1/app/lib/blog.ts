import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  thumbnail?: string;
}

export function getSortedPostsData(locale: string = "en"): Omit<PostData, "content">[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const filteredFiles = fileNames.filter((fileName) => fileName.endsWith(`.${locale}.md`));
  
  const allPostsData = filteredFiles.map((fileName) => {
    const slug = fileName.replace(/\.[a-z]{2}\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      title: matterResult.data.title as string,
      date: matterResult.data.date as string,
      summary: matterResult.data.summary as string,
      thumbnail: matterResult.data.thumbnail as string | undefined,
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string, locale: string = "en"): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.${locale}.md`);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      title: matterResult.data.title as string,
      date: matterResult.data.date as string,
      summary: matterResult.data.summary as string,
      content: matterResult.content,
      thumbnail: matterResult.data.thumbnail as string | undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to read post with slug '${slug}' for locale '${locale}'. Looked for file at: ${fullPath}. Original error: ${message}`);
  }
}
