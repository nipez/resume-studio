import { SITE_NAME, SITE_URL } from "@/lib/marketing/content";

export const LEGAL_LAST_UPDATED = "June 15, 2025";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Overview",
    paragraphs: [
      `${SITE_NAME} ("we," "us," or "our") operates ${SITE_URL} and the ${SITE_NAME} application workspace. This Privacy Policy explains what information we collect, how we use it, and the choices you have.`,
      "By using our website or signing in to the workspace, you agree to the practices described here.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: ["We collect information in three ways:"],
    bullets: [
      "Account information — when you sign in with a magic link, we store your email address and basic auth metadata through our authentication provider.",
      "Content you create — resumes, cover letters, application notes, job descriptions, and related workspace data you save in your account.",
      "Usage and technical data — pages visited, device/browser type, and diagnostic logs used to keep the service secure and reliable.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: ["We use your information to:"],
    bullets: [
      "Provide, maintain, and improve the workspace and marketing site",
      "Authenticate you and keep your account secure",
      "Generate AI-assisted drafts when you request them",
      "Respond to support requests and product feedback",
      "Send essential service messages (for example, sign-in links)",
    ],
  },
  {
    title: "AI features",
    paragraphs: [
      "When you use AI-assisted tailoring, cover letters, or Q&A, the relevant resume and job context is sent to our AI provider to generate a response. We do not use your private workspace content to train public models.",
      "You are responsible for reviewing AI output before sending applications. Our prompts are designed to reframe your real experience — not invent credentials.",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We do not sell your personal information. We share data only with service providers that help us run the product — for example, hosting, authentication, database, email delivery, and AI processing — under contracts that require them to protect your data.",
      "We may disclose information if required by law or to protect the rights, safety, and security of our users and the service.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We retain your account and workspace data while your account is active. You may request deletion of your account and associated content by contacting us.",
      "Application snapshots are stored so your search history stays accurate even if your master resume changes later.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use industry-standard safeguards including encrypted transport (HTTPS), access controls, and secure infrastructure providers. No method of transmission or storage is 100% secure, but we work to protect your data responsibly.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: ["You can:"],
    bullets: [
      "Access and update most workspace content directly in the product",
      "Export PDFs of resumes and cover letters you create",
      "Request account deletion or a copy of your data by email",
      "Opt out of non-essential communications",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "The Student plan is designed for high school and college users with parent or counselor guidance where appropriate. We do not knowingly collect personal information from children under 13 without verifiable parental consent. Contact us if you believe a child has provided information without consent.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the revised version on this page and update the date below.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Questions about privacy? Email us at privacy@${SITE_URL.replace("https://", "")}.`,
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Agreement",
    paragraphs: [
      `These Terms of Service ("Terms") govern your access to ${SITE_URL} and the ${SITE_NAME} workspace. By creating an account or using the service, you agree to these Terms.`,
    ],
  },
  {
    title: "The service",
    paragraphs: [
      `${SITE_NAME} is an application workspace for job seekers — including resume library, tailoring, cover letters, application Q&A, tracking, and insights. Features may change during beta. We may add, modify, or remove functionality as the product evolves.`,
    ],
  },
  {
    title: "Accounts",
    paragraphs: [
      "You must provide a valid email address to sign in. You are responsible for activity under your account and for keeping access to your email secure.",
      "You must be at least 13 years old to use the service, or have appropriate parent/guardian permission where required by law.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "You retain ownership of the resumes, cover letters, and other content you create. You grant us a limited license to host, process, and display your content solely to operate the service — including generating AI drafts you request and storing application snapshots.",
      "You represent that you have the right to submit the information in your account and that your content does not violate applicable law or third-party rights.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: ["You agree not to:"],
    bullets: [
      "Use the service for unlawful, fraudulent, or abusive purposes",
      "Attempt to access another user's account or data",
      "Reverse engineer, scrape, or overload the platform",
      "Upload malware or interfere with service security",
      "Misrepresent credentials or use AI output without review before applying to jobs",
    ],
  },
  {
    title: "AI-generated output",
    paragraphs: [
      "AI features provide suggestions based on your input. Output may contain errors. You are responsible for reviewing, editing, and approving anything you send to employers or schools.",
      `${SITE_NAME} does not guarantee interview outcomes, ATS scores, or hiring results.`,
    ],
  },
  {
    title: "Beta and pricing",
    paragraphs: [
      "During beta, access may be free or discounted while features are under development. Planned pricing is shown on our marketing site; we will provide notice before charging for paid plans.",
      "Paid subscriptions, when available, will renew according to the plan you select unless canceled. Refund terms will be published at launch.",
    ],
  },
  {
    title: "Disclaimer",
    paragraphs: [
      `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, ResumeTrakr and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or opportunities arising from your use of the service.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "You may stop using the service at any time. We may suspend or terminate access if you violate these Terms or if necessary to protect the service or other users.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the United States and the state in which ResumeTrakr operates, without regard to conflict-of-law principles.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Questions about these Terms? Email legal@${SITE_URL.replace("https://", "")}.`,
    ],
  },
];
