import { PRICING, TOOL_LABELS } from './pricingData';

export interface ToolInput {
  id: string;
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: string;
}

export interface AuditResult {
  toolId: string;
  toolName: string;
  plan: string;
  currentSpend: number;
  seats: number;
  recommendedAction: 'downgrade' | 'switch' | 'optimal' | 'review-usage';
  recommendedPlan?: string;
  recommendedTool?: string;
  recommendedCost: number;
  savings: number;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface AuditReport {
  results: AuditResult[];
  monthlySavings: number;
  annualSavings: number;
  totalCurrentSpend: number;
  savingsPercentage: number;
  tier: 'high' | 'medium' | 'optimal';
}

export function runAudit(tools: ToolInput[], useCase: string): AuditReport {
  const results: AuditResult[] = tools.map((tool) => auditTool(tool, useCase));

  const totalCurrentSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const monthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = totalCurrentSpend > 0
    ? Math.round((monthlySavings / totalCurrentSpend) * 100)
    : 0;

  const tier: 'high' | 'medium' | 'optimal' =
    monthlySavings > 500 ? 'high' :
    monthlySavings > 100 ? 'medium' : 'optimal';

  return { results, monthlySavings, annualSavings, totalCurrentSpend, savingsPercentage, tier };
}

function auditTool(tool: ToolInput, globalUseCase: string): AuditResult {
  const toolDef = PRICING[tool.name];
  const toolName = TOOL_LABELS[tool.name] || tool.name;

  if (!toolDef) {
    return makeResult(tool, toolName, 'optimal', tool.monthlySpend, 0, 'Tool not in database.', 'low');
  }

  const planDef = toolDef.plans[tool.plan];
  const expectedCost = planDef ? planDef.pricePerSeat * tool.seats : tool.monthlySpend;
  const effectiveCase = tool.useCase || globalUseCase;

  // --- CURSOR RULES ---
  if (tool.name === 'cursor') {
    if (tool.plan === 'business' && tool.seats <= 3) {
      const proCost = PRICING.cursor.plans.pro.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', proCost,
        tool.monthlySpend - proCost,
        `Business plan ($40/seat) includes admin controls and SSO — unnecessary for teams of ≤3. Cursor Pro ($20/seat) gives full AI capabilities. Saves $${tool.monthlySpend - proCost}/mo.`,
        'high', 'Pro');
    }
    if (tool.plan === 'enterprise' && tool.seats <= 10) {
      const businessCost = PRICING.cursor.plans.business.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', businessCost,
        tool.monthlySpend - businessCost,
        `Enterprise tier adds custom contracts and SLAs — typically only worth it for 10+ seats with compliance needs. Downgrade to Business saves $${tool.monthlySpend - businessCost}/mo.`,
        'high', 'Business');
    }
    // Copilot overlap check
    if (effectiveCase === 'coding') {
      const copilotCost = PRICING.copilot.plans.individual.pricePerSeat * tool.seats;
      if (copilotCost < tool.monthlySpend * 0.7) {
        return makeResult(tool, toolName, 'switch', copilotCost,
          tool.monthlySpend - copilotCost,
          `GitHub Copilot Individual ($10/seat) covers autocomplete needs for most dev workflows. If you're not using Cursor's chat/agent features heavily, the switch cuts your cost by ${Math.round((1 - copilotCost / tool.monthlySpend) * 100)}%.`,
          'medium', undefined, 'copilot');
      }
    }
  }

  // --- COPILOT RULES ---
  if (tool.name === 'copilot') {
    if (tool.plan === 'enterprise' && tool.seats <= 5) {
      const businessCost = PRICING.copilot.plans.business.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', businessCost,
        tool.monthlySpend - businessCost,
        `Copilot Enterprise ($39/seat) adds Bing search integration and org-level policy controls — unnecessary for small teams. Business plan ($19/seat) offers the same code completion. Saves $${tool.monthlySpend - businessCost}/mo.`,
        'high', 'Business');
    }
    if (tool.plan === 'business' && tool.seats <= 2) {
      const individualCost = PRICING.copilot.plans.individual.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', individualCost,
        tool.monthlySpend - individualCost,
        `Copilot Business adds policy management for teams — redundant for solo/duo setups. Individual plan ($10/seat) is identical in AI capability.`,
        'medium', 'Individual');
    }
  }

  // --- CHATGPT RULES ---
  if (tool.name === 'chatgpt') {
    if (tool.plan === 'team' && tool.seats <= 2) {
      const plusCost = PRICING.chatgpt.plans.plus.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', plusCost,
        tool.monthlySpend - plusCost,
        `ChatGPT Team ($30/seat) adds shared workspaces and admin controls, but for 1–2 users the Plus plan ($20/seat) covers identical model access (GPT-4o, DALL-E). Saves $${tool.monthlySpend - plusCost}/mo.`,
        'high', 'Plus');
    }
    if (tool.plan === 'enterprise' && tool.seats <= 5) {
      const teamCost = PRICING.chatgpt.plans.team.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', teamCost,
        tool.monthlySpend - teamCost,
        `ChatGPT Enterprise ($60/seat) is designed for 10+ seat security & compliance needs. Team plan covers advanced model access at half the price for smaller groups.`,
        'high', 'Team');
    }
    // Writing use case: Claude overlap
    if (effectiveCase === 'writing') {
      const claudeCost = PRICING.claude.plans.pro.pricePerSeat * tool.seats;
      if (claudeCost <= tool.monthlySpend) {
        return makeResult(tool, toolName, 'switch', claudeCost,
          tool.monthlySpend - claudeCost,
          `For writing-heavy workflows, Claude Pro ($20/seat) consistently outperforms ChatGPT on long-form drafts and editing tasks, at the same or lower price. Worth running a 2-week A/B with your team.`,
          'medium', undefined, 'claude');
      }
    }
  }

  // --- CLAUDE RULES ---
  if (tool.name === 'claude') {
    if (tool.plan === 'max' && tool.seats >= 1) {
      const proCost = PRICING.claude.plans.pro.pricePerSeat * tool.seats;
      if (tool.monthlySpend > proCost * 2) {
        return makeResult(tool, toolName, 'downgrade', proCost,
          tool.monthlySpend - proCost,
          `Claude Max ($100/seat) is built for power users who hit Pro rate limits daily. If your team isn't consistently hitting limits, Claude Pro ($20/seat) covers 5x more messages than most users need.`,
          'high', 'Pro');
      }
    }
    if (tool.plan === 'team' && tool.seats < 5) {
      const proCost = PRICING.claude.plans.pro.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', proCost,
        tool.monthlySpend - proCost,
        `Claude Team requires a minimum of 5 seats. If you're paying for fewer, you're billed at 5 anyway. Below that threshold, individual Pro plans ($20/seat) are more economical.`,
        'high', 'Pro');
    }
    if (tool.plan === 'enterprise' && tool.seats < 10) {
      const teamCost = PRICING.claude.plans.team.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', teamCost,
        tool.monthlySpend - teamCost,
        `Claude Enterprise is designed for 10+ seat deployments with SOC 2 compliance needs. For smaller teams, the Team plan gives equivalent model access at a lower price.`,
        'medium', 'Team');
    }
  }

  // --- GEMINI RULES ---
  if (tool.name === 'gemini') {
    if (tool.plan === 'ultra' && effectiveCase === 'coding') {
      const geminiProCost = PRICING.gemini.plans.pro.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', geminiProCost,
        tool.monthlySpend - geminiProCost,
        `Gemini Business ($30/seat) is primarily differentiated by Google Workspace deep integration. For pure coding tasks, Gemini Advanced ($20/seat) or Cursor/Copilot would deliver better ROI.`,
        'medium', 'Pro');
    }
    if (tool.plan === 'pro' && effectiveCase === 'coding') {
      const copilotCost = PRICING.copilot.plans.individual.pricePerSeat * tool.seats;
      if (copilotCost < tool.monthlySpend) {
        return makeResult(tool, toolName, 'switch', copilotCost,
          tool.monthlySpend - copilotCost,
          `GitHub Copilot is purpose-built for in-IDE code completion with deep Git integration. For coding-primary workflows, it typically outperforms Gemini and costs less.`,
          'medium', undefined, 'copilot');
      }
    }
  }

  // --- WINDSURF RULES ---
  if (tool.name === 'windsurf') {
    if (tool.plan === 'teams' && tool.seats <= 3) {
      const proCost = PRICING.windsurf.plans.pro.pricePerSeat * tool.seats;
      return makeResult(tool, toolName, 'downgrade', proCost,
        tool.monthlySpend - proCost,
        `Windsurf Teams ($35/seat) adds admin controls redundant for ≤3 users. Pro plan ($15/seat) gives the same Cascade AI capability.`,
        'medium', 'Pro');
    }
  }

  // --- API DIRECT TOOLS: flag for review ---
  if (tool.plan === 'api' && tool.monthlySpend > 200) {
    return makeResult(tool, toolName, 'review-usage', tool.monthlySpend, 0,
      `API-direct spend of $${tool.monthlySpend}/mo warrants a usage audit. Check your logs for unused endpoints, over-large context windows, or redundant calls. Switching high-volume endpoints to cached responses or smaller models (e.g. Haiku vs Sonnet) can cut costs 30–60%.`,
      'medium');
  }

  // Already optimal
  return makeResult(tool, toolName, 'optimal', expectedCost, 0,
    `Your ${planDef?.label || tool.plan} plan is appropriately sized for ${tool.seats} seat${tool.seats > 1 ? 's' : ''}. No immediate action needed.`,
    'low');
}

function makeResult(
  tool: ToolInput,
  toolName: string,
  action: AuditResult['recommendedAction'],
  recommendedCost: number,
  savings: number,
  reason: string,
  urgency: AuditResult['urgency'],
  recommendedPlan?: string,
  recommendedTool?: string,
): AuditResult {
  return {
    toolId: tool.id,
    toolName,
    plan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
    recommendedAction: action,
    recommendedPlan,
    recommendedTool: recommendedTool ? TOOL_LABELS[recommendedTool] : undefined,
    recommendedCost: Math.round(recommendedCost),
    savings: Math.max(Math.round(savings), 0),
    reason,
    urgency,
  };
}
