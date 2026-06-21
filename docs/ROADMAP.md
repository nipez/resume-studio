# ResumeTrakr roadmap

Living backlog: **shipped on `main`** vs **discussed / next**. Update when merging PRs.

---

## Shipped (June 2026)

### Core product
- Resume library, editor, guided builder (student + professional)
- Tailor → Cover → Q&A → Log application flow
- Application tracker with resume/cover/Q&A snapshots
- Saved jobs queue (apply later)
- Insights funnel
- Cover letters saved to account
- Job URL import + paste parse
- Saved job **posting URL** + **Edit saved job**
- Classic ATS badge + editor click hint + **Shorten to 2 pages** AI

### Personas & dashboard
- Student vs professional first-run path
- Students default to **Simple Home**; toggle to Full
- Student welcome panel (“ahead of peers”)
- Student copy on tailor, applications, log modal
- `application_type` (internship, part-time, volunteer, full-time)

### Admin / ops
- Super admin: all users, view-as, demo personas
- Persona filters, onboarding column, sort, pagination, reset persona
- Support inbox (reply to Help me tickets)
- AI costs dashboard (estimated from `ai_usage_events`)
- View-as enter/exit fixes + floating exit pill

### Support
- Help me widget (question / feature / human review request)
- `/messages` inbox with unread badge

---

## Next up (prioritized)

### High value / small
1. **Archive applications** — `archived_at` on applications; Active/Archived tabs; archive on reject/ghosted; exclude from active funnel in Insights
2. **Support ticket email to admin** — notify Nick on new Help me message
3. **Auto-suggest archive** when status → Rejected or Ghosted

### Medium
4. **Stripe** — Student / Pro / Essentials tiers; `AI_ENFORCE_PLAN_TIERS=true` at GA
5. **Paid human review** — Stripe checkout from Help me → human review category
6. **Google Drive export** (Alia feedback)
7. **Simple mode expansion** — more student shell simplification beyond Home

### Larger
8. Unified **Apply to a job** wizard (single flow through Tailor/Cover/Q&A/Log)
9. Anthropic **actual billing** pull vs estimates in admin (optional API/integration)
10. Marketing site polish / student landing page iterations

---

## Explicitly deferred

- Live chat / Intercom-style support (async Help me is enough for beta)
- Full test suite (no runner configured yet)
- Mobile-native apps

---

## Beta feedback log

| Who | Date | Notes | Status |
|-----|------|-------|--------|
| Alia | 2026-06 | ATS/columns concern, editor discoverability, shorten to 2 pages, Google Drive export | First three shipped (#79); Drive export pending |
| Nick | 2026-06 | View-as exit, dashboard default, cover from editor, JD on cover | Shipped |

---

_Last updated: 2026-06-20_
