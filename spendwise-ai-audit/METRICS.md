# METRICS.md

## North Star Metric

**Qualified leads generated per week** — defined as email captures where the audit showed ≥$100/month in savings potential.

**Why this, not something simpler:** Total audit completions is a vanity metric — someone who completes an audit and sees $0 savings is not a Credex prospect and not a SpendWise success. DAU is wrong for a tool people use once or twice per year. MRR is too downstream to be actionable at this stage. A "qualified lead" (savings > $100/mo + email captured) is the actual unit of business value — it's what Credex's sales team can work with.

## 3 Input Metrics

**1. Audit completion rate** (visitors → completed audits)
Target: ≥30%. Leading indicator of form UX quality and traffic relevance. If this drops, the form is too complex or traffic is wrong.

**2. Email capture rate** (audits → email submitted)
Target: ≥35% for audits showing savings, ≥15% for zero-savings audits ("notify me" option). This measures whether we're showing enough value before the gate. If it drops, the results page isn't compelling enough.

**3. Share rate** (audits → shared URL clicked)
Target: ≥8%. This is the viral coefficient — every share is a free acquisition channel activation. It's also a signal of result credibility: people only share an audit if they trust it enough to send to their CFO or team.

## What to instrument first

1. **Funnel events:** `page_view`, `form_started`, `tool_added`, `audit_submitted`, `email_captured`, `share_clicked`, `consultation_booked` — in that order. This is the conversion funnel. Without it we're blind.
2. **Audit distribution:** histogram of `monthlySavings` values. What % of audits show ≥$500/mo? This calibrates our high-savings CTA threshold and tells us if the market has the savings we think it does.
3. **Tool frequency:** which tools appear most often. Tells us where to invest rule-quality improvements.
4. **Session source:** UTM params on every entry point. We need to know which channels convert to email, not just which drive traffic.

## Pivot trigger

If, after 500 completed audits:
- Email capture rate is below 15% — the value proposition isn't landing; pivot to a different results format or lead magnet
- Average qualified lead savings is below $150/month — the market doesn't have the overspend problem we assumed; reconsider positioning
- Consultation-to-credit-purchase conversion is below 10% — the sales process is broken or the leads are wrong quality; focus on ICP tightening

The key number: **if 500 audits don't generate 20 qualified leads (4% of audits), the tool is not working as a lead-gen asset** and needs a fundamental rethink.
