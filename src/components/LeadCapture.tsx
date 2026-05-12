import { useState } from 'react';
import { saveLead } from '../lib/supabase';

interface Props {
  auditId: string;
  monthlySavings: number;
  onCapture?: () => void;
}

export default function LeadCapture({ auditId, monthlySavings, onCapture }: Props) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [honeypot, setHoneypot] = useState(''); // spam trap
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isHighSavings = monthlySavings >= 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Bot detected
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }

    setLoading(true);
    setError('');

    const { error: saveErr } = await saveLead({
      email,
      company,
      role,
      teamSize: teamSize ? Number(teamSize) : undefined,
      auditId,
      monthlySavings,
    });

    setLoading(false);

    if (saveErr) {
      // Still show success — don't block user on backend issues
      console.error('Lead save error:', saveErr);
    }

    setSubmitted(true);
    onCapture?.();
  };

  if (submitted) {
    return (
      <div className="bg-slate-800/60 rounded-xl p-6 border border-emerald-700/40 text-center">
        <div className="text-3xl mb-2">✓</div>
        <h3 className="font-bold text-white text-lg mb-1">Report saved!</h3>
        <p className="text-slate-400 text-sm">
          {isHighSavings
            ? "We'll send your full report and a Credex team member will reach out about savings opportunities."
            : "We'll notify you when new optimizations apply to your stack."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
      <h3 className="font-bold text-white text-lg mb-1">
        {isHighSavings ? '📬 Get your full savings report' : '🔔 Get notified of new optimizations'}
      </h3>
      <p className="text-slate-400 text-sm mb-5">
        {isHighSavings
          ? `We found $${monthlySavings}/mo in potential savings. Enter your email and we'll send the detailed report + next steps.`
          : "Your stack looks optimized. We'll ping you when better options become available for your tools."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          autoComplete="off"
        />

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Work email *"
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Role (optional)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            value={teamSize}
            onChange={e => setTeamSize(e.target.value)}
            placeholder="Team size (optional)"
            min="1"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all"
        >
          {loading ? 'Saving...' : isHighSavings ? 'Send me the full report' : 'Notify me of updates'}
        </button>

        <p className="text-xs text-slate-600 text-center">No spam. Unsubscribe anytime.</p>
      </form>
    </div>
  );
}
