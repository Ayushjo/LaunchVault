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
  Users, TrendingUp, Clock, Filter,
} from "lucide-react";

interface CampaignCard {
  list: CampaignListItem;
  details: CampaignDetails;
}

const STATE_COLORS: Record<number, string> = {
  0: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  1: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  2: "text-white/40 bg-white/5 border-white/10",
  3: "text-red-400 bg-red-400/10 border-red-400/20",
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

function Card({ item }: { item: CampaignCard }) {
  const { details: d } = item;
  const progress = pct(d.totalRaised, d.goal);

  return (
    <Link
      to={`/campaign/${d.address}`}
      className="liquid-glass rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.02] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-heading italic text-xl leading-tight line-clamp-1 group-hover:text-white/80 transition-colors">
            {d.title}
          </h3>
          <p className="text-white/40 font-body text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {d.description}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full border ${STATE_COLORS[d.campaignState]}`}>
            {campaignStateLabel(d.campaignState)}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-body text-white/40 mb-1.5">
          <span>{fmtEth(d.totalRaised, 3)} ETH raised</span>
          <span className="text-white/60 font-medium">{progress}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-400" : "bg-white/70"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-body text-white/30 mt-1">
          <span>Goal: {fmtEth(d.goal, 2)} ETH</span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-white/40 font-body text-xs">
            <Users className="w-3 h-3" />
            {d.investorCount.toString()} investors
          </span>
          <span className="flex items-center gap-1 text-white/40 font-body text-xs">
            <TrendingUp className="w-3 h-3" />
            {d.milestoneCount.toString()} milestones
          </span>
        </div>
        <span className="flex items-center gap-1 text-white/30 font-body text-xs">
          <Clock className="w-3 h-3" />
          {timeLeft(d.deadline)}
        </span>
      </div>
    </Link>
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
          } catch {
            return null;
          }
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
    <div className="min-h-screen bg-black pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading italic text-white tracking-tight leading-[0.85]">
              Explore
            </h1>
            <p className="text-white/40 font-body font-light text-sm mt-2">
              {loading ? "Loading campaigns…" : `${items.length} campaign${items.length !== 1 ? "s" : ""} on-chain`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="liquid-glass-strong rounded-full px-4 py-2 text-white font-body font-medium text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
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
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full liquid-glass rounded-full pl-9 pr-4 py-2.5 text-sm font-body text-white placeholder-white/20 bg-transparent outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {/* Filter pills */}
          <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-0.5 shrink-0">
            <Filter className="w-3 h-3 text-white/20 ml-2 mr-1" />
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  filter === key ? "bg-white text-black" : "text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-32 text-center">
            <p className="text-white/30 font-body text-sm">
              {search || filter !== "all"
                ? "No campaigns match your filters."
                : "No campaigns deployed yet."}
            </p>
            {!search && filter === "all" && (
              <Link
                to="/create"
                className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Launch the first campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Card key={item.details.address} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
