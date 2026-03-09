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
    icon: TrendingUp,
  },
  voting: {
    label: "Voting",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  funded: {
    label: "Funded",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: CheckCircle2,
  },
  released: {
    label: "Released",
    color: "text-slate-300",
    bg: "bg-slate-800 border-slate-700",
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
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[90svh] sm:min-h-[85svh]">
        <BlockchainBackground />
        <div className="relative max-w-5xl mx-auto w-full z-10 flex flex-col items-center">
          <div className="animate-fade-up inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-emerald-400 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8 tracking-widest uppercase">
            <span className="w-2 h-2 bg-emerald-500 rounded-full pulse-dot shrink-0" />
            Decentralized Funding
          </div>
          <h1 className="animate-fade-up-delay-1 text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-6 px-2">
            Fund the Future. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Trust the Code.
            </span>
          </h1>
          <p className="animate-fade-up-delay-2 text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-medium px-4 sm:px-0">
            LaunchVault locks startup funds in smart contracts and releases them
            only when investors approve milestones.{" "}
            <span className="hidden sm:inline">
              Transparent, secure, unstoppable.
            </span>
          </p>
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
            <Link
              to="/create"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/25 active:scale-95 text-sm sm:text-base"
            >
              Start Launching
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#explore"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 active:scale-95 text-sm sm:text-base"
            >
              Explore Projects
            </a>
          </div>
          <p className="sm:hidden text-xs text-slate-600 mt-6 font-medium">
            Transparent · Secure · Unstoppable
          </p>
        </div>
        <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up-delay-4 flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
            Scroll to explore
          </span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-slate-400 to-transparent rounded-full" />
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 relative z-20">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[
            {
              icon: TrendingUp,
              value: `${totalRaised} ETH`,
              label: "Total Volume",
            },
            { icon: Users, value: totalInvestors, label: "Global Backers" },
            { icon: Shield, value: campaigns.length, label: "Live Campaigns" },
          ].map(({ icon: Icon, value, label }, i) => (
            <div
              key={i}
              className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-5 animate-fade-up-delay-${i + 1} text-center sm:text-left`}
            >
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3.5 rounded-xl">
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-3xl font-black text-white tracking-tight">
                  {value}
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />
      <FeatureCards />

      {/* Explore */}
      <section
        id="explore"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Discover Projects
              </h2>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full">
                {loading ? "..." : `${filtered.length} live`}
              </span>
            </div>
            <p className="text-slate-400 font-medium">
              Find and back the next big thing in Web3.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="relative mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 relative text-xs font-black px-5 py-2.5 rounded-full transition-all duration-300 uppercase tracking-widest ${
                  activeCategory === cat
                    ? "text-slate-950"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {activeCategory === cat && (
                  <span className="absolute inset-0 bg-emerald-400 rounded-full" />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-800" />
        </div>

        {/* Cards */}
        {loading ? (
          <div className="glass-card rounded-3xl py-32 text-center">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium">
              Loading campaigns from chain...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6">
            {/* Featured */}
            {featuredCampaign && (
              <div className="animate-fade-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
                    <span className="text-emerald-400 font-black tracking-widest uppercase text-xs">
                      Featured
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                </div>
                <Link to={`/campaign/${featuredCampaign.address}`}>
                  <div className="glass-card rounded-3xl overflow-hidden group relative border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500">
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
                    <div className="p-8 flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" />
                            {statusConfig[featuredCampaign.status].label}
                          </span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            {featuredCampaign.category}
                          </span>
                          <span className="text-xs text-slate-600 font-mono">
                            by {featuredCampaign.founder.slice(0, 10)}...
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors leading-tight">
                            {featuredCampaign.title}
                          </h3>
                          <p className="text-slate-400 leading-relaxed line-clamp-2">
                            {featuredCampaign.description}
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-white text-2xl font-black">
                              {featuredCampaign.raised}
                              <span className="text-slate-500 text-base font-normal ml-1">
                                / {featuredCampaign.goal} ETH
                              </span>
                            </span>
                            <span className="text-emerald-400 font-black">
                              {featuredCampaign.goal > 0
                                ? Math.round(
                                    (featuredCampaign.raised /
                                      featuredCampaign.goal) *
                                      100,
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                              style={{
                                width: `${Math.min(featuredCampaign.goal > 0 ? (featuredCampaign.raised / featuredCampaign.goal) * 100 : 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-56 flex lg:flex-col justify-between gap-4 lg:gap-0 lg:justify-start lg:space-y-4 shrink-0">
                        <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                          <div className="text-2xl font-black text-white">
                            {featuredCampaign.investors}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            Backers
                          </div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                          <div className="text-2xl font-black text-white">
                            {Math.max(
                              0,
                              Math.ceil(
                                (new Date(featuredCampaign.deadline).getTime() -
                                  Date.now()) /
                                  86400000,
                              ),
                            )}
                            d
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            Remaining
                          </div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {featuredCampaign.category}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            Sector
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Regular — 2 col */}
            {regularCampaigns.length > 0 && (
              <div className="animate-fade-up-delay-1 space-y-5">
                <div
                  className={`grid grid-cols-1 ${regularCampaigns.slice(0, 2).length > 1 ? "md:grid-cols-2" : ""} gap-5`}
                >
                  {regularCampaigns.slice(0, 2).map((c) => {
                    const progress =
                      c.goal > 0 ? Math.min((c.raised / c.goal) * 100, 100) : 0;
                    const status = statusConfig[c.status];
                    const borderAccent = {
                      active: "border-l-emerald-500",
                      voting: "border-l-amber-500",
                      funded: "border-l-blue-500",
                      released: "border-l-slate-500",
                    }[c.status];
                    return (
                      <Link key={c.address} to={`/campaign/${c.address}`}>
                        <div
                          className={`glass-card rounded-2xl p-6 h-full group relative overflow-hidden border-l-2 ${borderAccent} hover:scale-[1.02] transition-all duration-300`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}
                            >
                              {status.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {c.category}
                            </span>
                          </div>
                          <h3 className="text-white font-black text-xl mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {c.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-5">
                            {c.description}
                          </p>
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-white font-bold text-sm">
                                {c.raised}{" "}
                                <span className="text-slate-500 font-normal">
                                  / {c.goal} ETH
                                </span>
                              </span>
                              <span className="text-emerald-400 text-xs font-black">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {c.investors} backers
                            </div>
                            <div className="font-mono truncate max-w-[100px]">
                              {c.address.slice(0, 10)}...
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Rest — 3 col */}
                {regularCampaigns.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {regularCampaigns.slice(2).map((c) => {
                      const progress =
                        c.goal > 0
                          ? Math.min((c.raised / c.goal) * 100, 100)
                          : 0;
                      const status = statusConfig[c.status];
                      const borderAccent = {
                        active: "border-l-emerald-500",
                        voting: "border-l-amber-500",
                        funded: "border-l-blue-500",
                        released: "border-l-slate-500",
                      }[c.status];
                      return (
                        <Link key={c.address} to={`/campaign/${c.address}`}>
                          <div
                            className={`glass-card rounded-2xl p-5 h-full group relative overflow-hidden border-l-2 ${borderAccent} hover:scale-[1.02] transition-all duration-300`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${status.bg} ${status.color}`}
                              >
                                {status.label}
                              </span>
                              <span className="text-xs text-slate-500">
                                {c.category}
                              </span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {c.title}
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                              {c.description}
                            </p>
                            <div>
                              <div className="flex justify-between items-baseline mb-1.5">
                                <span className="text-white font-bold text-xs">
                                  {c.raised}{" "}
                                  <span className="text-slate-500 font-normal">
                                    / {c.goal} ETH
                                  </span>
                                </span>
                                <span className="text-emerald-400 text-xs font-black">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-800/50 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {c.investors}
                              </div>
                              <div className="font-mono truncate max-w-[80px]">
                                {c.address.slice(0, 10)}...
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
          <div className="glass-card rounded-3xl py-32 text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
              <div className="absolute inset-0 bg-slate-700/50 rounded-full animate-ping opacity-20" />
              <Search className="w-9 h-9 text-slate-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {search || activeCategory !== "All"
                ? "Try a different search term or category filter."
                : "No campaigns deployed yet. Be the first to launch!"}
            </p>
            {!search && activeCategory === "All" && (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
              >
                <Zap className="w-4 h-4" /> Create First Campaign
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-800/50 bg-slate-900/20 pt-24 pb-32 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-6 shadow-xl shadow-emerald-500/5 border border-emerald-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
            Ready to Build?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Create your campaign in minutes, define your milestones, and let the
            community fund your vision trustlessly.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-200 font-bold px-8 py-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            Start Your Campaign
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
