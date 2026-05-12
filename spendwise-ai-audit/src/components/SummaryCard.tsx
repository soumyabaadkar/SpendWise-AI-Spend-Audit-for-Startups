interface Props {
  summary: string;
  loading: boolean;
}

export default function SummaryCard({ summary, loading }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h3 className="font-semibold text-white text-sm">AI-Generated Summary</h3>
      </div>
      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-600 border-t-purple-400 rounded-full animate-spin"></div>
          Generating personalised analysis...
        </div>
      ) : (
        <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
