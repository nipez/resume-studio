import type {
  AppInsight,
  AppPrep,
  ApplicationAnswer,
  ApplicationStatus,
  HiringContact,
  StatusHistoryEntry,
} from "@/lib/applications/types";
import type { ResumeData, TemplateStyle } from "@/lib/types/resume";

export const DEMO_PERSONA = {
  fullName: "Alex Rivera",
  email: "alex.rivera@demo.resumetrakr.local",
  label: "Alex Rivera · PM search",
  positioning:
    "Position me as a product-minded operator who turns ambiguous customer problems into shipped features. Emphasize cross-functional leadership, data-informed decisions, and 0→1 launches — not just marketing campaigns.",
} as const;

export type DemoResumeSeed = {
  key: string;
  name: string;
  templateStyle: TemplateStyle;
  tailoredFor?: { role: string; company: string; depth: "light" | "full" };
  data: ResumeData;
};

export type DemoCoverLetterSeed = {
  key: string;
  title: string;
  role: string;
  company: string;
  resumeKey: string;
  body: string;
};

export type DemoApplicationSeed = {
  key: string;
  role: string;
  company: string;
  jobDesc: string;
  jobUrl: string;
  resumeKey: string;
  coverLetter: string;
  answers: ApplicationAnswer[];
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  insight: AppInsight;
  prep: AppPrep | null;
  hiringContacts: HiringContact[] | null;
  notes: string;
  daysAgo: number;
  events: {
    type: "interview" | "followup" | "note";
    title: string;
    daysFromNow: number;
    time: string;
    notes: string;
    done: boolean;
  }[];
};

const alexBase: ResumeData = {
  name: "Alex Rivera",
  headline: "Product Marketing Manager · SaaS & B2B",
  phone: "(415) 555-0198",
  email: "alex.rivera@demo.resumetrakr.local",
  location: "Oakland, CA",
  linkedin: "linkedin.com/in/alexrivera-pm",
  summary:
    "Product marketing leader with 6+ years turning customer insight into launches that move revenue. Known for crisp positioning, cross-functional execution with PM and eng, and building repeatable GTM playbooks across PLG and sales-led motions.",
  skills: [
    "Product Strategy",
    "Go-to-Market",
    "User Research",
    "SQL & Amplitude",
    "A/B Testing",
    "Positioning",
    "Cross-Functional Leadership",
    "Figma",
    "Sales Enablement",
    "Customer Discovery",
  ],
  experience: [
    {
      company: "Lattice",
      title: "Senior Product Marketing Manager",
      dates: "2022 – Present",
      blurb:
        "Own positioning and launch for performance and engagement products on a $200M ARR HR platform.",
      bullets: [
        "Led repositioning of Goals & OKRs module; contributed to 18% uplift in expansion pipeline within two quarters.",
        "Partnered with PM on discovery for manager-coaching workflows; shipped MVP adopted by 2,400 teams in 90 days.",
        "Built launch playbooks reused by 4 product lines; cut average launch prep from 6 weeks to 3.",
        "Ran win/loss and churn interviews; insights directly shaped roadmap prioritization for H2.",
      ],
    },
    {
      company: "Notion",
      title: "Product Marketing Manager",
      dates: "2019 – 2022",
      blurb: "First PMM on the growth team; focused on activation, templates, and team adoption.",
      bullets: [
        "Launched template gallery revamp driving 31% increase in team workspace creation among new signups.",
        "Co-authored onboarding experiments with growth PM; improved week-1 activation by 12 points.",
        "Created sales enablement for enterprise pilots; supported $4.2M influenced ARR in first year.",
        "Facilitated monthly customer advisory sessions feeding backlog for collaboration features.",
      ],
    },
    {
      company: "Segment",
      title: "Marketing Associate → PMM",
      dates: "2017 – 2019",
      blurb: "Promoted after owning developer-focused content and early persona work for data teams.",
      bullets: [
        "Developed technical persona narratives used across product, sales, and CS for 18 months.",
        "Partnered with PM on Connections launch; owned messaging, docs, and launch analytics.",
        "Built competitive battlecards adopted by 60+ AEs; shortened ramp for new reps by ~2 weeks.",
      ],
    },
  ],
  education: [
    {
      school: "UC Berkeley",
      degree: "B.A. Economics",
      year: "2017",
    },
  ],
};

export const DEMO_RESUMES: DemoResumeSeed[] = [
  {
    key: "master",
    name: "Master — PMM",
    templateStyle: "twocol",
    data: { ...alexBase, accentColor: "#2F6BFF" },
  },
  {
    key: "stripe-pm",
    name: "PM — Stripe",
    templateStyle: "classic",
    tailoredFor: { role: "Product Manager", company: "Stripe", depth: "full" },
    data: {
      ...alexBase,
      headline: "Product Manager · Payments & Platform",
      summary:
        "Operator with PMM roots who ships customer-facing products in complex B2B platforms. Combines qualitative discovery, metric-driven iteration, and tight eng partnership — now targeting core product ownership.",
      skills: [
        "Product Discovery",
        "Roadmapping",
        "SQL",
        "API Products",
        "Experimentation",
        "Stakeholder Management",
        "Payments",
        "Developer Experience",
        "Figma",
        "Launch Strategy",
      ],
      experience: alexBase.experience.map((exp, i) =>
        i === 0
          ? {
              ...exp,
              title: "Senior Product Marketing Manager (PM partner)",
              bullets: [
                "Co-owned roadmap for manager workflows with PM counterpart; shipped 3 features used by 40% of paid accounts.",
                "Ran 40+ customer interviews/quarter; translated themes into PRDs and success metrics.",
                "Defined north-star metrics for engagement pod; built Amplitude dashboards used in weekly reviews.",
                "Led cross-functional bet on coaching UX; coordinated eng, design, CS, and sales enablement.",
              ],
            }
          : exp
      ),
      accentColor: "#635BFF",
    },
  },
  {
    key: "notion-pm",
    name: "PM — Notion (Growth)",
    templateStyle: "editorial",
    tailoredFor: { role: "Product Manager", company: "Notion", depth: "full" },
    data: {
      ...alexBase,
      headline: "Product Manager · Growth & Activation",
      summary:
        "Growth-oriented PM with deep activation expertise from Notion's expansion phase. Thrives on experimentation, onboarding systems, and connecting qualitative insight to shippable increments.",
      skills: [
        "Growth PM",
        "Activation",
        "Experiment Design",
        "Amplitude",
        "Onboarding",
        "PLG",
        "User Research",
        "Roadmapping",
        "Cross-Functional Leadership",
        "Copy & UX",
      ],
      accentColor: "#191919",
    },
  },
  {
    key: "figma-pm",
    name: "PM — Figma",
    templateStyle: "twocol",
    tailoredFor: { role: "Product Manager", company: "Figma", depth: "light" },
    data: {
      ...alexBase,
      headline: "Product Manager · Collaboration & Design Tools",
      summary:
        "Cross-functional leader who has shipped collaboration features and understands design-adjacent users. Brings PMM storytelling plus hands-on discovery habits.",
      accentColor: "#A259FF",
    },
  },
  {
    key: "startup-gtm",
    name: "Head of Marketing — Series B",
    templateStyle: "classic",
    tailoredFor: {
      role: "Head of Marketing",
      company: "Series B SaaS",
      depth: "light",
    },
    data: {
      ...alexBase,
      headline: "Head of Marketing · B2B SaaS",
      summary:
        "Full-funnel marketing leader who has built launch systems at scale-stage companies. Comfortable owning brand, demand, and product marketing until the team grows.",
      skills: [
        "Demand Gen",
        "Product Marketing",
        "Brand",
        "Content Strategy",
        "Sales Enablement",
        "Budget Ownership",
        "Team Building",
        "Analytics",
        "Positioning",
        "Events",
      ],
      accentColor: "#0E7C4B",
    },
  },
];

export const DEMO_COVER_LETTERS: DemoCoverLetterSeed[] = [
  {
    key: "stripe",
    title: "Stripe — Product Manager",
    role: "Product Manager",
    company: "Stripe",
    resumeKey: "stripe-pm",
    body: `Dear Stripe Hiring Team,

I'm applying for the Product Manager role on the Connect team. At Lattice I have spent the last two years acting as the PMM half of a PM/PMM pair — running discovery, defining success metrics, and shipping manager-coaching workflows used by thousands of teams. That work taught me how to navigate ambiguity in a platform business where every feature touches billing, permissions, and third-party developers.

What draws me to Stripe is the bar for craft on developer-facing products. My Segment years gave me fluency in technical personas and API launches; more recently I partnered with eng on instrumentation and experimentation habits that mirror how Stripe teams operate. I would bring a customer narrative instinct plus the operational discipline to prioritize ruthlessly on a mature platform.

I'd welcome the chance to discuss how my launch and discovery background translates to owning Connect outcomes end-to-end.

Best,
Alex Rivera`,
  },
  {
    key: "notion",
    title: "Notion — Growth PM",
    role: "Product Manager, Growth",
    company: "Notion",
    resumeKey: "notion-pm",
    body: `Dear Notion team,

Returning to Notion as a PM would feel like a homecoming. I joined as employee #180 on growth PMM and left proud of the activation wins we stacked — template gallery, onboarding experiments, and enterprise pilot enablement. I'm now looking to own the product decisions behind those levers, not just the story.

My Lattice experience deepened my PM instincts: quarterly customer advisory boards, PRD collaboration, and metric ownership. I still follow Notion's team collaboration bets closely and believe my blend of growth intuition and platform PM discipline fits the Growth PM opening.

Thank you for considering my application.

Alex`,
  },
  {
    key: "linear",
    title: "Linear — Product Manager",
    role: "Product Manager",
    company: "Linear",
    resumeKey: "figma-pm",
    body: `Hi Linear team,

I'm a PMM-turned-PM-candidate who cares deeply about tools builders actually enjoy. Linear's opinionated UX is the kind of product culture I want to contribute to — small teams, high craft, fast cycles.

At Lattice I ship features with eng and design weekly, not quarterly. I'd love to bring that pace plus my research habits to Linear's issue tracking roadmap.

Alex Rivera`,
  },
  {
    key: "generic-startup",
    title: "Series B — Head of Marketing",
    role: "Head of Marketing",
    company: "Acme Analytics",
    resumeKey: "startup-gtm",
    body: `Dear Acme founders,

You're at the stage where marketing can't be a side quest. I've built launch systems at Notion and Lattice and am ready to be player-coach — owning positioning, demand, and the first PMM hire.

Happy to share how I'd structure the first 90 days if helpful.

Alex`,
  },
];

export const DEMO_APPLICATIONS: DemoApplicationSeed[] = [
  {
    key: "stripe",
    role: "Product Manager, Connect",
    company: "Stripe",
    jobUrl: "https://stripe.com/jobs/listing/product-manager-connect",
    jobDesc:
      "Own roadmap for Stripe Connect — payouts, onboarding, and platform tooling. Partner with eng, design, data, and GTM. 5+ years product experience preferred; payments a plus.",
    resumeKey: "stripe-pm",
    coverLetter: DEMO_COVER_LETTERS[0].body,
    answers: [
      {
        q: "Tell us about a product you shipped from discovery to launch.",
        a: "At Lattice I co-led manager-coaching workflows: 35 customer interviews surfaced that managers wanted in-flow nudges, not another dashboard. We scoped an MVP with eng, defined activation + retention metrics, and shipped in 11 weeks. 2,400 teams adopted in 90 days; expansion pipeline attributed to the module rose 18% over two quarters.",
      },
    ],
    status: "interview",
    statusHistory: [
      { status: "applied", at: "2026-03-28T10:00:00.000Z" },
      { status: "response", at: "2026-04-02T15:30:00.000Z" },
      { status: "interview", at: "2026-04-08T09:00:00.000Z" },
    ],
    insight: {
      fitScore: 82,
      strengths: [
        "Resume reframes PMM work as PM partnership — matches Connect's cross-functional bar.",
        "Segment background covers developer/API fluency the JD mentions.",
        "Cover letter names Connect specifically and cites platform experience.",
      ],
      gaps: [
        "No direct payments domain experience called out — add any touchpoints with billing or payouts.",
        "JD asks for 5+ years PM; you're positioning a transition — address it explicitly in Q&A.",
      ],
      advice:
        "Add one bullet on metric ownership (north-star definition, experiment readouts) to strengthen the PM signal.",
    },
    prep: {
      questions: [
        "Walk me through how you'd prioritize Connect roadmap themes with incomplete data.",
        "Describe a time you disagreed with eng on scope — how did you resolve it?",
        "How would you measure success for a platform onboarding redesign?",
        "Tell me about a launch that underperformed. What did you change?",
      ],
      talkingPoints: [
        "Lattice manager-coaching bet: discovery → MVP → adoption metrics.",
        "Notion activation experiments — hypothesis, ship, readout cadence.",
        "Why Connect: platform dynamics mirror HR platform complexity.",
      ],
      ask: [
        "How does Connect balance platform flexibility vs. opinionated defaults?",
        "What does the PM/PMM split look like on this team today?",
      ],
    },
    hiringContacts: [
      {
        name: "Jordan Lee",
        title: "Director, Product — Connect",
        rationale: "Listed as hiring manager on the posting; likely final decision maker.",
        confidence: "high",
      },
      {
        name: "Samira Patel",
        title: "Product Manager, Connect Onboarding",
        rationale: "Public LinkedIn post about growing the Connect PM team.",
        confidence: "medium",
      },
    ],
    notes: "Recruiter screen went well — HM loop scheduled.",
    daysAgo: 18,
    events: [
      {
        type: "interview",
        title: "HM round — Connect",
        daysFromNow: 3,
        time: "10:00 AM",
        notes: "Prep deck + customer story ready",
        done: false,
      },
      {
        type: "followup",
        title: "Thank-you note to recruiter",
        daysFromNow: -2,
        time: "",
        notes: "Sent",
        done: true,
      },
    ],
  },
  {
    key: "notion",
    role: "Product Manager, Growth",
    company: "Notion",
    jobUrl: "https://www.notion.so/careers",
    jobDesc:
      "Drive activation and retention for Notion's self-serve motion. Experimentation-heavy role; former Notionites welcome.",
    resumeKey: "notion-pm",
    coverLetter: DEMO_COVER_LETTERS[1].body,
    answers: [],
    status: "offer",
    statusHistory: [
      { status: "applied", at: "2026-02-10T10:00:00.000Z" },
      { status: "response", at: "2026-02-14T11:00:00.000Z" },
      { status: "interview", at: "2026-02-22T09:00:00.000Z" },
      { status: "offer", at: "2026-03-05T16:00:00.000Z" },
    ],
    insight: {
      fitScore: 91,
      strengths: [
        "Former Notion PMM — insider context on activation levers.",
        "Resume version is tightly aligned to growth experimentation language.",
        "Strong narrative in cover letter about returning as a PM.",
      ],
      gaps: [
        "Competing offer timeline may pressure decision — keep notes updated.",
      ],
      advice:
        "This is your strongest fit — prioritize HM references from former Notion colleagues.",
    },
    prep: null,
    hiringContacts: [
      {
        name: "Elena Vasquez",
        title: "Head of Growth Product",
        rationale: "Author of the Greenhouse posting.",
        confidence: "high",
      },
    ],
    notes: "Verbal offer $198k + equity. Negotiating start date.",
    daysAgo: 52,
    events: [],
  },
  {
    key: "figma",
    role: "Product Manager",
    company: "Figma",
    jobUrl: "https://www.figma.com/careers/",
    jobDesc: "PM for collaboration features. Design-tool empathy required.",
    resumeKey: "figma-pm",
    coverLetter: "",
    answers: [
      {
        q: "Why Figma?",
        a: "I've spent my career on tools teams use daily. Figma sets the bar for craft and I want to work where design and eng debate shows up in the pixels.",
      },
    ],
    status: "response",
    statusHistory: [
      { status: "applied", at: "2026-04-01T10:00:00.000Z" },
      { status: "response", at: "2026-04-10T14:00:00.000Z" },
    ],
    insight: {
      fitScore: 74,
      strengths: [
        "Collaboration feature language from Lattice maps to Figma's domain.",
        "Light tailoring still hits design-tool adjacency.",
      ],
      gaps: [
        "No cover letter submitted — add one before phone screen.",
        "Resume lacks explicit Figma/user research method callouts.",
      ],
      advice: "Send a short cover letter tying Lattice coaching UX to multiplayer collaboration problems.",
    },
    prep: {
      questions: [
        "How do you work with designers day to day?",
        "Tell me about a feature you killed after discovery.",
      ],
      talkingPoints: ["Coaching UX cross-functional story", "Notion template gallery UX"],
      ask: ["How does PM partner with Design on bet sizing?"],
    },
    hiringContacts: null,
    notes: "Recruiter call Thursday.",
    daysAgo: 12,
    events: [
      {
        type: "followup",
        title: "Recruiter phone screen",
        daysFromNow: 5,
        time: "2:00 PM",
        notes: "",
        done: false,
      },
    ],
  },
  {
    key: "linear",
    role: "Product Manager",
    company: "Linear",
    jobUrl: "https://linear.app/careers",
    jobDesc: "Small team, high craft. Issue tracking and builder workflows.",
    resumeKey: "figma-pm",
    coverLetter: DEMO_COVER_LETTERS[2].body,
    answers: [],
    status: "applied",
    statusHistory: [{ status: "applied", at: "2026-04-12T10:00:00.000Z" }],
    insight: {
      fitScore: 69,
      strengths: ["Cover letter shows authentic product taste.", "Startup pace matches Lattice shipping cadence."],
      gaps: ["Issue tracking domain not addressed.", "Resume still PMM-heavy in first role title."],
      advice: "Tailor headline to 'Product Manager' and add a bullet about working in weekly ship cycles.",
    },
    prep: null,
    hiringContacts: null,
    notes: "",
    daysAgo: 8,
    events: [],
  },
  {
    key: "airtable",
    role: "Senior Product Manager",
    company: "Airtable",
    jobUrl: "https://airtable.com/careers",
    jobDesc: "Own workflow automation surfaces for ops teams.",
    resumeKey: "master",
    coverLetter: "",
    answers: [],
    status: "ghosted",
    statusHistory: [{ status: "applied", at: "2026-01-20T10:00:00.000Z" }],
    insight: {
      fitScore: 58,
      strengths: ["HR platform experience loosely maps to ops workflows."],
      gaps: [
        "Master resume not tailored — weak keyword overlap with automation JD.",
        "No cover letter or referrals noted.",
      ],
      advice: "For similar roles, use a tailored version emphasizing workflow builder launches.",
    },
    prep: null,
    hiringContacts: null,
    notes: "Applied cold. No response after 8 weeks.",
    daysAgo: 75,
    events: [],
  },
  {
    key: "ramp",
    role: "Product Manager",
    company: "Ramp",
    jobUrl: "https://ramp.com/careers",
    jobDesc: "Fintech PM — spend management and approvals.",
    resumeKey: "stripe-pm",
    coverLetter: "",
    answers: [],
    status: "rejected",
    statusHistory: [
      { status: "applied", at: "2026-02-28T10:00:00.000Z" },
      { status: "response", at: "2026-03-05T10:00:00.000Z" },
      { status: "interview", at: "2026-03-12T10:00:00.000Z" },
      { status: "rejected", at: "2026-03-20T10:00:00.000Z" },
    ],
    insight: {
      fitScore: 71,
      strengths: ["Stripe-tailored resume signals fintech curiosity.", "Got to onsite — materials were good enough."],
      gaps: ["Feedback: wanted deeper eng partnership examples.", "Payments depth still thin."],
      advice: "Capture Ramp feedback in notes; reuse eng partnership stories for Stripe loop.",
    },
    prep: null,
    hiringContacts: null,
    notes: "Rejected after onsite — 'other candidates with direct PM tenure.'",
    daysAgo: 45,
    events: [],
  },
  {
    key: "asana",
    role: "Product Marketing Manager",
    company: "Asana",
    jobUrl: "https://asana.com/jobs",
    jobDesc: "PMM for work management — classic fit for background.",
    resumeKey: "master",
    coverLetter: "",
    answers: [],
    status: "interview",
    statusHistory: [
      { status: "applied", at: "2026-03-15T10:00:00.000Z" },
      { status: "response", at: "2026-03-20T10:00:00.000Z" },
      { status: "interview", at: "2026-04-01T10:00:00.000Z" },
    ],
    insight: {
      fitScore: 88,
      strengths: ["Master resume is a natural PMM match.", "Lattice + Notion brands resonate."],
      gaps: ["Role is PMM not PM — decide if you want to dilute PM search focus."],
      advice: "Use as backup path; keep PM narrative primary in networking.",
    },
    prep: {
      questions: ["Walk me through a launch end-to-end.", "How do you work with PM on roadmap?"],
      talkingPoints: ["Goals & OKRs repositioning", "Template gallery launch"],
      ask: ["How is PMM scoped vs PM on work graph bets?"],
    },
    hiringContacts: null,
    notes: "Backup PMM path — panel next week.",
    daysAgo: 30,
    events: [
      {
        type: "interview",
        title: "PMM panel",
        daysFromNow: 7,
        time: "11:30 AM",
        notes: "Prepare launch case study",
        done: false,
      },
    ],
  },
  {
    key: "intercom",
    role: "Product Manager",
    company: "Intercom",
    jobUrl: "https://www.intercom.com/careers",
    jobDesc: "PM for AI agent workflows in customer support.",
    resumeKey: "notion-pm",
    coverLetter: "",
    answers: [
      {
        q: "Experience with AI products?",
        a: "At Lattice I partnered on AI-assisted coaching suggestions — defined guardrails, eval criteria, and rollout stages with eng. Not training models, but shipping AI UX responsibly.",
      },
    ],
    status: "response",
    statusHistory: [
      { status: "applied", at: "2026-04-05T10:00:00.000Z" },
      { status: "response", at: "2026-04-11T10:00:00.000Z" },
    ],
    insight: {
      fitScore: 76,
      strengths: ["AI coaching story maps to agent workflows JD.", "Strong Q&A on AI guardrails."],
      gaps: ["Cover letter missing.", "Support domain knowledge not established."],
      advice: "Add one line on customer support exposure (CS partnership at Lattice).",
    },
    prep: null,
    hiringContacts: null,
    notes: "HM intro scheduled.",
    daysAgo: 10,
    events: [],
  },
  {
    key: "acme",
    role: "Head of Marketing",
    company: "Acme Analytics",
    jobUrl: "https://example.com/acme/jobs/hom",
    jobDesc: "First marketing leader at Series B analytics startup.",
    resumeKey: "startup-gtm",
    coverLetter: DEMO_COVER_LETTERS[3].body,
    answers: [],
    status: "applied",
    statusHistory: [{ status: "applied", at: "2026-04-14T10:00:00.000Z" }],
    insight: {
      fitScore: 85,
      strengths: ["Head of Marketing version sells player-coach experience.", "Cover letter outlines 90-day plan hook."],
      gaps: ["JD wants demand gen ownership — expand paid metrics if pursuing seriously."],
      advice: "Strong for PMM backup; less aligned with PM pivot unless you want startup GM path.",
    },
    prep: null,
    hiringContacts: [
      {
        name: "Chris Morgan",
        title: "CEO",
        rationale: "Posted role on LinkedIn directly.",
        confidence: "medium",
      },
    ],
    notes: "Networking intro from former Notion colleague.",
    daysAgo: 6,
    events: [],
  },
  {
    key: "datadog",
    role: "Product Manager",
    company: "Datadog",
    jobUrl: "https://careers.datadoghq.com/",
    jobDesc: "PM for observability workflows — technical users.",
    resumeKey: "stripe-pm",
    coverLetter: "",
    answers: [],
    status: "ghosted",
    statusHistory: [{ status: "applied", at: "2026-02-01T10:00:00.000Z" }],
    insight: {
      fitScore: 62,
      strengths: ["Segment history helps with technical persona."],
      gaps: ["Observability domain absent.", "Resume doesn't mention infra or devtools recently."],
      advice: "Only pursue with a devtools-specific tailored version.",
    },
    prep: null,
    hiringContacts: null,
    notes: "",
    daysAgo: 68,
    events: [],
  },
  {
    key: "canva",
    role: "Product Manager",
    company: "Canva",
    jobUrl: "https://www.canva.com/careers/",
    jobDesc: "Growth PM for team adoption in enterprise.",
    resumeKey: "notion-pm",
    coverLetter: "",
    answers: [],
    status: "rejected",
    statusHistory: [
      { status: "applied", at: "2026-01-08T10:00:00.000Z" },
      { status: "rejected", at: "2026-01-25T10:00:00.000Z" },
    ],
    insight: {
      fitScore: 70,
      strengths: ["Enterprise adoption story from Notion."],
      gaps: ["Rejected at resume screen — likely visa/sponsorship filter (verify)."],
      advice: "Confirm constraints before investing tailoring time.",
    },
    prep: null,
    hiringContacts: null,
    notes: "Auto-reject email.",
    daysAgo: 90,
    events: [],
  },
  {
    key: "openai",
    role: "Product Manager, ChatGPT",
    company: "OpenAI",
    jobUrl: "https://openai.com/careers",
    jobDesc: "PM for ChatGPT growth and monetization surfaces.",
    resumeKey: "notion-pm",
    coverLetter: "",
    answers: [],
    status: "applied",
    statusHistory: [{ status: "applied", at: "2026-04-15T10:00:00.000Z" }],
    insight: {
      fitScore: 73,
      strengths: ["Growth PM positioning fits monetization angle.", "AI coaching anecdote relevant."],
      gaps: ["Highly competitive — need sharper differentiation in summary.", "No referral."],
      advice: "Lead with a metric-backed growth experiment story in the first resume bullet.",
    },
    prep: null,
    hiringContacts: null,
    notes: "Stretch apply — referral requested on LinkedIn.",
    daysAgo: 5,
    events: [],
  },
];

export const DEMO_WORKSPACE = {
  jobRole: "Product Manager, Platform",
  jobCompany: "Vercel",
  jobDesc:
    "Vercel is hiring a PM to own developer platform workflows — deployments, previews, and team permissions. Looking for someone who has shipped developer-facing products and can balance power-user needs with onboarding simplicity.",
  jobUrl: "https://vercel.com/careers/product-manager-platform",
  coverText: `Dear Vercel team,

I'm tailoring my PM-focused resume for your Platform PM role. My Segment and Lattice experience includes API launches, developer docs, and instrumentation — I'd love to bring that to deployment workflows millions of developers touch daily.

Best,
Alex Rivera`,
  coverHm: "Guillermo Rauch",
  qa: [
    {
      id: "q1",
      q: "Describe a platform product decision you owned.",
      a: "At Lattice I co-owned permissions for manager-coaching features — balancing admin control vs. manager autonomy. We shipped role-based defaults with an escape hatch for enterprise admins after 12 customer calls.",
    },
    {
      id: "q2",
      q: "How do you prioritize on a developer platform?",
      a: "Mix qualitative: dev advocate tickets + join office hours, with quantitative: activation funnels on key API endpoints. At Segment I helped prioritize Connections roadmap using integration adoption curves.",
    },
  ],
};
