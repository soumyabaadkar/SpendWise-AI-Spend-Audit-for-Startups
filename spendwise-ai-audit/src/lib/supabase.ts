import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function saveAuditReport(
  auditId: string,
  auditData: object,
  useCase: string,
  teamSize: number
) {
  if (!supabase) return { error: 'Supabase not configured' };
  const { error } = await supabase.from('audits').insert([{
    id: auditId,
    audit_data: auditData,
    use_case: useCase,
    team_size: teamSize,
    created_at: new Date().toISOString(),
  }]);
  return { error };
}

export async function getAuditReport(auditId: string) {
  if (!supabase) return { data: null, error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .single();
  return { data, error };
}

export async function saveLead(payload: {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  monthlySavings: number;
}) {
  if (!supabase) return { error: 'Supabase not configured' };
  const { error } = await supabase.from('leads').insert([{
    email: payload.email,
    company_name: payload.company || null,
    role: payload.role || null,
    team_size: payload.teamSize || null,
    audit_id: payload.auditId,
    monthly_savings: payload.monthlySavings,
    high_savings: payload.monthlySavings >= 500,
    created_at: new Date().toISOString(),
  }]);
  return { error };
}
