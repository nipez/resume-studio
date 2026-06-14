export const SITE_NAME = "Resume Studio";

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FEATURES = [
  {
    title: "Resume Library",
    description:
      "Keep multiple resume cuts for different roles. Duplicate, edit, and set your default starting point.",
    icon: "library" as const,
  },
  {
    title: "Tailor to a Job",
    description:
      "Paste a job description and generate a role-specific version with match notes — without touching your master resume.",
    icon: "target" as const,
  },
  {
    title: "Cover Letter",
    description:
      "Write a tight, editable cover letter in your voice from your resume and the job posting.",
    icon: "mail" as const,
  },
  {
    title: "Application Q&A",
    description:
      "Answer application questions one-by-one or all at once, then copy what you need.",
    icon: "chat" as const,
  },
  {
    title: "Applications",
    description:
      "Track every application with status, timeline, and snapshots of exactly what you sent.",
    icon: "briefcase" as const,
  },
  {
    title: "Insights",
    description:
      "See your pipeline funnel, upcoming events, and what's getting interviews.",
    icon: "chart" as const,
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Import or build your master resume",
    description:
      "Upload a PDF, paste text, or use the guided builder to create your starting point.",
  },
  {
    step: "02",
    title: "Tailor to each role",
    description:
      "Drop in a job description. AI reframes your real experience — never invents credentials.",
  },
  {
    step: "03",
    title: "Send and snapshot everything",
    description:
      "Log applications with the exact resume, cover letter, and Q&A you submitted.",
  },
  {
    step: "04",
    title: "Learn what gets interviews",
    description:
      "Track your pipeline and compare what worked across applications over time.",
  },
];

export const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "during beta",
    description: "Everything you need to run your job search in one place.",
    features: [
      "Unlimited resume versions",
      "AI tailoring & cover letters",
      "Application tracking",
      "Insights & interview prep",
      "Magic-link sign in",
    ],
    cta: "Get started free",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    period: "",
    description: "Advanced features for power users and coaches.",
    features: [
      "Priority AI processing",
      "PDF storage & sharing",
      "Email reminders",
      "Team workspaces",
      "Early access to new features",
    ],
    cta: "Join the waitlist",
    highlighted: false,
  },
];

export const FAQ_ITEMS = [
  {
    question: "Does Resume Studio invent experience I don't have?",
    answer:
      "No. Tailoring and AI drafts only reframe your real input. The prompts explicitly forbid fabricating credentials, roles, or metrics.",
  },
  {
    question: "What happens to my data when I update my master resume?",
    answer:
      "Past applications keep immutable snapshots of what you sent. Your insights stay truthful even as your master resume evolves.",
  },
  {
    question: "How do I sign in?",
    answer:
      "Email magic link — no password. Enter your email, click the link, and you're in. Google sign-in is coming soon.",
  },
  {
    question: "Can I export PDFs?",
    answer:
      "Yes. Three print-ready templates (Classic, Two-Column, Editorial) with one-click PDF export for resumes and cover letters.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your data is stored in Supabase with row-level security. You only ever see your own resumes, applications, and drafts.",
  },
  {
    question: "What AI model does Resume Studio use?",
    answer:
      "Server-side calls to Anthropic Claude with a real token budget — so tailoring doesn't need the awkward chunking hacks of browser-only tools.",
  },
];
