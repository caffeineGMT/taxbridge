export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="h-12 w-80 mx-auto bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-96 mx-auto bg-slate-800/60 rounded animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-800/40 rounded-xl border border-slate-700 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
