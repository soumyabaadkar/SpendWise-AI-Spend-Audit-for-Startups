import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuditResults from '../components/AuditResults';
import Navbar from '../components/Navbar';
import { getAuditReport } from '../lib/supabase';
import type { AuditReport } from '../utils/auditEngine';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    getAuditReport(id).then(({ data, error }) => {
      if (error || !data) {
        setNotFound(true);
      } else {
        setAudit(data.audit_data?.result || null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFound || !audit) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="text-slate-400">This audit link may have expired or never existed.</p>
        <a href="/" className="text-emerald-400 hover:underline">Run your own free audit →</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Navbar />
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-400 mb-4">
            Shared audit report — identifying details removed
          </div>
          <h1 className="text-2xl font-bold text-white">AI Spend Audit</h1>
        </div>
        <AuditResults audit={audit} />
        <div className="mt-8 bg-slate-900 rounded-xl p-5 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm mb-3">Want to audit your own AI spend?</p>
          <a href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm inline-block transition-all">
            Run your free audit →
          </a>
        </div>
      </div>
    </div>
  );
}
