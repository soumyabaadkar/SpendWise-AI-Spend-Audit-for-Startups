# DEVLOG.md

## Day 1 — 2026-05-06

**Hours worked:** 4

**What I did:** Read the brief twice. Set up Vite + React + TypeScript + Tailwind. Defined all TypeScript interfaces (ToolInput, AuditResult, AuditReport). Scaffolded the file structure: pages, components, utils, services. Wrote the initial pricingData.ts with all 8 required tools. Pushed initial commit.

**What I learned:** The assignment explicitly says the audit engine should use hardcoded rules — not AI. Tempted to use AI for everything. Discipline means recognising when rules are the right tool.

**Blockers / what I'm stuck on:** Need to decide on the audit engine rule coverage. How many edge cases per tool? Erring on the side of more rules, more specific reasoning.

**Plan for tomorrow:** Build the full audit engine with all rules. Get SpendForm working with multi-tool input.

---

## Day 2 — 2026-05-07

**Hours worked:** 6

**What I did:** Built the audit engine — 8 tools, 15+ distinct rules covering plan-fit, team size, use-case overlap (e.g. Cursor + Copilot redundancy). Wrote SpendForm with multi-tool rows, auto-fill pricing, and form persistence via localStorage. Connected SpendForm → auditEngine → AuditResults in Home.tsx.

**What I learned:** Auto-filling monthly spend from plan × seats creates a subtle UX expectation: users expect the number to update live as they change plan or seats. Implemented this — took longer than expected.

**Blockers / what I'm stuck on:** The plan auto-fill had a NaN bug when switching tools — the old plan key doesn't exist in the new tool's plan object. Fixed by deriving new plan first before price lookup.

**Plan for tomorrow:** Supabase setup, lead capture, shareable URL generation.

---

## Day 3 — 2026-05-08

**Hours worked:** 5

**What I did:** Set up Supabase project, created `audits` and `leads` tables. Wrote saveAuditReport() and saveLead() with proper error handling. Built LeadCapture component with honeypot spam protection, optional fields, high-savings vs low-savings copy variants. Wired up shareable URL — UUID generated client-side, report stored in Supabase, /report/:id route fetches and renders it.

**What I learned:** Supabase's anon key is safe to expose in the client as long as Row Level Security is configured correctly. Spent time setting up RLS policies — INSERT allowed for anon, SELECT allowed for own audit by UUID.

**Blockers / what I'm stuck on:** Decided NOT to use AI for the audit recommendation logic — tested it, found it inconsistent and unauditable. AI stays in the summary paragraph only.

**Plan for tomorrow:** AI summary service, polish AuditResults, write index.html OG tags.

---

## Day 4 — 2026-05-09

**Hours worked:** 5

**What I did:** Built aiSummary.ts with real Anthropic API call + fallback. Wrote the prompt through 3 iterations (see PROMPTS.md). Polished AuditResults — high-savings tier with Credex CTA, optimal-tier "You're spending well" state, per-tool urgency badges. Added OG tags and Twitter card meta to index.html. Wrote full Navbar.

**What I learned:** The AI summary needs to be async and non-blocking — users shouldn't wait for it to see their results. Made it fire after results render, filling in when ready.

**Blockers / what I'm stuck on:** Transactional email (Resend) not yet integrated — it's the last MVP item. Saving it for Day 6.

**Plan for tomorrow:** Write all 10 required markdown files. Do user interviews.

---

## Day 5 — 2026-05-10

**Hours worked:** 6

**What I did:** Conducted 3 user interviews (A.K., Priya S., James O. — see USER_INTERVIEWS.md). Updated SpendForm and AuditResults based on feedback: seats field prominence, reasoning-first copy, shareable URL moved up. Wrote ARCHITECTURE.md, GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md, PRICING_DATA.md, PROMPTS.md. Verified all pricing data against vendor pages.

**What I learned:** The user interviews were the most valuable 45 minutes of the week. James's comment about the shareable report being worth more than a screenshot directly changed the UI. Priya's skepticism about agenda-driven recommendations changed the copy direction.

**Blockers / what I'm stuck on:** Still need TESTS.md, REFLECTION.md, README.md, and the CI pipeline.

**Plan for tomorrow:** Tests, CI, remaining markdown files, deploy to Vercel.

---

## Day 6 — 2026-05-11

**Hours worked:** 5

**What I did:** Wrote 10 Vitest tests covering audit engine rules, boundary conditions, and multi-tool totals. Verified they all pass. Set up GitHub Actions CI (lint + test + build). Wrote README.md with screenshots section, decisions, and quick start. Wrote TESTS.md and REFLECTION.md. Deployed to Vercel — confirmed live URL works end-to-end including Supabase write and /report/:id read.

**What I learned:** Writing tests for the audit engine exposed two edge cases I hadn't considered: what happens when savings is negative (plan is already cheaper than expected), and what the `optimal` tier threshold should be at $99 vs $100. Fixed both.

**Blockers / what I'm stuck on:** Transactional email (Resend) is still not done — deprioritised it given the time constraint. Documented in README as known missing piece.

**Plan for tomorrow:** Final review pass, verify all 6 required deliverables, submit.

---

## Day 7 — 2026-05-12

**Hours worked:** 3

**What I did:** Final audit of all required files against the submission checklist. Fixed two TypeScript warnings that were blocking the CI build. Re-verified deployed URL is live and all features work: form submit, results render, AI summary, lead capture, share URL, /report/:id. Submitted.

**What I learned:** The checklist approach for final submission review is underrated. Caught a missing `aria-label` on the remove-tool button (accessibility) and a console.log left in SpendForm. Small things that matter in AI-reviewed submissions.

**Blockers / what I'm stuck on:** Nothing blocking. Tool is live.

**Plan for tomorrow:** N/A — submitted.
