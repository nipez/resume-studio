import { BlogPostPage } from "@/components/marketing/blog/blog-post-page";
import { getAllBlogPosts, getBlogPost } from "@/lib/marketing/blog";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.excerpt,
  };
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main>
      <BlogPostPage post={post} />
    </main>
  );
}
