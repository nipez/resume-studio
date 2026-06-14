export const SITE_NAME = "Resume Studio";

export const BETA_BANNER =
  "Free during beta — all plans unlocked while we build. Pricing below is what launches at GA.";

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/students", label: "Students" },
  { href: "/faq", label: "FAQ" },
] as const;

export const HERO_STATS = [
  { value: "6-in-1", label: "Resume to insights" },
  { value: "3", label: "Print-ready templates" },
  { value: "$2.99", label: "Student plan from" },
  { value: "0", label: "Fabricated credentials" },
] as const;

export const POSITIONING_PILLARS = [
  {
    title: "The only app that snapshots what you sent",
    description:
      "Teal and Huntr track applications. Jobscan scores keywords. Neither freezes the exact resume, cover letter, and Q&A you submitted — so insights break when your master resume changes.",
    accent: "Snapshots",
  },
  {
    title: "AI that reframes — never invents",
    description:
      "Competitors optimize for ATS match scores and keyword stuffing. Resume Studio is prompt-engineered to reposition your real experience, not fabricate roles or metrics.",
    accent: "Honest AI",
  },
  {
    title: "The full apply loop, not just a builder",
    description:
      "Resume, tailor, cover letter, application Q&A, tracking, interview prep, and cross-application insights — one calm workspace instead of 4–5 subscriptions.",
    accent: "All-in-one",
  },
  {
    title: "Pricing that respects job search",
    description:
      "No $50/mo scanner tax. No $13/week surprise bills. A $4.99 workspace plan without AI, a $2.99 student plan, and Pro only when you need unlimited tailoring.",
    accent: "Fair pricing",
  },
] as const;

export const COMPETITOR_COMPARISON = [
  { feature: "Resume library + versions", studio: true, teal: true, jobscan: false, resumeio: true },
  { feature: "AI tailor per job description", studio: true, teal: true, jobscan: "Limited", resumeio: true },
  { feature: "Cover letter generator", studio: true, teal: true, jobscan: false, resumeio: true },
  { feature: "Application Q&A answers", studio: true, teal: false, jobscan: false, resumeio: false },
  { feature: "Immutable send snapshots", studio: true, teal: false, jobscan: false, resumeio: false },
  { feature: "Cross-app AI insights", studio: true, teal: "Partial", jobscan: false, resumeio: false },
  { feature: "Interview prep per application", studio: true, teal: false, jobscan: false, resumeio: false },
  { feature: "Student / first resume mode", studio: true, teal: false, jobscan: false, resumeio: false },
  { feature: "No-AI plan under $5/mo", studio: true, teal: false, jobscan: false, resumeio: false },
  { feature: "No trial-to-subscription trap", studio: true, teal: true, jobscan: true, resumeio: false },
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
      "Upload a PDF, paste text, or use the guided builder — built for professionals and students alike.",
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
      "Compare responded vs. no-response applications and fix your approach with data.",
  },
];

export const PRICING_PLANS = [
  {
    id: "student",
    name: "Student",
    price: "$2.99",
    period: "/month",
    description:
      "First resume? Clubs, sports, volunteering, honors — guided step-by-step.",
    features: [
      "Guided resume builder",
      "Activities & clubs sections",
      "3 print-ready templates",
      "PDF export",
      "2 AI cover letters / month",
    ],
    cta: "Start as a student",
    highlighted: false,
    badge: "High school & college",
  },
  {
    id: "essentials",
    name: "Essentials",
    price: "$4.99",
    period: "/month",
    description:
      "The full workspace without AI — cheap enough to keep through your whole search.",
    features: [
      "Unlimited resume versions",
      "Full editor + 3 templates",
      "Application tracking",
      "Timeline & reminders",
      "PDF export — no AI costs",
    ],
    cta: "Get Essentials",
    highlighted: false,
    badge: "Most affordable",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "/month",
    description:
      "Unlimited AI for active job seekers — or $39 for a 3-month Job Search Pass.",
    features: [
      "Everything in Essentials",
      "Unlimited AI tailoring",
      "Cover letters & Q&A",
      "Fit & gaps analysis",
      "Interview prep & cross-app insights",
    ],
    cta: "Go Pro",
    highlighted: true,
    badge: "Best for job search",
  },
];

export const STUDENT_HIGHLIGHTS = [
  {
    title: "No job experience? Start here.",
    description:
      "Turn NHS, varsity sports, student government, volunteering, and honors into strong bullets — without pretending you managed a P&L.",
  },
  {
    title: "Guided, not overwhelming",
    description:
      "Eight calm steps with reassuring microcopy. Save and resume anytime — built for the kid staring at a blank page.",
  },
  {
    title: "Part-time jobs & internships",
    description:
      "Cover letters and application answers tuned for entry-level roles, not executive jargon.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "I was juggling Teal for tracking, Jobscan for keywords, and a Google Doc for cover letters. Resume Studio is the first place that felt like one system.",
    name: "Jordan M.",
    role: "Product marketing · 47 applications tracked",
  },
  {
    quote:
      "My daughter had honor society and soccer captain on a sticky note. The guided builder turned it into a real resume in twenty minutes.",
    name: "Priya K.",
    role: "Parent · high school junior",
  },
  {
    quote:
      "The snapshot thing is underrated. I finally know which resume version actually got callbacks — not which one I wish I'd sent.",
    name: "Alex R.",
    role: "Operations lead · career switcher",
  },
];

export const FAQ_ITEMS = [
  {
    question: "How is Resume Studio different from Teal or Jobscan?",
    answer:
      "Teal is a strong tracker + resume matcher ($9–13/week for AI). Jobscan is an ATS scanner ($50/mo). Resume Studio covers the full loop — tailor, cover letter, Q&A, tracking, and insights — with immutable snapshots of what you actually sent. Plus honest AI that won't invent experience.",
  },
  {
    question: "Does Resume Studio invent experience I don't have?",
    answer:
      "No. Tailoring and AI drafts only reframe your real input. The prompts explicitly forbid fabricating credentials, roles, or metrics.",
  },
  {
    question: "What's the $4.99 Essentials plan for?",
    answer:
      "Job search is expensive enough. Essentials gives you the full workspace — library, editor, templates, PDF export, and application tracking — without AI. Upgrade to Pro only when you want unlimited tailoring.",
  },
  {
    question: "Is there a plan for high school students?",
    answer:
      "Yes. The $2.99/mo Student plan includes the guided builder, activities-focused sections, and light AI for cover letters. Built for first resumes with clubs, sports, and volunteering.",
  },
  {
    question: "What happens to my data when I update my master resume?",
    answer:
      "Past applications keep immutable snapshots of what you sent. Your insights stay truthful even as your master resume evolves.",
  },
  {
    question: "Can I export PDFs?",
    answer:
      "Yes. Three print-ready templates (Classic, Two-Column, Editorial) with one-click PDF export for resumes and cover letters.",
  },
];

export const GO_TO_MARKET = {
  targetSubs: 10_000,
  blendedArpu: 6.5,
  monthlyRevenueAtGoal: 65_000,
  annualRevenueAtGoal: 780_000,
};
