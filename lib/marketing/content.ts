export const SITE_NAME = "Resume Studio";

export const SITE_TAGLINE = "The application OS";

export const SITE_DESCRIPTION =
  "The application OS for serious job searches — resume library, tailor, cover letters, Q&A, tracking, and insights in one workspace with immutable snapshots.";

export const BETA_BANNER =
  "Free during beta — all plans unlocked while we build. Pricing below is what launches at GA.";

export const NAV_LINKS = [
  { href: "/application-os", label: "Application OS" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/students", label: "Students" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
] as const;

export const HERO_STATS = [
  { value: "6", label: "Modules in the apply loop" },
  { value: "100%", label: "Snapshot fidelity" },
  { value: "$4.99", label: "Full workspace from" },
  { value: "1", label: "Login — not 5 tools" },
] as const;

export const APPLICATION_OS_LOOP = [
  {
    step: "01",
    title: "Resume Library",
    description:
      "Master resume + role-specific cuts. Duplicate, version, and set your default starting point.",
    icon: "library" as const,
    connectsTo: "Tailor",
  },
  {
    step: "02",
    title: "Tailor to a Job",
    description:
      "Paste a job description. AI reframes your real experience into a matched version — without touching your master.",
    icon: "target" as const,
    connectsTo: "Cover",
  },
  {
    step: "03",
    title: "Cover Letter",
    description:
      "Generate a tight, editable letter in your voice from the resume and posting — not generic filler.",
    icon: "mail" as const,
    connectsTo: "Q&A",
  },
  {
    step: "04",
    title: "Application Q&A",
    description:
      "Answer screening questions one-by-one or in batch. Copy what you need, keep what you wrote.",
    icon: "chat" as const,
    connectsTo: "Track",
  },
  {
    step: "05",
    title: "Applications",
    description:
      "Log every send with status, timeline, and an immutable snapshot of exactly what went out the door.",
    icon: "briefcase" as const,
    connectsTo: "Insights",
  },
  {
    step: "06",
    title: "Insights",
    description:
      "See your funnel, upcoming events, and which resume versions actually get interviews.",
    icon: "chart" as const,
    connectsTo: "Loop",
  },
] as const;

export const FRAGMENTED_STACK = [
  {
    tool: "Resume builder",
    problem: "Great PDF, zero memory of what you sent where.",
    cost: "$10–25/mo",
  },
  {
    tool: "ATS scanner",
    problem: "Keyword score, no cover letter, no tracking, no versions.",
    cost: "$50/mo",
  },
  {
    tool: "Application tracker",
    problem: "Spreadsheet of companies — not what you actually submitted.",
    cost: "$9–13/wk",
  },
  {
    tool: "Cover letter doc",
    problem: "Lost in Google Drive. Wrong version attached. Again.",
    cost: "Your sanity",
  },
  {
    tool: "AI resume generator",
    problem: "One PDF per credit. No library. No history. No learning.",
    cost: "$5 per 10 runs",
  },
] as const;

export const GENERATOR_VS_OS = [
  {
    dimension: "What you get",
    generator: "One optimized PDF per job",
    applicationOs: "Full workspace across your entire search",
  },
  {
    dimension: "Resume versions",
    generator: "Download and start over",
    applicationOs: "Library with duplicate, default, and tailor branches",
  },
  {
    dimension: "After you click send",
    generator: "Gone — no record of what you submitted",
    applicationOs: "Immutable snapshot: resume + cover + Q&A frozen",
  },
  {
    dimension: "Learning over time",
    generator: "None — each run is isolated",
    applicationOs: "Cross-application insights tied to real sends",
  },
  {
    dimension: "Pricing model",
    generator: "Credits that burn fast ($5–20 packs)",
    applicationOs: "Subscription from $2.99–$12/mo — predictable",
  },
  {
    dimension: "AI approach",
    generator: "Keyword match optimization",
    applicationOs: "Reframe real experience — never invent credentials",
  },
  {
    dimension: "Best for",
    generator: "5 quick applications",
    applicationOs: "30–100+ applications over months",
  },
] as const;

export const POSITIONING_PILLARS = [
  {
    title: "An operating system — not a one-shot generator",
    description:
      "Credit-based tools give you a PDF and move on. Resume Studio is the application OS: six connected modules from first draft to interview prep, with one login and one source of truth.",
    accent: "Application OS",
  },
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
    title: "Pricing that respects job search",
    description:
      "No $50/mo scanner tax. No credit packs that vanish in a week. A $4.99 workspace plan without AI, a $2.99 student plan, and Pro only when you need unlimited tailoring.",
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
    question: "What is an 'application OS'?",
    answer:
      "An application OS is a single system for your entire job search — not just resume generation. Resume Studio connects library, tailoring, cover letters, Q&A, application tracking, and insights in one workspace. Every send is snapshotted so you can learn what actually works over a multi-month search.",
  },
  {
    question: "How is this different from resumestudio.ai or other AI generators?",
    answer:
      "AI generators optimize one PDF per job and charge per credit. They're fast for a handful of applications. Resume Studio is built for serious searches: multiple resume versions, application tracking, immutable snapshots, and cross-app insights — with subscription pricing that doesn't punish volume.",
  },
  {
    question: "How is Resume Studio different from Teal or Jobscan?",
    answer:
      "Teal is a strong tracker + resume matcher ($9–13/week for AI). Jobscan is an ATS scanner ($50/mo). Resume Studio is the application OS that covers the full loop — tailor, cover letter, Q&A, tracking, and insights — with immutable snapshots of what you actually sent. Plus honest AI that won't invent experience.",
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
