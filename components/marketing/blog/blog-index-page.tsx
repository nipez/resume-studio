import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { getAllBlogPosts } from "@/lib/marketing/blog";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";

export function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="marketing-home">
      <section className="sub-hero">
        <div className="wrap">
          <Reveal className="sub-hero-inner center">
            <span className="eyebrow">Blog</span>
            <h1>
              Updates from the <span className="serif-i">team</span>
            </h1>
            <p className="sub-hero-sub">
              Product updates, job search strategy, and why we&apos;re building
              a different kind of resume tool.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="blog-list">
            {posts.map((post, index) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card-meta">
                  <span className="blog-card-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  Read more →
                </Link>
              </article>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
