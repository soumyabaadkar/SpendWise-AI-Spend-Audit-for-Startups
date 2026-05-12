import type { AuditReport } from '../utils/auditEngine';

interface Props {
  audit: AuditReport;
  shareUrl?: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  downgrade: { label: 'Downgrade Plan', color: 'text-amber-400 bg-amber-400/10 border-amber-500/30' },
  switch: { label: 'Switch Tool', color: 'text-blue-400 bg-blue-400/10 border-blue-500/30' },
  optimal: { label: 'Already Optimal ✓', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30' },
  'review-usage': { label: 'Review Usage', color: 'text-orange-400 bg-orange-400/10 border-orange-500/30' },
};

export default function AuditResults({ audit, shareUrl }: Props) {
  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch {
      prompt('Copy this link:', shareUrl);
    }
  };

  const isHighSavings = audit.monthlySavings >= 500;
  const isOptimal = audit.monthlySavings < 100;

  return (
    <div className="space-y-6">
      {/* Hero savings card */}
      <div className={`rounded-2xl p-8 text-center border ${isHighSavings ? 'bg-emerald-950/60 border-emerald-700/50' : isOptimal ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-800/60 border-slate-700/50'}`}>
        {isOptimal ? (
          <>
            <div className="text-5xl mb-3">✓</div>
            <h2 className="text-3xl font-extrabold text-white mb-2">You're Spending Well</h2>
            <p className="text-slate-400">Your AI stack is well-optimised for your team size. Potential savings: ${audit.monthlySavings}/mo.</p>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-2">Potential Savings Found</div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-1">
              ${audit.monthlySavings.toLocaleString()}<span className="text-2xl text-slate-400 font-normal">/mo</span>
            </h2>
            <div className="text-xl text-emerald-400 font-semibold mb-3">
              ${audit.annualSavings.toLocaleString()} saved per year
            </div>
            <div className="text-slate-400 text-sm">
              {audit.savingsPercentage}% reduction from current ${audit.totalCurrentSpend.toLocaleString()}/mo spend
            </div>
          </>
        )}
      </div>

      {/* Credex CTA for high savings */}
      {isHighSavings && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Credex can help you save more</div>
              <p className="text-white font-semibold text-lg">You're overspending by ${audit.monthlySavings.toLocaleString()}/mo</p>
              <p className="text-slate-400 text-sm mt-1">Credex sources discounted AI credits from companies that overforecast — Cursor, Claude, ChatGPT Enterprise and more.</p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap"
            >
              Book a Credex Call →
            </a>
          </div>
        </div>
      )}

      {/* Per-tool breakdown */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Tool-by-Tool Breakdown</h3>
        <div className="space-y-3">
          {audit.results.map((result) => {
            const action = actionLabels[result.recommendedAction] || actionLabels.optimal;
            return (
              <div key={result.toolId} className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-white text-lg">{result.toolName}</h4>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${action.color}`}>
                        {action.label}
                      </span>
                      {result.urgency === 'high' && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-red-400 bg-red-400/10 border-red-500/30">
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mb-2">
                      Current: <span className="text-white font-medium">{result.plan} plan · {result.seats} seat{result.seats > 1 ? 's' : ''} · ${result.currentSpend}/mo</span>
                    </div>
                    {result.recommendedPlan && (
                      <div className="text-sm text-slate-400 mb-2">
                        Recommended: <span className="text-emerald-400 font-medium">{result.recommendedPlan} plan → ${result.recommendedCost}/mo</span>
                      </div>
                    )}
                    {result.recommendedTool && (
                      <div className="text-sm text-slate-400 mb-2">
                        Consider switching to: <span className="text-blue-400 font-medium">{result.recommendedTool} → ${result.recommendedCost}/mo</span>
                      </div>
                    )}
                    <p className="text-slate-400 text-sm leading-relaxed">{result.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {result.savings > 0 ? (
                      <>
                        <div className="text-2xl font-extrabold text-emerald-400">${result.savings}</div>
                        <div className="text-xs text-slate-500">saved/mo</div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-500">No change</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share button */}
      {shareUrl && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share this audit
          </button>
          <span className="text-xs text-slate-600 truncate max-w-xs">{shareUrl}</span>
        </div>
      )}
    </div>
  );
}
