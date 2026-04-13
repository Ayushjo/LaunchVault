import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  fetchAllCampaigns, fetchCampaignDetails,
  fmtEth, campaignStateLabel,
  CampaignState, extractError,
  type CampaignListItem, type CampaignDetails,
} from "../hooks/useCampaign";
import { useToast } from "../context/ToastContext";
import { Search, Loader2, ArrowUpRight, RefreshCw, Users, TrendingUp, Clock, Filter } from "lucide-react";
import PageBackground from "../components/layout/PageBackground";
import { motion } from "motion/react";

interface CampaignCard {
  list: CampaignListItem;
  details: CampaignDetails;
}

// State → { label, text color, bg, border, bar color }
const STATE_STYLE: Record<number, { text: string; bg: string; border: string; bar: string }> = {
  0: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", bar: "bg-emerald-400/60" },
  1: { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    bar: "bg-blue-400/60"    },
  2: { text: "text-white/50",    bg: "bg-white/5",        border: "border-white/10",       bar: "bg-white/40"       },
  3: { text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20",     bar: "bg-red-400/40"     },
};

function pct(raised: bigint, goal: bigint) {
  if (!goal) return 0;
  return Math.min(100, Number((raised * BigInt(100)) / goal));
}

function timeLeft(ts: bigint): string {
  const diff = Number(ts) * 1000 - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((diff % 3600000) / 60000)}m left`;
}

function CampaignCardItem({ item, index }: { item: CampaignCard; index: number }) {
  const { details: d } = item;
  const progress = pct(d.totalRaised, d.goal);
  const style = STATE_STYLE[d.campaignState] ?? STATE_STYLE[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/campaign/${d.address}`}
        className="group relative liquid-glass rounded-2xl p-5 flex flex-col gap-4 border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 block"
      >
        {/* State accent line on left */}
        <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${style.bar} opacity-60`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pl-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-body font-medium uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.text} ${style.bg} ${style.border}`}>
                {campaignStateLabel(d.campaignState)}
              </span>
            </div>
            <h3 className="text-white font-heading italic text-xl leading-tight line-clamp-1 group-hover:text-white/80 transition-colors">
              {d.title}
            </h3>
            <p className="text-white/35 font-body text-xs mt-1 line-clamp-2 leading-relaxed">
              {d.description}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Progress */}
        <div className="pl-3">
          <div className="flex justify-between text-xs font-body text-white/35 mb-1.5">
            <span>{fmtEth(d.totalRaised, 3)} ETH raised</span>
            <span className="text-white/55 font-medium">{progress}%</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progress >= 100 ? "bg-emerald-400" : style.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/25 font-body text-xs mt-1">Goal: {fmtEth(d.goal, 2)} ETH</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-white/35 font-body text-xs">
              <Users className="w-3 h-3" />
              {d.investorCount.toString()}
            </span>
            <span className="flex items-center gap-1.5 text-white/35 font-body text-xs">
              <TrendingUp className="w-3 h-3" />
              {d.milestoneCount.toString()} milestones
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-white/25 font-body text-xs">
            <Clock className="w-3 h-3" />
            {timeLeft(d.deadline)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

type FilterState = "all" | "active" | "funded" | "completed";

const FILTER_LABELS: { key: FilterState; label: string }[] = [
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
          try {
            const details = await fetchCampaignDetails(list.address);
            return { list, details };
          } catch { return null; }
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

  const handleRefresh = () => { setRefreshing(true); load(true); };

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.details.title.toLowerCase().includes(search.toLowerCase()) ||
      item.details.description.toLowerCase().includes(search.toLowerCase()) ||
      item.details.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && item.details.campaignState === CampaignState.Active) ||
      (filter === "funded" && item.details.campaignState === CampaignState.Funded) ||
      (filter === "completed" && item.details.campaignState === CampaignState.Completed);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen relative overflow-hidden pt-28 pb-24 px-6">
      <PageBackground />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/25 font-body text-xs uppercase tracking-[0.2em] mb-3"
            >
              On-chain campaigns
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-[0.85]"
            >
              Explore
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-white/35 font-body font-light text-sm mt-2"
            >
              {loading ? "Loading…" : `${items.length} campaign${items.length !== 1 ? "s" : ""} deployed`}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Link
              to="/create"
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              Launch
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </motion.div>
        </div>

        {/* ── Search + filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full liquid-glass rounded-full pl-10 pr-5 py-3 text-sm font-body text-white placeholder-white/20 bg-transparent outline-none focus:ring-1 focus:ring-white/20 transition-all border border-white/[0.04] focus:border-white/10"
            />
          </div>
          <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-0.5 shrink-0 border border-white/[0.04]">
            <Filter className="w-3 h-3 text-white/20 ml-2.5 mr-1" />
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  filter === key ? "bg-white text-black" : "text-white/45 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-6 h-6 text-white/25 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-40 text-center">
            <p className="text-white/25 font-body text-sm">
              {search || filter !== "all" ? "No campaigns match your filters." : "No campaigns deployed yet."}
            </p>
            {!search && filter === "all" && (
              <Link to="/create" className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
                Launch the first campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <CampaignCardItem key={item.details.address} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
