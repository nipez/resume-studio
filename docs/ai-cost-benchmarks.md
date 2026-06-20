# AI cost benchmarks

Reference log of real-user Anthropic API spend to inform plan pricing and margin targets. Costs are **provider-side (Anthropic)** unless noted; they exclude Supabase, Railway, Stripe, and support time.

Check `ai_usage_events` in Supabase for per-call token/cost detail when available.

---

## How to add an entry

Copy this block:

```markdown
### YYYY-MM-DD — {user or cohort}

**Profile:** (e.g. student beta, professional, demo)

**Activity:**
- …

**Estimated Anthropic cost:** $X.XX

**Notes / pricing implications:**
- …
```

---

## Benchmarks

### 2026-06 — Alia (first external beta tester)

**Profile:** Professional product person (Bumped); early beta, real workflows.

**Activity (combined session):**
- Created **a couple of resumes** (guided/build + editor)
- **One job application** logged (tailor / apply flow)
- **One cover letter** generated
- **Shorten to 2 pages** — tested new `resume_assist` / shorten feature on an existing resume

**Estimated Anthropic cost:** **~$0.03** (~3¢)

**Notes / pricing implications:**
- A realistic “first serious session” (build + tailor + cover + one AI edit) landed around **3¢** in API fees — well under a dime.
- Useful floor for **Student** tier: even generous AI (within student-allowed actions) is unlikely to blow margin at **$5–10/mo** if sessions stay in this range.
- **Pro** users doing heavier tailor batches, interview debrief, insights will cost more — log separately when we see those patterns.
- At ~3¢/active day, **100 Pro AI actions/month** cap (`AI_PRO_MONTHLY_CAP`) could theoretically reach **~$3–10+** only if every action were as heavy as quality-tier tailor; most fast-tier calls are cheaper. Monitor `ai_usage_monthly` and Anthropic dashboard.
- **Human review** ($19–29 one-time) and **Essentials (no AI)** remain the main margin levers; AI variable cost at this benchmark is small relative to price.

**Source:** Nick — Anthropic dashboard / billing observation after Alia beta feedback cycle (June 2026).

---

## Quick reference (internal)

| Signal | Current config / note |
|--------|------------------------|
| Pro monthly AI cap | `AI_PRO_MONTHLY_CAP` = 100 (default) |
| Student cover letter cap | 2/month |
| Cost alert threshold | `AI_COST_ALERT_USD` = 8 (default) |
| Plan tier enforcement | Off in beta (`AI_ENFORCE_PLAN_TIERS` ≠ `true`) |
| Usage tables | `ai_usage_events`, `ai_usage_monthly` (migration `0011_ai_usage.sql`) |

---

## Pricing sanity checks (to revisit)

Use this table as we add more benchmarks:

| Scenario | Observed API cost | Suggested min price (3×–5× API + fixed ops) |
|----------|-------------------|-----------------------------------------------|
| Alia first session (build + apply + cover + shorten) | ~$0.03 | Student $5–10/mo still comfortable |
| _TBD: heavy Pro month_ | — | Pro $15–25/mo |
| _TBD: human review (no extra AI)_ | ~$0 | Add-on $19–29 |

---

_Last updated: 2026-06-20_
