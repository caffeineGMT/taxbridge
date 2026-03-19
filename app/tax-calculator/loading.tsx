export default function TaxCalculatorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-96 bg-slate-800/60 rounded animate-pulse" />
          <div className="space-y-4 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-800/40 rounded-lg border border-slate-700 animate-pulse" />
            ))}
          </div>
          <div className="h-12 w-full bg-emerald-800/30 rounded-lg animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}
