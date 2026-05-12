# SpendWise — AI Spend Audit for Startups

A free tool that audits your startup's AI subscription spend, identifies overpayment by plan, team size, and use case, and surfaces exactly how much you could save — in 90 seconds.

Built as a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

## Screenshots

> _Add 3+ screenshots or a Loom/YouTube link here before submitting_

## Live URL

> https://spend-wise-ai-spend-audit-for-start-chi.vercel.app/

## Quick Start

```bash
# Install
npm install

# Set environment variables
cp .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_URL=https://iqnyodvkhulvrxugkfuz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SxrqnBk9icWfTwm_5E-LlA_ff2-KHju

# Run locally
npm run dev

# Run tests
npm test

# Build
npm run build
```

### Supabase setup

Create two tables in your Supabase project:

```sql
-- audits table
create table audits (
  id uuid primary key,
  audit_data jsonb not null,
  use_case text,
  team_size int,
  created_at timestamptz default now()
);

-- Enable public insert, select by id (RLS)
alter table audits enable row level security;
create policy "insert audits" on audits for insert with check (true);
create policy "select own audit" on audits for select using (true);

-- leads table
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size int,
  audit_id uuid references audits(id),
  monthly_savings int,
  high_savings boolean default false,
  created_at timestamptz default now()
);

alter table leads enable row level security;
create policy "insert leads" on leads for insert with check (true);
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
# Set env vars in Vercel dashboard or via:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_ANTHROPIC_API_KEY
```

## Decisions

1. **Client-side audit engine, not AI.** The recommendation logic is deterministic TypeScript rules, not LLM calls. This makes results auditable ("a finance person should agree"), consistent across runs, and instant. AI is used only for the 100-word summary paragraph where some variation is acceptable. This was a deliberate reversal — I prototyped AI-for-audit and found it inconsistent.

2. **Supabase over Firebase.** Supabase gives a real Postgres database with SQL queries, better TypeScript types, and no NoSQL document model mismatch. The free tier is sufficient for MVP scale and the RLS system is simpler to reason about than Firebase security rules.

3. **UUID generated client-side, not server-side.** The audit ID and share URL are generated in the browser before the Supabase write. This means the share URL is available instantly — the user can copy it before the network request completes. The audit data races to Supabase in the background.

4. **Form persistence in localStorage, not URL state.** URL state (query params) would have made the form shareable as a link, but the primary user flow is "audit once, get results, share the result." Storing form state in localStorage means the form survives accidental reloads without cluttering the URL. A future improvement would add URL-based form state for team collaboration.

5. **Honeypot over hCaptcha for abuse protection.** hCaptcha adds a visible challenge that damages conversion. A hidden honeypot field (never visible to real users, always filled by bots) catches the vast majority of automated form submissions with zero UX cost. This is the right trade-off for a free tool where user friction is the primary risk.

## What's missing (known gaps)

- Transactional email (Resend) — lead capture stores to Supabase but doesn't send a confirmation email yet
- PDF export (bonus feature)
- Embeddable widget (bonus feature)
