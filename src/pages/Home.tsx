import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlockchainBackground from "../components/BlockchainBackground";
import HowItWorks from "../components/HowItWorks";
import FeatureCards from "../components/FeatureCards";
import {
  fetchAllCampaigns,
  fetchCampaignInfo,
  type OnChainCampaign,
  type CampaignInfo,
} from "../hooks/useCampaign";
import {
  Zap,
  TrendingUp,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Search,
  ChevronRight,
  CheckCircle2,
  Command,
} from "lucide-react";

const categories = [
  "All",
  "CleanTech",
  "HealthTech",
  "EdTech",
  "Logistics",
  "Web3",
  "GovTech",
  "FinTech",
];

const statusConfig = {
  active: {
    label: "Live",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: TrendingUp,
  },
  voting: {
    label: "Voting",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    icon: Clock,
  },
  funded: {
    label: "Funded",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-400",
    icon: CheckCircle2,
  },
  released: {
    label: "Released",
    color: "text-zinc-400",
    bg: "bg-zinc-800 border-zinc-700",
    dot: "bg-zinc-400",
    icon: CheckCircle2,
  },
};

interface DisplayCampaign {
  address: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  investors: number;
  deadline: string;
  tokenSymbol: string;
  founder: string;
  status: "active" | "voting" | "funded" | "released";
}

function formatEth(wei: bigint): number {
  return parseFloat((Number(wei) / 1e18).toFixed(6));
}

function getStatus(
  info: CampaignInfo,
): "active" | "voting" | "funded" | "released" {
  if (info.fundsReleased) return "released";
  if (info.cancelled) return "released";
  if (info.goalReached) return "funded";
  return "active";
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (
    t.includes("solar") ||
    t.includes("green") ||
    t.includes("eco") ||
    t.includes("carbon") ||
    t.includes("energy")
  )
    return "CleanTech";
  if (t.includes("health") || t.includes("med") || t.includes("care"))
    return "HealthTech";
  if (t.includes("edu") || t.includes("learn") || t.includes("school"))
    return "EdTech";
  if (t.includes("logis") || t.includes("supply") || t.includes("ship"))
    return "Logistics";
  if (t.includes("gov") || t.includes("civic") || t.includes("vote"))
    return "GovTech";
  if (
    t.includes("fin") ||
    t.includes("bank") ||
    t.includes("pay") ||
    t.includes("defi")
  )
    return "FinTech";
  return "Web3";
}

function ProgressBar({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-[3px]" : "h-1";
  return (
    <div
      className={`w-full bg-zinc-800 rounded-full ${h} overflow-visible relative`}
    >
      <div
        className={`${h} rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 relative transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        {value > 2 && value < 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)]" />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "active" ? "animate-pulse" : ""}`}
      />
      {cfg.label}
    </span>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [campaigns, setCampaigns] = useState<DisplayCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raw: OnChainCampaign[] = await fetchAllCampaigns();
        const detailed = await Promise.all(
          raw.map(async (c) => {
            try {
              const info: CampaignInfo = await fetchCampaignInfo(c.address);
              return {
                address: c.address,
                title: info.title,
                description: info.description,
                category: guessCategory(info.title),
                goal: formatEth(info.goal),
                raised: formatEth(info.totalRaised),
                investors: 0,
                deadline: new Date(Number(info.deadline) * 1000).toISOString(),
                tokenSymbol: "TOKEN",
                founder: info.founder,
                status: getStatus(info),
              } as DisplayCampaign;
            } catch {
              return null;
            }
          }),
        );
        setCampaigns(detailed.filter(Boolean) as DisplayCampaign[]);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0);
  const totalInvestors = campaigns.reduce((s, c) => s + c.investors, 0);
  const featuredCampaign = filtered.length > 0 ? filtered[0] : null;
  const regularCampaigns = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[90svh] sm:min-h-[85svh]">
        {/* Aurora orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[5%] right-[5%] w-[350px] h-[350px] bg-emerald-600/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <BlockchainBackground />

        <div className="relative max-w-5xl mx-auto w-full z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-zinc-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            Decentralized Funding
            <span className="w-px h-3 bg-white/10" />
            <span className="text-emerald-400 font-bold">Chain 9991</span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up-delay-1 text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tighter mb-6 px-2">
            Fund the Future. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Trust the Code.
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 text-zinc-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium px-4 sm:px-0">
            LaunchVault locks startup funds in smart contracts and releases them
            only when investors approve milestones.{" "}
            <span className="hidden sm:inline text-zinc-500">
              Transparent, secure, unstoppable.
            </span>
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-4 sm:px-0">
            {/* Primary — halo button */}
            <Link
              to="/create"
              className="group w-full sm:w-auto relative flex items-center justify-center gap-2.5 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400/80 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] active:scale-95 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Start Launching
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary — glass */}
            <a
              href="#explore"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 active:scale-95 text-sm sm:text-base backdrop-blur-sm"
            >
              Explore Projects
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <p className="sm:hidden text-xs text-zinc-600 mt-6 font-medium tracking-widest uppercase">
            Transparent · Secure · Unstoppable
          </p>
        </div>

        {/* Scroll hint */}
        <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center opacity-30 hover:opacity-70 transition-opacity">
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-2">
            scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-400 to-transparent" />
        </div>
      </section>

      {/* ── METRICS COMMAND STRIP ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24 relative z-20">
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            {[
              {
                icon: TrendingUp,
                value: `${totalRaised.toFixed(2)}`,
                unit: "ETH",
                label: "Total Volume",
              },
              {
                icon: Users,
                value: `${totalInvestors}`,
                unit: "",
                label: "Global Backers",
              },
              {
                icon: Shield,
                value: `${campaigns.length}`,
                unit: "",
                label: "Live Campaigns",
              },
            ].map(({ icon: Icon, value, unit, label }, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-1 py-5 px-4 sm:px-8"
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                    {value}
                  </span>
                  {unit && (
                    <span className="text-xs text-emerald-400 font-bold">
                      {unit}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeatureCards />

      {/* ── EXPLORE ──────────────────────────────────────────────────────── */}
      <section
        id="explore"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative"
      >
        {/* Section aurora */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-32 left-0 w-[400px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                Discover Projects
              </h2>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full font-mono">
                {loading ? "..." : `${filtered.length}`}
              </span>
            </div>
            <p className="text-zinc-500 font-medium text-sm">
              Find and back the next big thing in Web3.
            </p>
          </div>

          {/* Spotlight search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 bg-zinc-900/50 border border-zinc-800 focus-within:border-emerald-500/50 text-white placeholder-zinc-600 pl-11 pr-16 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <Command className="w-3 h-3 text-zinc-600" />
              <span className="text-[10px] text-zinc-600 font-mono font-bold">
                K
              </span>
            </div>
          </div>
        </div>

        {/* Category tabs — segmented control */}
        <div className="relative mb-10 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 relative text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 uppercase tracking-widest ${
                  activeCategory === cat
                    ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-white/5 via-white/10 to-transparent" />
        </div>

        {/* ── CARDS ── */}
        {loading ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl py-32 text-center">
            <div className="w-8 h-8 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm font-medium tracking-wide">
              Loading campaigns from chain...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-5 relative z-10">
            {/* ── FEATURED ── */}
            {featuredCampaign &&
              (() => {
                const progress =
                  featuredCampaign.goal > 0
                    ? Math.min(
                        (featuredCampaign.raised / featuredCampaign.goal) * 100,
                        100,
                      )
                    : 0;
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(featuredCampaign.deadline).getTime() -
                      Date.now()) /
                      86400000,
                  ),
                );
                return (
                  <div className="animate-fade-up">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 font-black tracking-[0.2em] uppercase text-[10px]">
                          Featured
                        </span>
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                    </div>
                    <Link to={`/campaign/${featuredCampaign.address}`}>
                      <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/60 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                        {/* Top accent line */}
                        <div className="h-px w-full bg-gradient-to-r from-emerald-500/60 via-cyan-400/40 to-transparent" />
                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                        <div className="p-7 sm:p-10 flex flex-col lg:flex-row gap-8 relative z-10">
                          {/* Left */}
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3 flex-wrap">
                              <StatusBadge status={featuredCampaign.status} />
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                                {featuredCampaign.category}
                              </span>
                              <span className="text-[10px] text-zinc-600 font-mono">
                                {featuredCampaign.founder.slice(0, 6)}...
                                {featuredCampaign.founder.slice(-4)}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all duration-300 leading-tight tracking-tight">
                                {featuredCampaign.title}
                              </h3>
                              <p className="text-zinc-400 leading-relaxed line-clamp-2 text-sm sm:text-base">
                                {featuredCampaign.description}
                              </p>
                            </div>

                            {/* Progress */}
                            <div>
                              <div className="flex justify-between items-baseline mb-3">
                                <div className="font-mono text-sm">
                                  <span className="text-white font-bold">
                                    {featuredCampaign.raised}
                                  </span>
                                  <span className="text-zinc-600">
                                    {" "}
                                    / {featuredCampaign.goal} ETH
                                  </span>
                                </div>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black text-sm font-mono">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <ProgressBar value={progress} size="md" />
                            </div>
                          </div>

                          {/* Right sidebar */}
                          <div className="lg:w-52 flex flex-row lg:flex-col gap-3 shrink-0">
                            {[
                              {
                                value: featuredCampaign.investors,
                                label: "Backers",
                              },
                              { value: `${daysLeft}d`, label: "Remaining" },
                              {
                                value: featuredCampaign.category,
                                label: "Sector",
                              },
                            ].map(({ value, label }) => (
                              <div
                                key={label}
                                className="flex-1 lg:flex-none bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                              >
                                <div className="text-xl font-black text-white font-mono">
                                  {value}
                                </div>
                                <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                                  {label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })()}

            {/* ── REGULAR 2-col ── */}
            {regularCampaigns.length > 0 && (
              <div className="animate-fade-up-delay-1 space-y-5">
                <div
                  className={`grid grid-cols-1 ${regularCampaigns.slice(0, 2).length > 1 ? "md:grid-cols-2" : ""} gap-5`}
                >
                  {regularCampaigns.slice(0, 2).map((c) => {
                    const progress =
                      c.goal > 0 ? Math.min((c.raised / c.goal) * 100, 100) : 0;
                    return (
                      <Link key={c.address} to={`/campaign/${c.address}`}>
                        <div className="group bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-6 h-full relative overflow-hidden transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                              <StatusBadge status={c.status} />
                              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                                {c.category}
                              </span>
                            </div>
                            <h3 className="text-white font-black text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all duration-300 line-clamp-1 tracking-tight">
                              {c.title}
                            </h3>
                            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
                              {c.description}
                            </p>
                            <div>
                              <div className="flex justify-between items-baseline mb-2.5">
                                <span className="font-mono text-sm text-white font-bold">
                                  {c.raised}{" "}
                                  <span className="text-zinc-600 font-normal">
                                    / {c.goal} ETH
                                  </span>
                                </span>
                                <span className="font-mono text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <ProgressBar value={progress} size="sm" />
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05] text-[11px] text-zinc-600">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3 h-3" />
                                <span>{c.investors} backers</span>
                              </div>
                              <span className="font-mono">
                                {c.address.slice(0, 6)}...{c.address.slice(-4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ── REST 3-col ── */}
                {regularCampaigns.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {regularCampaigns.slice(2).map((c) => {
                      const progress =
                        c.goal > 0
                          ? Math.min((c.raised / c.goal) * 100, 100)
                          : 0;
                      return (
                        <Link key={c.address} to={`/campaign/${c.address}`}>
                          <div className="group bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-5 h-full relative overflow-hidden transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-3">
                                <StatusBadge status={c.status} />
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                                  {c.category}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-base mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2 tracking-tight">
                                {c.title}
                              </h3>
                              <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                                {c.description}
                              </p>
                              <div>
                                <div className="flex justify-between items-baseline mb-2">
                                  <span className="font-mono text-xs text-white font-bold">
                                    {c.raised}{" "}
                                    <span className="text-zinc-600 font-normal">
                                      / {c.goal} ETH
                                    </span>
                                  </span>
                                  <span className="font-mono text-[10px] font-black text-emerald-400">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <ProgressBar value={progress} size="sm" />
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05] text-[10px] text-zinc-700">
                                <div className="flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{c.investors}</span>
                                </div>
                                <span className="font-mono">
                                  {c.address.slice(0, 6)}...
                                  {c.address.slice(-4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-3xl py-32 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-white/[0.06] mb-6">
              <div className="absolute inset-0 bg-zinc-700/20 rounded-2xl animate-ping opacity-10" />
              <Search className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">
              No projects found
            </h3>
            <p className="text-zinc-600 text-sm max-w-sm mx-auto">
              {search || activeCategory !== "All"
                ? "Try a different search term or category filter."
                : "No campaigns deployed yet. Be the first to launch!"}
            </p>
            {!search && activeCategory === "All" && (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 mt-6 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <Zap className="w-4 h-4 text-emerald-400" /> Create First
                Campaign
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-32 pt-24 text-center relative overflow-hidden">
        {/* Gradient border wrapper */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 rounded-3xl blur-sm" />
          <div className="relative bg-zinc-950 border border-white/[0.06] rounded-3xl px-8 py-16 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
            {/* Inner aurora */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full scale-150" />
                <div className="relative bg-white/[0.04] border border-white/[0.08] p-4 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tighter">
                Ready to Build?
              </h2>
              <p className="text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                Create your campaign in minutes, define your milestones, and let
                the community fund your vision trustlessly.
              </p>

              {/* White CTA — premium */}
              <Link
                to="/create"
                className="group inline-flex items-center gap-2.5 bg-white text-black hover:bg-zinc-100 font-black px-8 py-4 rounded-xl transition-all duration-200 active:scale-95 text-sm sm:text-base tracking-tight"
              >
                Start Your Campaign
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <p className="mt-6 text-[10px] text-zinc-700 uppercase tracking-[0.2em] font-semibold">
                No middlemen · Smart contract secured · Instant settlement
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
