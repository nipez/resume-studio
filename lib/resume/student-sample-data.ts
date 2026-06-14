import type { ResumeData } from "@/lib/types/resume";

export const STUDENT_SAMPLE_RESUME_DATA: ResumeData = {
  name: "Jordan Chen",
  headline: "High School Senior · Honor Roll · Varsity Soccer Captain",
  phone: "555.867.5309",
  email: "jordan.chen@email.com",
  location: "Portland, OR",
  linkedin: "",
  summary:
    "Motivated high school senior with strong leadership in athletics and community service. National Honor Society member with a 3.8 GPA. Seeking a part-time role or summer internship where reliability, teamwork, and clear communication matter.",
  skills: [
    "Leadership",
    "Public speaking",
    "Customer service",
    "Microsoft Office",
    "Spanish (conversational)",
    "Event coordination",
  ],
  experience: [
    {
      company: "Lincoln High School",
      title: "Varsity Soccer Captain",
      dates: "2024 – Present",
      blurb: "Elected team captain for 28-player roster.",
      bullets: [
        "Led weekly practices and mentored underclassmen on time management.",
        "Coordinated team community service day — 40 volunteers, 120 meal kits packed.",
      ],
    },
    {
      company: "National Honor Society",
      title: "Chapter Member & Tutor",
      dates: "2023 – Present",
      bullets: [
        "Tutor peers in algebra and chemistry twice weekly after school.",
        "Organized fall food drive collecting 800+ items for local pantry.",
      ],
    },
    {
      company: "River Roast Coffee",
      title: "Barista",
      dates: "Jun 2024 – Present",
      bullets: [
        "Opened and closed shifts; handled cash register and mobile orders.",
        "Trained two new hires on drink prep and customer greeting standards.",
      ],
    },
    {
      company: "Portland Community Food Bank",
      title: "Volunteer",
      dates: "2022 – Present",
      bullets: [
        "Sort and pack groceries for 50+ families each Saturday shift.",
        "Bilingual greeter — helped Spanish-speaking visitors navigate intake.",
      ],
    },
  ],
  education: [
    {
      school: "Lincoln High School",
      degree: "Diploma expected · GPA 3.8 · AP Biology, AP English",
      year: "2026",
    },
  ],
};
