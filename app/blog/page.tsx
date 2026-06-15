import { BlogIndexPage } from "@/components/marketing/blog/blog-index-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Blog — ${SITE_NAME}`,
  description:
    "Product updates, job search strategy, and why we're building a different kind of resume tool.",
};

export default function BlogIndexRoute() {
  return (
    <main>
      <BlogIndexPage />
    </main>
  );
}
