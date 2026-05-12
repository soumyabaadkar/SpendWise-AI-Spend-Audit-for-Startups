import { useState } from 'react';
import SpendForm from '../components/SpendForm';
import AuditResults from '../components/AuditResults';
import LeadCapture from '../components/LeadCapture';
import SummaryCard from '../components/SummaryCard';
import Navbar from '../components/Navbar';
import { runAudit } from '../utils/auditEngine';
import { generateAISummary } from '../services/aiSummary';
import { generateAuditId, getShareUrl } from '../utils/shareUtils';
import { saveAuditReport } from '../lib/supabase';
import type { ToolInput, AuditReport } from '../utils/auditEngine';

export default function Home() {
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditId, setAuditId] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleAudit = async (tools: ToolInput[], useCase: string, teamSize: number) => {
    setAuditLoading(true);
    setSummaryLoading(true);
    setAudit(null);
    setSummary('');

    const result = runAudit(tools, useCase);
    const id = generateAuditId();
    const url = getShareUrl(id);

    setAudit(result);
    setAuditId(id);
    setShareUrl(url);
    setAuditLoading(false);

    // Save to Supabase (fire-and-forget)
    saveAuditReport(id, { tools, result, useCase, teamSize }, useCase, teamSize);

    // AI summary (async, non-blocking)
    generateAISummary(result, useCase).then(s => {
      setSummary(s);
      setSummaryLoading(false);
    });

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Navbar />

        {/* Hero */}
        <section className="text-center py-14 md:py-20">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-4 py-1.5 text-sm text-emerald-400 font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Free · No login required · Instant results
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight">
            Are you overpaying<br />
            <span className="text-emerald-400">for AI tools?</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            Enter your AI subscriptions and get an instant audit — what to cut, what to downgrade, and exactly how much you'll save.
          </p>
          <a
            href="#audit-form"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl inline-flex items-center gap-2 text-sm transition-all"
          >
            Start free audit
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </section>

        {/* Form */}
        <section id="audit-form" className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-1">Your AI tool stack</h2>
          <p className="text-slate-500 text-sm mb-6">Add each tool you pay for. We auto-fill the standard pricing — adjust if you negotiated a deal.</p>
          <SpendForm onAudit={handleAudit} />
        </section>

        {/* Loading */}
        {auditLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Analysing your spend...</p>
          </div>
        )}

        {/* Results */}
        {audit && !auditLoading && (
          <div id="results" className="space-y-6">
            <AuditResults audit={audit} shareUrl={shareUrl} />
            <SummaryCard summary={summary} loading={summaryLoading} />
            <LeadCapture auditId={auditId} monthlySavings={audit.monthlySavings} />
          </div>
        )}

        {/* How it works */}
        {!audit && (
          <section className="mt-16 mb-10">
            <h2 className="text-2xl font-bold text-center text-white mb-10">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: '1', title: 'Enter your tools', body: 'Add each AI subscription — tool, plan, seats, and spend. Takes 90 seconds.' },
                { n: '2', title: 'Get your audit', body: 'Our engine checks your plan fit, usage patterns, and alternative tools with real pricing data.' },
                { n: '3', title: 'Act on savings', body: 'See exactly what to change, in priority order. Share the report with your team or CFO.' },
              ].map(s => (
                <div key={s.n} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                  <div className="w-8 h-8 bg-emerald-950 border border-emerald-800 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm mb-3">{s.n}</div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
