import { getAllBlogPosts } from "@/lib/marketing/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Resume Studio",
  description:
    "Product updates, job search strategy, and why we're building a different kind of resume tool.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Blog
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Updates from the team building the application OS for serious job
            searches.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-[0_8px_26px_rgba(15,17,22,0.06)]"
            >
              <time
                dateTime={post.publishedAt}
                className="text-xs font-semibold uppercase tracking-wide text-[#8A92A0]"
              >
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-accent hover:text-[#1E54E6]"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
