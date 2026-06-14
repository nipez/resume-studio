import { getAllBlogPosts, getBlogPost } from "@/lib/marketing/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} — Resume Studio`,
    description: post.excerpt,
  };
}

function renderMarkdown(content: string) {
  const blocks = content.split("\n\n");

  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="mb-4 mt-10 font-display text-2xl font-semibold tracking-tight text-ink first:mt-0"
        >
          {block.slice(3)}
        </h2>
      );
    }

    if (block.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="mb-3 mt-8 font-display text-xl font-semibold text-ink"
        >
          {block.slice(4)}
        </h3>
      );
    }

    const parts = block.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    const children = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <Link
            key={j}
            href={href}
            className="font-semibold text-accent hover:text-[#1E54E6]"
          >
            {label}
          </Link>
        );
      }
      const extLinkMatch = part.match(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/
      );
      if (extLinkMatch) {
        const [, label, href] = extLinkMatch;
        return (
          <a
            key={j}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:text-[#1E54E6]"
          >
            {label}
          </a>
        );
      }
      return part;
    });

    return (
      <p key={i} className="mb-4 text-[16px] leading-[1.75] text-muted">
        {children}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main>
      <article className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Link
            href="/blog"
            className="text-sm font-semibold text-muted transition-colors hover:text-accent"
          >
            ← Blog
          </Link>
          <time
            dateTime={post.publishedAt}
            className="mt-6 block text-xs font-semibold uppercase tracking-wide text-[#8A92A0]"
          >
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            {post.excerpt}
          </p>
        </div>
      </article>

      <div className="mx-auto max-w-3xl px-6 py-12">{renderMarkdown(post.content)}</div>
    </main>
  );
}
