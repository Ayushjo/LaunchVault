import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  fetchAllCampaigns, fetchCampaignDetails,
  fmtEth, campaignStateLabel,
  CampaignState, extractError,
  type CampaignListItem, type CampaignDetails,
} from "../hooks/useCampaign";
import { useToast } from "../context/ToastContext";
import {
  Search, Loader2, ArrowUpRight, RefreshCw,
  Users, TrendingUp, Clock,
} from "lucide-react";
import PageBackground from "../components/layout/PageBackground";
import { motion } from "motion/react";

interface CampaignCard { list: CampaignListItem; details: CampaignDetails; }

const STATE: Record<number, { label: string; dot: string; text: string; bg: string; border: string }> = {
  0: { label: "Active",    dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/8",  border: "border-emerald-400/20" },
  1: { label: "Funded",    dot: "bg-blue-400",    text: "text-blue-400",    bg: "bg-blue-400/8",     border: "border-blue-400/20"    },
  2: { label: "Completed", dot: "bg-white/40",    text: "text-white/40",    bg: "bg-white/5",        border: "border-white/10"       },
  3: { label: "Cancelled", dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-400/8",      border: "border-red-400/20"     },
};

function pct(raised: bigint, goal: bigint) {
  if (!goal) return 0;
  return Math.min(100, Number((raised * 100n) / goal));
}

function timeLeft(ts: bigint): string {
  const diff = Number(ts) * 1000 - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d left` : `${h}h left`;
}

// Deterministic gradient from address
function addrGradient(addr: string) {
  const h = parseInt(addr.slice(2, 6), 16) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, hsl(${h},70%,45%) 0%, hsl(${h2},60%,35%) 100%)`;
}

function initials(title: string) {
  return title.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function ProgressBar({ value, state }: { value: number; state: number }) {
  const bar =
    value >= 100
      ? "bg-emerald-400"
      : state === 0
      ? "bg-gradient-to-r from-violet-500 to-blue-500"
      : state === 1
      ? "bg-gradient-to-r from-blue-400 to-cyan-400"
      : "bg-white/30";
  return (
    <div className="h-0.5 w-full bg-white/6 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${bar}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function CampaignCardItem({ item, index }: { item: CampaignCard; index: number }) {
  const { details: d } = item;
  const progress = pct(d.totalRaised, d.goal);
  const st = STATE[d.campaignState] ?? STATE[2];
  const grad = addrGradient(d.address);
  const ms = Number(d.milestoneCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/campaign/${d.address}`}
        className="group relative flex flex-col gap-5 rounded-2xl p-5 border border-white/6 bg-white/[0.02] card-glow block overflow-hidden"
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Avatar + title */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-heading italic shadow-lg"
            style={{ background: grad }}
          >
            {initials(d.title)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`flex items-center gap-1.5 tag ${st.text} ${st.bg} ${st.border}`}>
                <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                {campaignStateLabel(d.campaignState)}
              </div>
            </div>
            <h3 className="text-white font-body font-semibold text-[15px] leading-snug line-clamp-1 group-hover:text-white/80 transition-colors">
              {d.title}
            </h3>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0 mt-0.5" />
        </div>

        {/* Description */}
        <p className="text-white/35 font-body text-[13px] leading-relaxed line-clamp-2 -mt-1">
          {d.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] font-body">
            <span className="text-white/40">
              <span className="text-white/70 font-medium">{fmtEth(d.totalRaised, 3)}</span> ETH raised
            </span>
            <span className={`font-semibold tabular-nums ${progress >= 100 ? "text-emerald-400" : "text-white/55"}`}>
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} state={d.campaignState} />
          <div className="flex items-center justify-between text-[11px] font-body text-white/25">
            <span>Goal: {fmtEth(d.goal, 2)} ETH</span>
            <span className="font-mono">{d.address.slice(0, 6)}…{d.address.slice(-4)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5 text-white/30 text-[12px] font-body">
              <Users className="w-3 h-3" />
              {d.investorCount.toString()} investor{d.investorCount !== 1n ? "s" : ""}
            </span>
            {/* Milestone dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: ms }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < Number(d.currentMilestoneIndex)
                      ? "bg-emerald-400/70"
                      : i === Number(d.currentMilestoneIndex) && d.campaignState !== CampaignState.Completed
                      ? "bg-white/50"
                      : "bg-white/12"
                  }`}
                />
              ))}
              <span className="text-white/25 text-[11px] font-body ml-1">{ms}ms</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-white/25 text-[12px] font-body">
            <Clock className="w-3 h-3" />
            {timeLeft(d.deadline)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

type FilterState = "all" | "active" | "funded" | "completed";
const FILTERS: { key: FilterState; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "funded", label: "Funded" },
  { key: "completed", label: "Completed" },
];

export default function Explore(): JSX.Element {
  const toast = useToast();
  const [items, setItems] = useState<CampaignCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterState>("all");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const all = await fetchAllCampaigns();
      const enriched = await Promise.all(
        all.map(async (list) => {
          try { const details = await fetchCampaignDetails(list.address); return { list, details }; }
          catch { return null; }
        })
      );
      setItems(enriched.filter(Boolean) as CampaignCard[]);
    } catch (err) {
      toast.error("Failed to load campaigns", extractError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.details.title.toLowerCase().includes(q) ||
      item.details.description.toLowerCase().includes(q) ||
      item.details.address.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "active" && item.details.campaignState === CampaignState.Active) ||
      (filter === "funded" && item.details.campaignState === CampaignState.Funded) ||
      (filter === "completed" && item.details.campaignState === CampaignState.Completed);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen relative overflow-hidden pt-24 pb-28 px-5 md:px-8">
      <PageBackground />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 mt-4">
          <div>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 font-body text-[11px] uppercase tracking-[0.18em] mb-3"
            >
              On-chain · {loading ? "—" : items.length} campaigns
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl font-heading italic text-white tracking-tight leading-[0.88]"
            >
              Explore
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <Link to="/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-body font-medium text-white bg-white/7 border border-white/10 hover:bg-white/12 transition-colors">
              Launch
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => { setRefreshing(true); load(true); }} disabled={refreshing || loading}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/8 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-30">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </motion.div>
        </div>

        {/* Search + filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-2.5 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-full pl-9 pr-4 text-[13px] font-body text-white placeholder-white/20 bg-white/4 border border-white/8 outline-none focus:border-white/18 focus:bg-white/6 transition-all"
            />
          </div>
          {/* Filter pills */}
          <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-full px-1.5 py-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1 rounded-full text-[12px] font-body font-medium transition-all duration-150 ${
                  filter === key
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          /* Skeleton cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 rounded-full shimmer" />
                    <div className="h-4 w-32 rounded-full shimmer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full shimmer" />
                  <div className="h-3 w-3/4 rounded-full shimmer" />
                </div>
                <div className="h-0.5 w-full rounded-full shimmer" />
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded-full shimmer" />
                  <div className="h-3 w-12 rounded-full shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-40 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white/20" />
            </div>
            <p className="text-white/30 font-body text-[13px]">
              {search || filter !== "all" ? "No campaigns match your filters." : "No campaigns deployed yet."}
            </p>
            {!search && filter === "all" && (
              <Link to="/create"
                className="mt-2 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-body font-medium text-white bg-white/7 border border-white/10 hover:bg-white/12 transition-colors">
                Launch the first campaign
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((item, i) => (
              <CampaignCardItem key={item.details.address} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
