import { ShieldCheck, Coins, BarChart3, Repeat2, Globe, Zap } from "lucide-react";

interface TokenItem {
  label: string;
  pct: number;
  color: string;
}

interface TxItem {
  hash: string;
  label: string;
  time: string;
}

interface FlowItem {
  label: string;
  icon: string;
  color: string;
}

export default function FeatureCards() {
  const tokenItems: TokenItem[] = [
    { label: "Investor A", pct: 40, color: "bg-blue-400" },
    { label: "Investor B", pct: 35, color: "bg-blue-500" },
    { label: "Others", pct: 25, color: "bg-blue-800" },
  ];

  const txItems: TxItem[] = [
    { hash: "0xf4a2...b391", label: "Fund Lock", time: "2m ago" },
    { hash: "0x9c12...44ef", label: "Vote Cast", time: "5m ago" },
    { hash: "0x3d87...a12c", label: "Milestone", time: "1h ago" },
  ];

  const flowItems: FlowItem[] = [
    { label: "Goal Not Reached", icon: "✗", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    { label: "Contract Unlocks", icon: "⟳", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "ETH Returned", icon: "✓", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ];

  const countries: string[] = [
    "🇺🇸 USA", "🇮🇳 India", "🇩🇪 Germany", "🇧🇷 Brazil",
    "🇯🇵 Japan", "🇳🇬 Nigeria", "🇸🇬 Singapore", "🌍 +190",
  ];

  const escrowLabels: string[] = ["Investor ✓", "Contract ✓", "Founder ✓"];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
          Why LaunchVault
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
          Built for the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            Next Generation
          </span>{" "}
          of Funding
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
          We replace outdated funding models with smart contracts that enforce
          accountability automatically.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">

        {/* Card 1 — Trustless Escrow — wide, row 1 */}
        <div className="md:col-span-7 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Decorative lock SVG */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <rect x="20" y="55" width="80" height="60" rx="12" fill="#10b981" />
              <path d="M35 55V40C35 24 85 24 85 40V55" stroke="#10b981" strokeWidth="8" strokeLinecap="round" fill="none" />
              <circle cx="60" cy="82" r="8" fill="#020617" />
              <rect x="57" y="82" width="6" height="12" rx="3" fill="#020617" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl w-fit mb-5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl mb-3">Trustless Escrow</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Funds are locked in audited smart contracts. No human can move them without investor approval. Code is law.
              </p>
            </div>
          </div>

          {/* Mini contract visual */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
            {escrowLabels.map((t: string, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs text-slate-300 font-mono">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — Token Ownership — narrow, row 1 */}
        <div className="md:col-span-5 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Decorative token ring */}
          <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              <circle cx="70" cy="70" r="60" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" />
              <circle cx="70" cy="70" r="40" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="70" cy="70" r="20" fill="#3b82f6" opacity="0.3" />
              <text x="70" y="75" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">ERC20</text>
            </svg>
          </div>

          <div className="relative z-10">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl w-fit mb-5">
              <Coins className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-black text-2xl mb-3">Token Ownership</h3>
            <p className="text-slate-400 leading-relaxed">
              Every investor receives ERC-20 governance tokens proportional to their contribution.
            </p>
          </div>

          {/* Token distribution visual */}
          <div className="mt-6 space-y-2">
            {tokenItems.map((item: TokenItem, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16 shrink-0">{item.label}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div className={`${item.color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 font-bold w-8">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Full Transparency — narrow, row 2 */}
        <div className="md:col-span-4 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-500 min-h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10">
            <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-2xl w-fit mb-5">
              <BarChart3 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-white font-black text-2xl mb-3">Full Transparency</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every transaction, vote, and fund movement is recorded on-chain and publicly verifiable.
            </p>
          </div>

          {/* Mini block explorer visual */}
          <div className="mt-6 space-y-2">
            {txItems.map((tx: TxItem, i: number) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0" />
                  <span className="text-xs text-violet-300 font-mono">{tx.hash}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{tx.label}</span>
                  <span className="text-xs text-slate-600">{tx.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 — Refund Protection — wide, row 2 */}
        <div className="md:col-span-8 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 min-h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 h-full">
            <div className="flex-1">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl w-fit mb-5">
                <Repeat2 className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-black text-2xl mb-3">Refund Protection</h3>
              <p className="text-slate-400 leading-relaxed">
                If a campaign doesn't hit its goal before the deadline, investors get their ETH back automatically. No questions asked.
              </p>
            </div>

            {/* Refund flow visual */}
            <div className="flex flex-col justify-center gap-3 md:w-52 shrink-0">
              {flowItems.map((item: FlowItem, i: number) => (
                <div key={i}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${item.color}`}>
                    <span className="text-sm font-black">{item.icon}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                  {i < 2 && (
                    <div className="flex justify-center">
                      <div className="w-px h-3 bg-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 5 — Borderless Access — wide, row 3 */}
        <div className="md:col-span-8 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-500 min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* World grid decorative */}
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-5 group-hover:opacity-10 transition-opacity overflow-hidden pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {[0, 1, 2, 3, 4, 5, 6].map((i: number) => (
                <line key={`h${i}`} x1="0" y1={i * 33} x2="200" y2={i * 33} stroke="#f43f5e" strokeWidth="0.5" />
              ))}
              {[0, 1, 2, 3, 4, 5, 6].map((i: number) => (
                <line key={`v${i}`} x1={i * 33} y1="0" x2={i * 33} y2="200" stroke="#f43f5e" strokeWidth="0.5" />
              ))}
              {([[40, 60], [80, 40], [120, 80], [160, 50], [100, 120], [60, 140]] as [number, number][]).map(([x, y], i: number) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#f43f5e" opacity="0.8" />
              ))}
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl w-fit mb-5">
                <Globe className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-white font-black text-2xl mb-3">Borderless Access</h3>
              <p className="text-slate-400 leading-relaxed">
                Anyone with a crypto wallet can invest in or create campaigns from anywhere in the world. No banks, no borders.
              </p>
            </div>

            {/* Country pills */}
            <div className="flex flex-wrap gap-2 md:max-w-xs">
              {countries.map((c: string, i: number) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 6 — Instant Settlement — narrow, row 3 */}
        <div className="md:col-span-4 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl w-fit mb-5">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-black text-2xl mb-3">Instant Settlement</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Approved milestones trigger immediate fund release. No wire transfers, no waiting.
            </p>
          </div>

          {/* Speed visual */}
          <div className="mt-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Traditional</span>
              <span className="text-xs text-red-400 font-bold">3-5 days</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
              <div className="bg-red-500/50 h-1.5 rounded-full w-full" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">LaunchVault</span>
              <span className="text-xs text-emerald-400 font-bold">&lt; 15 sec</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-emerald-400 h-1.5 rounded-full w-[8%]" />
            </div>

            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
              <span className="text-emerald-400 font-black text-sm">99.9% faster</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}