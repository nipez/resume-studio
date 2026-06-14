# Resume Studio — Master Build Prompt (for Cursor)

You are continuing development of **Resume Studio**, an AI-assisted resume + job-application platform.
A complete, working **single-file prototype** exists at `Resume Studio.dc.html`. Your job is to turn it
into a production multi-user SaaS on **GitHub + Railway + Supabase**, preserving every feature and the
exact visual design.

---

## 0. What you're starting from

`Resume Studio.dc.html` is a self-contained app built as a "Design Component" (a custom HTML runtime:
a `<x-dc>` template + a `class Component extends DCLogic` logic class, rendered by `support.js`).
**Do not keep the DC runtime.** Re-implement the same UI and logic in a normal React app. The DC file is
your **functional + visual spec** — read it end to end and match it pixel-for-pixel.

Key facts about the prototype:
- **All state lives in `localStorage`** under key `nperez_resume_studio_v2`. Replace with Supabase.
- **All AI runs through `window.claude.complete(prompt)`** — a sandbox helper using `claude-haiku-4-5`
  with a **hard 1024-output-token cap**. Several features (esp. "deep tailor") are awkwardly chunked
  *only* to dodge that cap. On the server you control the model + token budget, so simplify accordingly.
- **It is hardwired to one person ("Nick Perez")** via a `positioning()` method containing his career
  context, and a seeded default resume. In production this must become **per-user**: each user supplies
  their own master resume and their own positioning/voice notes.
- Styling is **100% inline styles** (no CSS framework). Fonts: `Space Grotesk` (headings) + `Instrument Sans`
  (body) via Google Fonts. Primary accent `#2F6BFF`, dark sidebar `#0D0F14`, page bg `#F5F6F8`.
  Status colors: applied `#1E54E6`, response `#0C7C8C`, interview `#9A6212`, offer `#0E7C4B`,
  rejected `#B23B3B`, ghosted `#8A92A0`.

---

## 1. Target architecture

- **GitHub** — monorepo. Conventional commits, PR-based.
- **Railway** — hosts the app. Deploy a **Next.js (App Router, TypeScript)** project (web + API routes),
  or split into a Next web service + a small Node/Express API service if you prefer. One Railway project,
  environment variables for secrets. Add a `railway.json`/Dockerfile as needed.
- **Supabase** — Postgres (data), Auth (email magic-link + Google OAuth), Row Level Security, and
  Storage (for uploaded resume files + generated PDFs). Use the Supabase JS client on the server
  (service role for migrations/admin) and the anon client + RLS on the browser.
- **LLM** — server-side calls to the Anthropic Messages API (or OpenAI). **Never expose the key to the
  browser.** Build one internal endpoint `POST /api/ai` (and feature-specific endpoints) that the client
  calls. Set sane `max_tokens` (2–4k) so you can drop the prototype's 1024-token chunking hacks.

Recommended stack: **Next.js 14 + TypeScript + Tailwind (configured to reproduce the inline styles as
tokens) + Supabase + Anthropic SDK + react-pdf or Puppeteer for PDF export.**

---

## 2. Data model (port these exactly, then add multi-user)

The prototype's shapes (translate to Postgres tables; snake_case columns; add `user_id uuid` FKs + RLS):

### `profiles` (NEW — replaces the hardcoded person)
- `id` (= auth user id), `full_name`, `default_version_id`, `positioning` (text — the user's "position me as…"
  voice/strategy notes, used as context in every AI prompt; in the prototype this is the hardcoded
  `positioning()` string), timestamps.

### `resume_versions`  (prototype: `versions[]`)
```
id, user_id, name, template_style ('classic'|'twocol'|'editorial'),
tailored_for jsonb | null,            // { role, company, depth }
data jsonb,                            // see ResumeData below
updated_at
```
`ResumeData` = `{ name, headline, phone, email, location, linkedin, summary,
skills: string[], experience: [{ company, title, dates, blurb, bullets: string[] }],
education: [{ school, degree, year }] }`

### `applications`  (prototype: `applications[]` — first-class records that SNAPSHOT what was sent)
```
id, user_id, role, company, job_desc,
applied_at, created_at,
resume_version_id,                     // source version (for analytics)
resume_version_name,
resume_snapshot jsonb,                 // { name, template_style, data } frozen at send time
cover_letter text,                     // snapshot of the letter sent
answers jsonb,                         // [{ q, a }] application Q&A snapshot
status ('applied'|'response'|'interview'|'offer'|'rejected'|'ghosted'),
status_history jsonb,                  // [{ status, at }]
insight jsonb | null,                  // { fitScore:int, strengths:[], gaps:[], advice }
prep jsonb | null,                     // { questions:[], talkingPoints:[], ask:[] }
notes text
```
> **Snapshotting is the core idea** — an application freezes the resume/cover/answers as-sent so the
> "what made this get an interview" analytics stay truthful even after the master resume changes.

### `application_events`  (prototype: `app.events[]` — timeline & reminders)
```
id, application_id, user_id, type ('interview'|'followup'|'note'),
title, date (date), time (text), notes, done (bool)
```

### `guided_drafts`  (prototype: `state.guided`)
In-progress guided-builder state for resuming later: `step int, template_style, make_default bool,
data jsonb` (same as ResumeData but each experience also has a `raw` plain-language field).

### Shared job context (prototype: top-level state)
`jobRole, jobCompany, jobDesc, coverText, coverHM, questions[]` — model as a per-user "current draft"
working set, or fold into the relevant feature tables.

---

## 3. Features to preserve (all already built in the prototype — match them)

**Navigation (left sidebar):** Resume Library · Tailor to a Job · Cover Letter · Application Q&A ·
Applications · Insights. Plus the Guided Builder (full-screen flow) and Import modal.

1. **Resume Library** — grid of resume versions. New version, duplicate, delete, set-default, open editor.
   "Log application" per card (snapshots the version into an application). A guided-builder CTA banner.
2. **Editor** — split view: left = structured form (header, summary, skills chips, experience with
   movable bullets, education); right = live preview iframe. Template switcher (Classic / Two-Column /
   Editorial). **Export PDF**. (Prototype builds resume HTML in `buildResumeHTML(version, forPrint)` with
   three full CSS templates — port these exactly for fidelity + PDF.)
3. **Import resume** — upload PDF/TXT/MD (PDF parsed via pdf.js) or paste text → AI structures it into
   `ResumeData` → saved as the default. (Server: parse PDF, then LLM → JSON.)
4. **Tailor to a Job** — pick base version + paste JD + role/company + depth (Light/Deep). AI rewrites
   summary, reorders/relabels skills, and rewrites bullets (Light = top-3 roles; Deep = every role).
   Saves a NEW tailored version (never mutates the base). Shows "why this fits" notes + preview.
   *(Prototype chunks Deep into one meta call + batches of 3 roles to fit 1024 tokens — with a real
   token budget you can do it in one call. Keep the robust JSON extraction/repair.)*
5. **Cover Letter** — pick base + JD + optional hiring manager → AI writes a 250–320 word letter,
   editable, copy + export PDF.
6. **Application Q&A** — list of application questions; AI answers each in the user's voice
   (120–180 words), editable, copy. "Answer all."
7. **Applications** — list of first-class application records: stats (total, responses, interviews,
   offers, response rate), per-row status dropdown + next-event chip, opens the **Application Detail**.
8. **Application Detail** — outcome pipeline stepper (Applied→Response→Interview→Offer/Rejected/Ghosted,
   timestamped); editable role/company; **Timeline & reminders** (add interview/follow-up with date/time,
   overdue flag, mark done); **Notes**; the exact **resume / cover letter / Q&A sent** (snapshot, with
   scaled preview + export); **AI "Fit & gaps"** (0–100 fit score, strengths, gaps, top advice);
   **AI "Interview prep"** (likely questions, talking points, questions to ask).
9. **Insights** — "Coming up" agenda (all upcoming events across applications); pipeline funnel
   (Applied→Response→Interview→Offer with %); response/interview rates; **AI "What's making interviews
   happen"** (compares responded-to vs no-response applications and surfaces patterns + next actions);
   **performance by resume version** table.
10. **Guided Builder** — calm, full-screen, 8-step wizard for users with no resume / who hate theirs:
    Welcome → Basics → Headline → Experience (plain words → AI "polish into bullets") → Education →
    Skills (+ AI "suggest skills") → Summary (AI "write my summary") → Finish (template + preview +
    save to library). Progress bar, reassuring microcopy, save & resume.

---

## 4. AI endpoints to build (server-side; the prototype's prompts are good — reuse them)

Create typed endpoints; each takes structured input + the user's `positioning` and returns JSON
(validate with zod). Replace the prototype's `extractJSON`/`repairJSON` with strict JSON mode where
available, keeping a tolerant fallback.

- `POST /api/ai/parse-resume` → ResumeData from raw text.
- `POST /api/ai/tailor` → `{ headline, summary, skills, roles|highlights, matchNotes }` (depth-aware).
- `POST /api/ai/cover-letter` → letter text.
- `POST /api/ai/answer-question` → answer text.
- `POST /api/ai/app-insight` → `{ fitScore, strengths, gaps, advice }`.
- `POST /api/ai/interview-prep` → `{ questions, talkingPoints, ask }`.
- `POST /api/ai/cross-insights` → `{ summary, worked, missing, next }` (input: responded vs not).
- `POST /api/ai/guided/polish-bullets` → `{ bullets }`.
- `POST /api/ai/guided/suggest-skills` → `{ skills }`.
- `POST /api/ai/guided/draft-summary` → summary text.

(Open `Resume Studio.dc.html` and copy the exact prompt strings from `runTailor`, `runCover`,
`answerOne`, `analyzeApp`, `genPrep`, `runInsights`, `gPolishRole`, `gSuggestSkills`, `gDraftSummary`,
`runImport`, and the shared `positioning()` — they encode the product's tone and rules.)

---

## 5. Build order (do these as separate PRs)

1. **Scaffold**: Next.js + TS + Tailwind, GitHub repo, Railway deploy of a hello-world, Supabase project
   linked, env vars wired (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `ANTHROPIC_API_KEY`).
2. **Auth + schema**: Supabase Auth (magic link + Google), the tables above as SQL migrations, RLS so a
   user only sees their own rows. A `profiles` row is created on signup.
3. **Design system**: port fonts, colors, the sidebar shell, and the three resume HTML/CSS templates into
   reusable components. Recreate the inline-style look with Tailwind tokens. Pixel-match the prototype.
4. **Resume Library + Editor + PDF export** (no AI yet) on top of Supabase.
5. **Import + Tailor + Cover + Q&A** via the AI endpoints.
6. **Applications (first-class + snapshots) + Detail + events/reminders.**
7. **Insights (analytics + cross-application AI).**
8. **Guided Builder.**
9. **Polish**: optimistic updates, loading/empty/error states (the prototype has friendly versions —
   match the copy), reminders (optionally email via Supabase + a Railway cron), and PDF storage in
   Supabase Storage.

---

## 6. Rules / fidelity checklist

- Match the prototype's **copy, tone, spacing, colors, and component behavior** exactly unless improving
  multi-user correctness.
- **Snapshots are immutable** once an application is created (only status/events/notes/insight/prep change).
- Tailoring/guided AI must **never fabricate facts** — only reframe the user's real input. (Prompts say so.)
- Keep the **localStorage→Supabase** migration in mind: a logged-in user starts empty and either imports,
  builds guided, or starts from a blank version. Remove all "Nick Perez" hardcoding.
- Accessibility: real form labels, focus states, keyboard nav, 44px hit targets.

Start by reading `Resume Studio.dc.html` in full, then scaffold (step 1) and open a PR.
