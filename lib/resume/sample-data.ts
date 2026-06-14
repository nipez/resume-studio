import type { ResumeData } from "@/lib/types/resume";

export const SAMPLE_RESUME_DATA: ResumeData = {
  name: "Alex Morgan",
  headline: "Product & Growth Leader · Systems Builder",
  phone: "555.123.4567",
  email: "alex@example.com",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  summary:
    "Product and growth leader with 10+ years building repeatable revenue systems across B2B SaaS. Connects strategy, operations, and experimentation into one growth engine — thinking in systems, not channels.",
  skills: [
    "Growth Strategy",
    "Demand Generation",
    "Product Marketing",
    "Revenue Operations",
    "Experimentation",
    "CRM & Automation",
    "Team Leadership",
    "Analytics & Reporting",
  ],
  experience: [
    {
      company: "Northstar SaaS",
      title: "Director of Growth",
      dates: "2022 – Present",
      blurb: "Own end-to-end growth for a mid-market B2B platform.",
      bullets: [
        "Grew qualified pipeline 48% YoY through lifecycle + paid experiments.",
        "Built a cross-functional growth operating cadence across marketing, sales, and product.",
        "Reduced CAC payback from 14 to 9 months via funnel and onboarding improvements.",
      ],
    },
    {
      company: "Brightpath Health",
      title: "Senior Marketing Manager",
      dates: "2018 – 2022",
      blurb: "Led acquisition and retention for a multi-location healthcare brand.",
      bullets: [
        "Increased appointment bookings 32% with localized SEO and conversion testing.",
        "Launched referral workflows that improved show rates 18%.",
      ],
    },
  ],
  education: [
    {
      school: "State University",
      degree: "B.A. Economics",
      year: "2014",
    },
  ],
};
