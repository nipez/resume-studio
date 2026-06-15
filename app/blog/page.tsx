import { getAllBlogPosts } from "@/lib/marketing/blog";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Blog — ${SITE_NAME}`,
  description:
    "Product updates, job search strategy, and why we're building a different kind of resume tool.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF3FF] via-white to-page" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Blog
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Blog
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            Updates from the team building the application OS for serious job
            searches.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex flex-col gap-6">
          {posts.map((post, i) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-2xl border border-border bg-white transition hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_14px_36px_rgba(47,107,255,0.08)]"
            >
              <div className="h-1 bg-gradient-to-r from-accent to-[#7A53FF] opacity-0 transition group-hover:opacity-100" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF3FF] font-display text-[11px] font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
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
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
