# ARCHITECTURE.md

## System Diagram

```mermaid
graph TD
    A[User: cold visitor] -->|lands on| B[SpendWise Home]
    B --> C[SpendForm]
    C -->|submits tools + useCase| D[auditEngine.runAudit]
    D -->|reads| E[pricingData.ts]
    D -->|returns AuditReport| F[AuditResults component]
    F --> G[SummaryCard]
    G -->|calls| H[Anthropic API claude-haiku]
    H -->|on failure| I[fallback template summary]
    F --> J[LeadCapture component]
    J -->|POST| K[Supabase: leads table]
    D -->|fire-and-forget| L[Supabase: audits table]
    L -->|stores| M[auditId + full AuditReport JSON]
    M -->|unique URL| N[/report/:id]
    N -->|fetches| L
    N -->|renders public| O[Shared Report page]
```

## Data Flow

1. User fills `SpendForm` — tool, plan, seats, monthly spend (auto-filled from pricingData, editable). Form state persists in `localStorage` across reloads.
2. On submit, `runAudit(tools, useCase)` runs purely client-side. No server round-trip. This is a deliberate choice — it keeps the tool instant and works offline.
3. `auditEngine.ts` applies rule-based logic: for each tool, it checks plan-fit (seats vs plan tier), cross-tool overlap (e.g. Cursor + Copilot), and usage-context fit (coding vs writing etc). Returns an `AuditReport` with per-tool `AuditResult[]`, totals, and a `tier`.
4. `AuditResults` renders the report. `shareUrl` is a UUID generated client-side.
5. `saveAuditReport()` fires in the background — POSTs the full report to Supabase `audits` table keyed by UUID. This is fire-and-forget; UI doesn't block on it.
6. `generateAISummary()` calls the Anthropic API with a structured prompt. On any failure (network, rate limit, missing key), it falls back to a deterministic template. The summary loads asynchronously — the results are usable before it arrives.
7. Lead capture: email + optional fields POST to `leads` table. A honeypot field catches bots without requiring captcha UX friction.
8. `/report/:id` fetches the audit from Supabase by UUID. Email and company name are not stored in the public audit record — only tools, savings data, and team size.

## Stack Choice

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript | Widely understood, great ecosystem, suits component-based audit UI |
| Build | Vite | Fastest dev server, excellent HMR, minimal config |
| Styling | Tailwind CSS | Design-system-in-a-file, no CSS file management |
| Routing | react-router-dom v6 | Handles `/report/:id` with zero config |
| Backend | Supabase | Managed Postgres + auth + realtime. Free tier sufficient for MVP. No server to maintain. |
| AI | Anthropic API (Haiku) | Fast, cheap, high quality for structured text generation |
| Deploy | Vercel | Zero-config Vite deployment, automatic preview URLs, free tier |
| Testing | Vitest | Native Vite integration, fast, Jest-compatible API |
| CI | GitHub Actions | Free, simple, runs lint + test + build on every push |

**TypeScript:** Chosen over plain JS because the audit engine has 10+ interfaces that would otherwise drift silently. Type errors caught several bugs during development (e.g. `savings` being `undefined` instead of `number` when the rule path didn't set it).

## What I'd Change at 10k Audits/Day

- **Move audit engine to an Edge Function** (Cloudflare Worker or Vercel Edge). Client-side is fine for MVP but you lose server-side logging, A/B test variants, and the ability to update rules without a frontend deploy.
- **Add a caching layer** on `/report/:id` — most reports are fetched once at share time. A Cloudflare Cache or Vercel Edge Cache on the Supabase response would make share URLs load instantly globally.
- **Rate limit the lead capture endpoint** at the Edge layer, not just with a honeypot. 10k audits/day with no rate limiting will attract spam at scale.
- **Replace Supabase free tier** with dedicated Postgres + connection pooling (PgBouncer). Supabase free tier has connection limits that hurt at volume.
- **Add a job queue** for transactional email sending (Resend + QStash or similar) — fire-and-forget SMTP calls at scale drop emails silently under load.
- **Instrument the audit engine** — log which rules fire, which tools appear most, where users drop off. This data makes the audit logic dramatically better over time.
