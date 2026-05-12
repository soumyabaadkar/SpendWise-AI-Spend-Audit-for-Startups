import { useState, useEffect } from 'react';
import { PRICING, TOOL_LABELS, USE_CASES } from '../utils/pricingData';
import type { ToolInput } from '../utils/auditEngine';

interface Props {
  onAudit: (tools: ToolInput[], useCase: string, teamSize: number) => void;
}

const STORAGE_KEY = 'spendwise_form_state';

function newTool(): ToolInput {
  return {
    id: crypto.randomUUID(),
    name: 'chatgpt',
    plan: 'team',
    monthlySpend: 0,
    seats: 3,
    useCase: '',
  };
}

export default function SpendForm({ onAudit }: Props) {
  const [tools, setTools] = useState<ToolInput[]>([newTool()]);
  const [useCase, setUseCase] = useState('coding');
  const [teamSize, setTeamSize] = useState(5);

  // Persist form across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, useCase, teamSize }));
    } catch { /* ignore */ }
  }, [tools, useCase, teamSize]);

  const updateTool = (id: string, field: keyof ToolInput, value: string | number) => {
    setTools(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, [field]: value };
      // Auto-reset plan when tool changes
      if (field === 'name') {
        const plans = Object.keys(PRICING[value as string]?.plans || {});
        updated.plan = plans[0] || 'pro';
        // Auto-fill spend based on plan
        const priceDef = PRICING[value as string]?.plans[updated.plan];
        if (priceDef && priceDef.pricePerSeat > 0) {
          updated.monthlySpend = priceDef.pricePerSeat * updated.seats;
        }
      }
      if (field === 'plan' || field === 'seats') {
        const planDef = PRICING[t.name]?.plans[field === 'plan' ? value as string : t.plan];
        if (planDef && planDef.pricePerSeat > 0) {
          const seats = field === 'seats' ? Number(value) : t.seats;
          updated.monthlySpend = planDef.pricePerSeat * seats;
        }
      }
      return updated;
    }));
  };

  const addTool = () => setTools(prev => [...prev, newTool()]);
  const removeTool = (id: string) => setTools(prev => prev.filter(t => t.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = tools.filter(t => t.monthlySpend > 0);
    if (valid.length === 0) return;
    onAudit(valid, useCase, teamSize);
  };

  const toolOptions = Object.entries(TOOL_LABELS);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Primary Use Case</label>
          <select
            value={useCase}
            onChange={e => setUseCase(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {USE_CASES.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Team Size</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={teamSize}
            onChange={e => setTeamSize(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tool rows */}
      <div className="space-y-3">
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-medium text-slate-400 px-1">
          <div className="col-span-3">Tool</div>
          <div className="col-span-3">Plan</div>
          <div className="col-span-2">Seats</div>
          <div className="col-span-3">Monthly Spend ($)</div>
          <div className="col-span-1"></div>
        </div>

        {tools.map((tool) => {
          const toolPlans = PRICING[tool.name]?.plans || {};
          const planKeys = Object.keys(toolPlans);

          return (
            <div key={tool.id} className="grid grid-cols-12 gap-3 items-center bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <div className="col-span-12 sm:col-span-3">
                <select
                  value={tool.name}
                  onChange={e => updateTool(tool.id, 'name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {toolOptions.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 sm:col-span-3">
                <select
                  value={tool.plan}
                  onChange={e => updateTool(tool.id, 'plan', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {planKeys.map(p => (
                    <option key={p} value={p}>{toolPlans[p].label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-5 sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={tool.seats}
                  onChange={e => updateTool(tool.id, 'seats', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Seats"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    value={tool.monthlySpend || ''}
                    onChange={e => updateTool(tool.id, 'monthlySpend', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="col-span-1">
                {tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(tool.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors w-full flex justify-center"
                    aria-label="Remove tool"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={addTool}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-600 px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add another tool
        </button>

        <button
          type="submit"
          className="flex-1 sm:flex-none sm:ml-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Run Free Audit
        </button>
      </div>
    </form>
  );
}
