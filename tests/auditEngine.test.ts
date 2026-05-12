import { describe, it, expect } from 'vitest';
import { runAudit } from '../src/utils/auditEngine';
import type { ToolInput } from '../src/utils/auditEngine';

function tool(overrides: Partial<ToolInput>): ToolInput {
  return {
    id: crypto.randomUUID(),
    name: 'chatgpt',
    plan: 'team',
    monthlySpend: 60,
    seats: 2,
    useCase: 'mixed',
    ...overrides,
  };
}

describe('Audit Engine — ChatGPT', () => {
  it('recommends downgrade from Team to Plus for ≤2 seats', () => {
    const result = runAudit([tool({ name: 'chatgpt', plan: 'team', seats: 2, monthlySpend: 60 })], 'mixed');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('downgrade');
    expect(r.savings).toBeGreaterThan(0);
    expect(r.recommendedPlan).toBe('Plus');
  });

  it('does NOT recommend downgrade for Team with 5 seats (economical)', () => {
    const result = runAudit([tool({ name: 'chatgpt', plan: 'team', seats: 5, monthlySpend: 150 })], 'mixed');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('optimal');
  });

  it('recommends downgrade from Enterprise for ≤5 seats', () => {
    const result = runAudit([tool({ name: 'chatgpt', plan: 'enterprise', seats: 4, monthlySpend: 240 })], 'mixed');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('downgrade');
    expect(r.savings).toBeGreaterThan(0);
  });
});

describe('Audit Engine — Cursor', () => {
  it('recommends downgrade from Business to Pro for ≤3 seats', () => {
    const result = runAudit([tool({ name: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 })], 'coding');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('downgrade');
    expect(r.savings).toBe(40); // 80 - (20*2)
  });

  it('keeps Cursor Business optimal for 10 seats', () => {
    const result = runAudit([tool({ name: 'cursor', plan: 'business', seats: 10, monthlySpend: 400 })], 'coding');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('optimal');
  });
});

describe('Audit Engine — Copilot', () => {
  it('recommends downgrade from Enterprise to Business for ≤5 seats', () => {
    const result = runAudit([tool({ name: 'copilot', plan: 'enterprise', seats: 3, monthlySpend: 117 })], 'coding');
    const r = result.results[0];
    expect(r.recommendedAction).toBe('downgrade');
    expect(r.recommendedPlan).toBe('Business');
  });
});

describe('Audit Engine — Totals', () => {
  it('correctly sums savings across multiple tools', () => {
    const tools = [
      tool({ name: 'chatgpt', plan: 'team', seats: 2, monthlySpend: 60 }),
      tool({ name: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 }),
    ];
    const result = runAudit(tools, 'mixed');
    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.annualSavings).toBe(result.monthlySavings * 12);
    expect(result.savingsPercentage).toBeGreaterThan(0);
    expect(result.savingsPercentage).toBeLessThanOrEqual(100);
  });

  it('returns optimal tier when no savings found', () => {
    const tools = [tool({ name: 'chatgpt', plan: 'plus', seats: 1, monthlySpend: 20 })];
    const result = runAudit(tools, 'mixed');
    expect(result.tier).toBe('optimal');
    expect(result.monthlySavings).toBe(0);
  });

  it('returns high tier when savings exceed $500/mo', () => {
    const tools = [
      tool({ name: 'chatgpt', plan: 'enterprise', seats: 20, monthlySpend: 1200 }),
      tool({ name: 'cursor', plan: 'enterprise', seats: 20, monthlySpend: 1200 }),
    ];
    const result = runAudit(tools, 'coding');
    expect(result.tier).toBe('high');
  });
});

describe('Audit Engine — Claude', () => {
  it('recommends downgrade from Max when spend is far above Pro baseline', () => {
    const result = runAudit([tool({ name: 'claude', plan: 'max', seats: 3, monthlySpend: 300 })], 'mixed');
    const r = result.results[0];
    // Pro would be $60 — Max is $300, which is more than 2x Pro
    expect(r.recommendedAction).toBe('downgrade');
  });
});
