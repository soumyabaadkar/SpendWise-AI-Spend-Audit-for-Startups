# USER_INTERVIEWS.md

Three conversations with potential users. Each was 10–15 minutes, conducted over Slack DM or a quick video call.

---

## Interview 1

**Name:** A.K. (preferred initials)
**Role:** VP Engineering
**Company stage:** Series A, ~18 engineers, B2B SaaS

**Context:** Found via a mutual connection in the Rands in Repose Slack. Agreed to 15 minutes "if it's quick."

**Direct quotes:**
- "I approved Cursor for the whole team without really checking if we needed Business or Pro. There was a Slack message, I said yes, and now it's just in the budget."
- "I get the credit card statement but I don't really break it down by tool. It's like $3k a month on 'software' and I know AI is a chunk of it but I couldn't tell you exactly."
- "My CFO asked me last quarter to cut 10% of software spend. I had no idea where to start. I ended up cutting something we actually needed because it was the only line item I understood."

**Most surprising thing:** He had no idea what his engineers were paying for Cursor vs what he approved. There was a 2-month gap where they were paying for Business on 12 seats while 4 of those seats had churned off the company.

**What it changed about the design:** I added the "seats" field as a required, prominent input — not tucked away. The gap between licensed seats and actual users is where a lot of money leaks. The original design had it as optional.

---

## Interview 2

**Name:** Priya S.
**Role:** Founding Engineer (effectively CTO)
**Company stage:** Pre-seed, 5 people, developer tools startup

**Context:** College contact, now running a small developer tools startup. Spoke for 12 minutes over a call.

**Direct quotes:**
- "We use the API directly for everything. I don't really think of that as a subscription — it's just a utility bill. But last month it was $800 and I was like, where did that go?"
- "I looked at the logs after the bill surprised me. We had one endpoint that was using Sonnet for a task that Haiku would've handled fine. Classic thing, just never reviewed it."
- "I don't trust a tool that tells me to switch everything. I need it to tell me what's actually wrong, not just 'use the cheapest thing.'"

**Most surprising thing:** She actively distrusts recommendation tools that feel like they have an agenda. She mentioned she's ignored two "cost optimisation" emails from her cloud provider because they always push the wrong product. The trust problem is as big as the discovery problem.

**What it changed about the design:** The audit result copy went through a significant rewrite after this conversation. I removed language like "we recommend switching to..." and replaced it with reasoning-first language: "Cursor Business ($40/seat) adds admin controls and SSO — for a team of 2, these are redundant. Cursor Pro ($20/seat) is identical in AI capability." The reason comes before the recommendation. I also added the "already optimal" state — the tool will explicitly tell you if you're spending well, rather than manufacturing savings.

---

## Interview 3

**Name:** James O.
**Role:** Engineering Manager
**Company stage:** Series B, ~45 engineers, fintech

**Context:** Found via the SaaS Founders Slack. He replied to a "looking for feedback on a spend tool" message.

**Direct quotes:**
- "At our size, the real question isn't which plan — it's whether developers are actually using the tools we're paying for. Half our Copilot seats might be inactive."
- "I'd share this with my CFO if the output was professional-looking. Right now I send her screenshots of pricing pages and explain it verbally. A shareable report with the reasoning would save me a meeting."
- "Does it handle API billing? That's where the real variance is. Subscriptions I can manage. It's the API overage that surprises me."

**Most surprising thing:** The shareable report URL was the feature he cared most about — I'd deprioritised it and planned to cut it if pressed. He wanted to send it to his CFO and head of procurement. "A link I can forward is worth more than a screenshot I have to annotate."

**What it changed about the design:** Moved the share URL up in the results hierarchy — it's now displayed prominently below the main savings number, not buried at the bottom. Also added the "identifying details stripped from public version" note explicitly, because James asked "what does the other person see when I share it?" Also flagged the API usage review recommendation for high API spenders, even though I can't audit actual usage — it's honest and directional.
