export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-resumetrakr",
    title: "Welcome to ResumeTrakr",
    excerpt:
      "We're building the application OS job seekers actually need — not another one-off resume generator.",
    publishedAt: "2025-06-14",
    author: "ResumeTrakr Team",
    content: `
## Why we exist

Job search is fragmented. Most people bounce between a resume builder, a keyword scanner, a spreadsheet for applications, and a doc folder for cover letters — then lose track of what they actually sent where.

**ResumeTrakr** is one calm workspace for the full loop: resume library, tailor per job, cover letters, application Q&A, tracking, and insights — with immutable snapshots of exactly what you submitted.

We're in beta now. Everything is free while we build. [Sign in](/login) and start with your resume library.

## Same name, different product

You may have noticed [resumestudio.ai](https://resumestudio.ai/) — a credit-based tool that generates a matched resume and cover letter per job posting. Same name, very different scope.

They beat us to the domain and the one-shot "paste job → download PDF" flow. That's fine. We're not trying to win on speed alone.

Here's how we're different — and why we think it matters:

### They optimize a moment. We optimize the search.

resumestudio.ai is built around credits: paste a job, upload a resume, get an optimized PDF. Useful for a single application. But there's no library of versions, no application tracker, no record of what you sent, and no way to learn across applications.

ResumeTrakr is an **application OS** — built for people running a multi-month search across dozens of roles.

### Honest AI vs. keyword stuffing

Many resume tools optimize for ATS match scores and invented metrics. Our AI is prompt-engineered to **reframe your real experience**, not fabricate roles or numbers. Your master resume stays intact; tailored versions branch off without rewriting history.

### Snapshots change everything

When you log an application in ResumeTrakr, we freeze the exact resume, cover letter, and Q&A you sent. Later, when you want insights — what worked, what didn't, which bullets correlated with interviews — that data is still tied to what you actually submitted. Competitors break this the moment your master resume changes.

### Pricing that respects unemployment

resumestudio.ai charges per credit ($5 for 10 resumes). Active job seekers burn through credits fast.

We offer:

- **Student** — $2.99/mo with guided builder for first resumes
- **Essentials** — $4.99/mo, full workspace, no AI (for people who just need structure)
- **Pro** — $19/mo with 100 AI actions per month when you need tailoring

No surprise weekly bills. No $50/mo scanner tax.

### What we're building next

This week we shipped the **Resume Library** and **Editor** — multiple versions, live preview, PDF export, and Supabase-backed persistence.

Coming soon:

- Tailor to a job (AI reframe, not fabrication)
- Cover letter + application Q&A
- Application tracking with immutable snapshots
- Cross-application insights and interview prep
- Guided builder for students and career changers

## Join us

If you're tired of juggling tools — or you've tried the credit-based generators and want something that grows with your search — we'd love your feedback.

[Create your first resume →](/login)

Questions? Reach out anytime. We're building this in public.
`.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
