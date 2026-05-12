import type { AuditReport } from '../utils/auditEngine';

export async function generateAISummary(audit: AuditReport, useCase: string): Promise<string> {
  const prompt = buildPrompt(audit, useCase);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    if (text.length > 50) return text.trim();
    throw new Error('Empty response');
  } catch {
    // Graceful fallback — no AI dependency for core functionality
    return buildFallbackSummary(audit, useCase);
  }
}

function buildPrompt(audit: AuditReport, useCase: string): string {
  const toolsList = audit.results
    .map(r => `${r.toolName} (${r.plan}, $${r.currentSpend}/mo, ${r.seats} seats)`)
    .join('; ');
  const savingsLine = audit.monthlySavings > 0
    ? `Potential savings: $${audit.monthlySavings}/month ($${audit.annualSavings}/year).`
    : 'Spend appears optimised — no major savings found.';

  return `You are a concise financial analyst. Write a 80-100 word personalized audit summary for a startup using these AI tools: ${toolsList}. Primary use case: ${useCase}. ${savingsLine} Top recommendations: ${audit.results.filter(r => r.savings > 0).map(r => r.recommendedAction + ' ' + r.toolName).join(', ') || 'maintain current stack'}. Be specific, professional, and actionable. No fluff. End with one sentence about what they should do first.`;
}

function buildFallbackSummary(audit: AuditReport, useCase: string): string {
  const topSaver = audit.results.sort((a, b) => b.savings - a.savings)[0];

  if (audit.monthlySavings === 0) {
    return `Your ${useCase}-focused AI stack is well-optimised. Based on your current tool selection and team size, you're paying close to market rate for each plan. No immediate downgrades recommended — continue monitoring usage as your team grows, as thresholds for plan upgrades shift quickly.`;
  }

  return `Your team is spending $${audit.totalCurrentSpend}/month on AI tooling and could reduce that by $${audit.monthlySavings}/month (${audit.savingsPercentage}%) with a few targeted changes. The biggest opportunity is ${topSaver?.toolName}: ${topSaver?.reason.split('.')[0]}. These are not trade-offs in capability — they're plan-fit optimisations. Start with ${topSaver?.toolName} this week.`;
}
