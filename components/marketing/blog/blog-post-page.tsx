import Link from "next/link";
import type { BlogPost } from "@/lib/marketing/blog";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";

type BlogPostPageProps = {
  post: BlogPost;
};

function renderMarkdown(content: string) {
  const blocks = content.split("\n\n");

  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return <h2 key={i}>{block.slice(3)}</h2>;
    }

    if (block.startsWith("### ")) {
      return <h3 key={i}>{block.slice(4)}</h3>;
    }

    const parts = block.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    const children = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <Link key={j} href={href}>
            {label}
          </Link>
        );
      }

      const extLinkMatch = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      if (extLinkMatch) {
        const [, label, href] = extLinkMatch;
        return (
          <a key={j} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        );
      }

      return part;
    });

    return <p key={i}>{children}</p>;
  });
}

export function BlogPostPage({ post }: BlogPostPageProps) {
  return (
    <div className="marketing-home">
      <section>
        <div className="wrap">
          <header className="blog-article-header">
            <Link href="/blog" className="blog-back">
              ← Blog
            </Link>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1>{post.title}</h1>
            <p className="excerpt">{post.excerpt}</p>
          </header>
          <div className="blog-article-body">{renderMarkdown(post.content)}</div>
        </div>
      </section>
    </div>
  );
}
