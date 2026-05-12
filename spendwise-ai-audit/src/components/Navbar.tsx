export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-5 mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
          <span className="text-slate-900 font-black text-sm">$</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SpendWise</span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">AI Audit</span>
      </div>
      <a
        href="https://credex.rocks"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
      >
        Powered by Credex →
      </a>
    </nav>
  );
}
