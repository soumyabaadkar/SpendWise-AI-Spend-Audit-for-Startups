# PROMPTS.md

## AI Summary Prompt

Used in `src/services/aiSummary.ts` to generate the personalized audit summary.

### The prompt (parameterised):

```
You are a concise financial analyst. Write a 80-100 word personalized audit summary for a startup using these AI tools: {toolsList}. Primary use case: {useCase}. {savingsLine} Top recommendations: {recommendations}. Be specific, professional, and actionable. No fluff. End with one sentence about what they should do first.
```

### Why I wrote it this way

The model needs a clear role ("financial analyst") to stay credible rather than sycophantic. I capped the word count at 100 words to force concision — earlier drafts without a cap produced 300-word summaries that nobody reads. "No fluff" is an explicit negative constraint that measurably reduces filler phrases like "It's great that you're thinking about this."

The final "End with one sentence about what they should do first" is the most important instruction — it converts the summary from a diagnosis into a prescription, which is what users actually want.

### What I tried that didn't work

**Attempt 1 — Open-ended prompt:**
```
Summarize this AI spend audit: {json}
```
Result: the model summarised data the user could already see. No value added.

**Attempt 2 — Too prescriptive on format:**
```
Write exactly 3 bullet points: (1) total savings (2) biggest recommendation (3) next step
```
Result: robotic, no personalisation. Lost the "analyst" voice.

**Attempt 3 — Asking for markdown:**
The model wrapped output in backticks and headers. Rendered as raw markdown inside a `<p>` tag. Removed that instruction entirely.

### API failure fallback

In `buildFallbackSummary()`, we construct a deterministic summary from the audit data itself. This covers: no API key configured, API rate limits, network failures, and model errors. The fallback is intentionally honest — "we found $X in savings, start with Y" — rather than pretending AI generated it.

### Model choice

Used `claude-haiku-4-5-20251001` for the summary because:
- It's fast enough for a synchronous UX feel (< 1 second)
- The task doesn't need Sonnet-level reasoning — it's a structured text generation
- Cheaper per token, which matters at scale for a free tool
