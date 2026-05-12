# REFLECTION.md

## 1. The hardest bug I hit this week

The trickiest bug was the plan auto-fill logic in SpendForm. When a user changes the tool dropdown (e.g. from ChatGPT to Cursor), the component should: reset the plan to the first valid plan for that tool, and auto-fill the monthly spend based on the new plan × seats.

The bug: when the tool changed, the `updateTool` function was reading `t.plan` to look up the price — but `t.plan` was the *old* plan (from the previous tool), which didn't exist in the new tool's plans object. The result was `undefined * seats = NaN`, which silently set monthlySpend to NaN and broke the audit submission without any visible error.

**Hypotheses I formed:**
1. The state update was stale (React batching issue) — tested by adding a `console.log` inside the updater and confirming `t.plan` was wrong, not stale
2. The plan wasn't being reset before the price lookup — confirmed this by logging the execution path
3. The `updateTool` function was processing both `name` change and the resulting `plan` change in a single update — this turned out to be the actual issue

**What worked:** I restructured the `name` branch in `updateTool` to explicitly derive the new plan first (`const firstPlan = plans[0]`), then use that derived value for the price lookup, rather than reading `t.plan`. The key insight was that you can't read state that you're in the process of changing within the same reducer function.

---

## 2. A decision I reversed mid-week

I originally designed the audit engine to use AI (the Anthropic API) for the recommendation logic itself — not just the summary. The idea was that instead of hard-coded rules, the engine would send the user's tool list to Claude and ask "is this optimal?"

I reversed this on Day 3 after building a prototype and testing it with 20 different inputs.

**What made me reverse it:**
- The AI recommendations were inconsistent. The same input on two consecutive calls gave different outputs ("switch to Copilot" vs "keep Cursor").
- They weren't auditable. A finance person reading "Claude says you should switch" has no way to verify it.
- Latency was too high for the expected UX — 3–5 seconds for the main result is unacceptable when the goal is "instant audit."
- The assignment itself hints at this: "For the audit math itself, hardcoded rules are correct — knowing when not to use AI is part of the test."

The hard-coded rule engine is deterministic, fast, and auditable. The AI generates only the 100-word summary paragraph — a task where some variation is acceptable and even desirable.

---

## 3. What I'd build in week 2

**Priority 1 — Actual email delivery.** Right now we capture the lead in Supabase but don't send the transactional email (Resend integration is stubbed out). The assignment requires it. Week 2 starts here.

**Priority 2 — PDF export.** James (user interview 3) specifically said "a shareable report with reasoning is worth more than a screenshot." A PDF that a founder can email to their CFO or attach to a board pack has real distribution value.

**Priority 3 — Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." This requires collecting enough real audit data to have a benchmark. After a week with real users, I'd have 50–100 data points to build it from.

**Priority 4 — Embeddable widget.** A `<script>` tag that CTOs can drop into their internal tools page. Low engineering cost, potentially high distribution (a popular internal wiki or Notion page could drive dozens of audits).

---

## 4. How I used AI tools

**What I used:**
- **Claude (claude.ai)** for: drafting the GTM.md and ECONOMICS.md structure, reviewing the audit engine logic for gaps ("what edge cases am I missing in the Cursor rules?"), writing first drafts of README sections, and discussing architectural trade-offs.
- **GitHub Copilot** for: routine TypeScript — interface definitions, boilerplate component structure, Tailwind class suggestions.

**What I didn't trust AI with:**
- The audit engine rules themselves. The AI suggested rules I couldn't verify without checking vendor pricing pages myself. It confidently hallucinated a "Cursor Starter" plan that doesn't exist.
- The user interview write-ups. These came from real conversations and I wrote them directly.
- The ECONOMICS.md numbers. The AI suggested conversion rates that were too optimistic — I revised them based on what I've read about B2B SaaS lead-gen benchmarks.

**One specific time the AI was wrong and I caught it:**
When I asked Claude to suggest pricing data for Windsurf, it gave me $10/mo for Pro and $25/mo for Teams. The actual prices (from windsurf.com/pricing, verified 2026-05-12) are $15/mo Pro and $35/mo Teams. Small difference, but if I'd used the AI's numbers unchecked, the audit engine would have understated Windsurf costs and generated incorrect savings calculations. This is why PRICING_DATA.md exists — every number has a verified source URL.

---

## 5. Self-ratings

**Discipline: 7/10**
I started strong on days 1–3 but lost a day to scope creep on the audit engine (over-engineering edge cases before the core was working). Recovered by Day 5 but the DEVLOG shows it.

**Code quality: 7/10**
The audit engine is clean and well-typed. The component layer is functional but has some `any` types I didn't fully resolve (SpendForm's tool state typing). With another day I'd tighten it.

**Design sense: 6/10**
The UI is clean and readable but not memorable. I made it functional first. The AuditResults page in particular could benefit from more visual hierarchy — the savings number should hit harder.

**Problem-solving: 8/10**
The plan auto-fill bug was genuinely tricky and I found it without rubber-duck debugging. The decision to reverse the AI-for-audit approach was the right call at the right time.

**Entrepreneurial thinking: 8/10**
The GTM and ECONOMICS documents are specific, not generic. The user interviews changed actual design decisions. I thought about the viral loop (shareable URL) and the business model (Credex CTA only where it's relevant) rather than bolting them on.
