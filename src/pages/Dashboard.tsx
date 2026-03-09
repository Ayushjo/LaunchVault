import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

import {
  getVotingStatus,
  fetchAllCampaigns,
  fetchCampaignInfo,
  startVoting,
  voteOnCampaign,
  type OnChainCampaign,
  type CampaignInfo,
} from "../hooks/useCampaign";
import { BrowserProvider, Contract } from "ethers";
import { CAMPAIGN_ABI } from "../contracts/config";
import {
  Zap,
  TrendingUp,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Wallet,
  BarChart3,
  Vote,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtEth(wei: bigint, decimals = 4) {
  return (Number(wei) / 1e18).toFixed(decimals);
}
function daysLeft(deadline: bigint) {
  return Math.max(
    0,
    Math.ceil((Number(deadline) * 1000 - Date.now()) / 86400000),
  );
}
const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Live",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  funded: {
    label: "Funded",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  voting: {
    label: "Voting",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  released: {
    label: "Completed",
    color: "text-slate-300",
    bg: "bg-slate-800 border-slate-700",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};
function getStatus(
  info: CampaignInfo,
): "active" | "funded" | "voting" | "released" | "cancelled" {
  if (info.cancelled) return "cancelled";
  if (info.fundsReleased) return "released";
  if (info.goalReached) return "funded";
  return "active";
}

async function releaseFunds(address: string): Promise<string> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(address, CAMPAIGN_ABI, signer);
  const tx = await contract.releaseFunds();
  await tx.wait();
  return tx.hash;
}

async function getTokenBalance(
  campaignAddress: string,
  wallet: string,
): Promise<bigint> {
  try {
    const provider = new BrowserProvider((window as any).ethereum);
    const contract = new Contract(campaignAddress, CAMPAIGN_ABI, provider);
    const tokenAddr = await contract.token();
    const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
    const token = new Contract(tokenAddr, tokenAbi, provider);
    return await token.balanceOf(wallet);
  } catch {
    return 0n;
  }
}

// ── sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-700 relative"
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sub?: string;
}): JSX.Element {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3 rounded-xl">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-black text-white truncate">
          {value}
        </div>
        <div className="text-slate-400 text-xs font-medium truncate">
          {label}
        </div>
        {sub && (
          <div className="text-emerald-400 text-xs font-bold mt-0.5 truncate">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  funded: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  voting: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  released: "bg-slate-800 border-slate-700 text-slate-300",
  cancelled: "bg-red-500/10 border-red-500/20 text-red-400",
};
const statusLabel: Record<string, string> = {
  active: "Live",
  funded: "Funded",
  voting: "Voting",
  released: "Completed",
  cancelled: "Cancelled",
};

// ── Founder Dashboard ─────────────────────────────────────────────────────────
interface CampaignWithInfo {
  campaign: OnChainCampaign;
  info: CampaignInfo;
  votingStatus: {
    active: boolean;
    endTime: bigint;
    yesVotes: bigint;
    noVotes: bigint;
  };
}

function FounderDashboard({ wallet }: { wallet: string }): JSX.Element {
  const [items, setItems] = useState<CampaignWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMap, setActionMap] = useState<
    Record<string, { loading: boolean; done: boolean; error: string | null }>
  >({});

  async function load() {
    setLoading(true);
    try {
      const all = await fetchAllCampaigns();
      const mine = all.filter(
        (c) => c.founder.toLowerCase() === wallet.toLowerCase(),
      );
      const withInfo = await Promise.all(
        mine.map(async (c) => ({
          campaign: c,
          info: await fetchCampaignInfo(c.address),
          votingStatus: await getVotingStatus(c.address),
        })),
      );
      setItems(withInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [wallet]);

  async function doStartVoting(address: string) {
    setActionMap((p) => ({
      ...p,
      [address]: { loading: true, done: false, error: null },
    }));
    try {
      await startVoting(address);
      const [updated, vs] = await Promise.all([
        fetchCampaignInfo(address),
        getVotingStatus(address),
      ]);
      setItems((p) =>
        p.map((i) =>
          i.campaign.address === address
            ? { ...i, info: updated, votingStatus: vs }
            : i,
        ),
      );
      setActionMap((p) => ({
        ...p,
        [address]: { loading: false, done: true, error: null },
      }));
    } catch (err: any) {
      setActionMap((p) => ({
        ...p,
        [address]: {
          loading: false,
          done: false,
          error: err.message.slice(0, 80),
        },
      }));
    }
  }

  async function doReleaseFunds(address: string) {
    const key = address + "_release";
    setActionMap((p) => ({
      ...p,
      [key]: { loading: true, done: false, error: null },
    }));
    try {
      await releaseFunds(address);
      const updated = await fetchCampaignInfo(address);
      setItems((p) =>
        p.map((i) =>
          i.campaign.address === address ? { ...i, info: updated } : i,
        ),
      );
      setActionMap((p) => ({
        ...p,
        [key]: { loading: false, done: true, error: null },
      }));
    } catch (err: any) {
      setActionMap((p) => ({
        ...p,
        [key]: { loading: false, done: false, error: err.message.slice(0, 80) },
      }));
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your campaigns...</p>
        </div>
      </div>
    );

  const totalRaised = items.reduce(
    (s, i) => s + Number(i.info.totalRaised) / 1e18,
    0,
  );
  const released = items.filter((i) => i.info.fundsReleased).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={TrendingUp}
          value={`${totalRaised.toFixed(4)} ETH`}
          label="Total Raised"
          sub="All campaigns"
        />
        <StatCard
          icon={BarChart3}
          value={items.length}
          label="Campaigns"
          sub="Deployed"
        />
        <StatCard
          icon={Shield}
          value={released}
          label="Released"
          sub="Funds sent"
        />
        <StatCard
          icon={Users}
          value={items.filter((i) => i.info.goalReached).length}
          label="Funded"
          sub="Goal reached"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-black text-white">
            Your Campaigns
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/create"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              + New <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              You haven't created any campaigns yet.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              <Zap className="w-4 h-4" /> Create Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(({ campaign, info, votingStatus }) => {
              const goal = Number(info.goal) / 1e18;
              const raised = Number(info.totalRaised) / 1e18;
              const progress =
                goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
              const dl = daysLeft(info.deadline);
              const isVotingActive = votingStatus.active;
              const rKey = campaign.address + "_release";
              const vAction = actionMap[campaign.address];
              const rAction = actionMap[rKey];

              const yesVotes = Number(votingStatus.yesVotes);
              const noVotes = Number(votingStatus.noVotes);
              const totalVotes = yesVotes + noVotes;
              const yesPercent =
                totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
              const noPercent =
                totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;
              const votingEnded = !isVotingActive && totalVotes > 0;
              const canRelease =
                votingEnded && yesPercent > 50 && !info.fundsReleased;

              const status = (() => {
                if (info.cancelled) return "cancelled";
                if (info.fundsReleased) return "released";
                if (isVotingActive) return "voting";
                if (info.goalReached) return "funded";
                return "active";
              })();

              return (
                <div
                  key={campaign.address}
                  className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusConfig[status]?.bg ?? "bg-slate-800 border-slate-700"} ${statusConfig[status]?.color ?? "text-slate-300"}`}
                        >
                          {statusConfig[status]?.label ?? status}
                        </span>
                        <span className="text-xs font-mono text-slate-500 truncate">
                          {campaign.address.slice(0, 10)}...
                          {campaign.address.slice(-6)}
                        </span>
                      </div>
                      <h3 className="text-white font-black text-base sm:text-lg leading-tight">
                        {info.title}
                      </h3>
                    </div>
                    <Link
                      to={`/campaign/${campaign.address}`}
                      className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium bg-slate-800/50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-white font-bold text-sm">
                        {raised.toFixed(4)}
                        <span className="text-slate-500 font-normal">
                          {" "}
                          / {goal} ETH
                        </span>
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <ProgressBar value={progress} />
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>{dl > 0 ? `${dl}d left` : "Deadline passed"}</span>
                      <span>
                        {info.goalReached
                          ? "✓ Goal reached"
                          : "Goal not reached"}
                      </span>
                    </div>
                  </div>

                  {/* Milestone */}
                  <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Milestone
                      </span>
                      {info.fundsReleased && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Released
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {info.milestoneDescription}
                    </p>

                    {/* Goal not reached */}
                    {!info.goalReached && !info.fundsReleased && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Goal not reached — milestone locked
                      </div>
                    )}

                    {/* Goal reached, voting not started */}
                    {info.goalReached &&
                      !isVotingActive &&
                      !votingEnded &&
                      !info.fundsReleased &&
                      !info.cancelled && (
                        <>
                          <button
                            onClick={() => doStartVoting(campaign.address)}
                            disabled={vAction?.loading || vAction?.done}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {vAction?.loading ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Starting...
                              </>
                            ) : vAction?.done ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Voting Started ✓
                              </>
                            ) : (
                              <>
                                <Vote className="w-3.5 h-3.5" />
                                Start Voting Period
                              </>
                            )}
                          </button>
                          {vAction?.error && (
                            <p className="text-xs text-red-400">
                              {vAction.error}
                            </p>
                          )}
                        </>
                      )}

                    {/* Voting in progress */}
                    {isVotingActive && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          Voting in progress — ends when all investors vote
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-800">
                          <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${yesPercent}%` }}
                          />
                          <div
                            className="bg-red-500/70 transition-all"
                            style={{ width: `${noPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> {yesVotes} Yes (
                            {yesPercent}%)
                          </span>
                          <span className="text-slate-500">
                            {totalVotes} voted
                          </span>
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            {noVotes} No ({noPercent}%){" "}
                            <ThumbsDown className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Voting ended */}
                    {votingEnded && !info.fundsReleased && (
                      <div className="space-y-3">
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-800">
                          <div
                            className="bg-emerald-500"
                            style={{ width: `${yesPercent}%` }}
                          />
                          <div
                            className="bg-red-500/70"
                            style={{ width: `${noPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400 font-semibold">
                            {yesVotes} Yes ({yesPercent}%)
                          </span>
                          <span className="text-red-400 font-semibold">
                            {noVotes} No ({noPercent}%)
                          </span>
                        </div>
                        {canRelease ? (
                          <>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Majority approved! You can now release funds.
                            </div>
                            <button
                              onClick={() => doReleaseFunds(campaign.address)}
                              disabled={rAction?.loading || rAction?.done}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              {rAction?.loading ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Releasing...
                                </>
                              ) : rAction?.done ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Funds Released ✓
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3.5 h-3.5" />
                                  Release Funds to Wallet
                                </>
                              )}
                            </button>
                            {rAction?.error && (
                              <p className="text-xs text-red-400">
                                {rAction.error}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Majority rejected — funds cannot be released.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Already released */}
                    {info.fundsReleased && (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Funds successfully released to your wallet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Investor Dashboard ────────────────────────────────────────────────────────
interface InvestorItem {
  campaign: OnChainCampaign;
  info: CampaignInfo;
  tokenBalance: bigint;
}

function InvestorDashboard({ wallet }: { wallet: string }): JSX.Element {
  const [items, setItems] = useState<InvestorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const all = await fetchAllCampaigns();
      const results: InvestorItem[] = [];
      await Promise.all(
        all.map(async (c) => {
          const [info, tokenBalance] = await Promise.all([
            fetchCampaignInfo(c.address),
            getTokenBalance(c.address, wallet),
          ]);
          if (tokenBalance > 0n) {
            results.push({ campaign: c, info, tokenBalance });
          }
        }),
      );
      setItems(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [wallet]);

  async function doVote(address: string, approve: boolean) {
    setVoteLoading((p) => ({ ...p, [address]: true }));
    try {
      await voteOnCampaign(address, approve);
      setVotes((p) => ({ ...p, [address]: approve ? "yes" : "no" }));
    } catch (err: any) {
      alert(err.message.slice(0, 100));
    } finally {
      setVoteLoading((p) => ({ ...p, [address]: false }));
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            Scanning chain for your investments...
          </p>
        </div>
      </div>
    );

  const totalTokens = items.reduce((s, i) => s + Number(i.tokenBalance), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Zap}
          value={totalTokens}
          label="Total Tokens"
          sub="Across campaigns"
        />
        <StatCard
          icon={Vote}
          value={items.length}
          label="Positions"
          sub="Campaigns backed"
        />
        <StatCard
          icon={TrendingUp}
          value={items.filter((i) => i.info.goalReached).length}
          label="Funded"
          sub="Goal reached"
        />
        <StatCard
          icon={Shield}
          value={items.filter((i) => i.info.fundsReleased).length}
          label="Released"
          sub="Completed"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-black text-white">
            Your Portfolio
          </h2>
          <button
            onClick={load}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              No investments found for this wallet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              <Eye className="w-4 h-4" /> Explore Campaigns
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(({ campaign, info, tokenBalance }) => {
              const goal = Number(info.goal) / 1e18;
              const raised = Number(info.totalRaised) / 1e18;
              const progress =
                goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
              const tokens = Number(tokenBalance);
              const share =
                goal > 0 ? ((tokens / 10000) * 100).toFixed(2) : "0";
              const status = getStatus(info);
              const hasVoted = votes[campaign.address];
              const isVoteLoading = voteLoading[campaign.address];

              return (
                <div
                  key={campaign.address}
                  className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusBadge[status]}`}
                        >
                          {status === "funded" && !info.fundsReleased
                            ? "Vote Needed"
                            : statusLabel[status]}
                        </span>
                      </div>
                      <h3 className="text-white font-black text-base sm:text-lg line-clamp-1">
                        {info.title}
                      </h3>
                    </div>
                    <Link
                      to={`/campaign/${campaign.address}`}
                      className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium bg-slate-800/50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                      <div className="text-emerald-400 font-black font-mono text-sm sm:text-base">
                        {tokens}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Tokens
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                      <div className="text-white font-black text-sm sm:text-base">
                        {share}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Share</div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                      <div className="text-white font-black text-sm sm:text-base">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Funded
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs sm:text-sm text-slate-400">
                        Campaign Progress
                      </span>
                      <span className="text-slate-400 text-xs">
                        {raised.toFixed(4)} / {goal} ETH
                      </span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  {/* Voting */}
                  <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Milestone Vote
                    </span>
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
                      {info.milestoneDescription}
                    </p>

                    {info.goalReached && !info.fundsReleased && !hasVoted && (
                      <div className="flex gap-2 sm:gap-3 pt-1">
                        <button
                          onClick={() => doVote(campaign.address, true)}
                          disabled={isVoteLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isVoteLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                          ) : (
                            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => doVote(campaign.address, false)}
                          disabled={isVoteLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isVoteLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}

                    {hasVoted && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm font-bold border ${
                          hasVoted === "yes"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {hasVoted === "yes" ? (
                          <ThumbsUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 shrink-0" />
                        )}
                        Voted {hasVoted === "yes" ? "to Approve" : "to Reject"}{" "}
                        — on-chain ✓
                      </div>
                    )}

                    {info.fundsReleased && (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Funds
                        released to founder
                      </div>
                    )}

                    {!info.goalReached && (
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> Waiting for
                        goal to be reached
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard(): JSX.Element {
  const [tab, setTab] = useState<"investor" | "founder">("investor");
  const { wallet, connectWallet, shortAddress } = useWallet();

  const tabs: {
    id: "investor" | "founder";
    label: string;
    labelFull: string;
    icon: LucideIcon;
  }[] = [
    {
      id: "investor",
      label: "Investor",
      labelFull: "Investor View",
      icon: Wallet,
    },
    {
      id: "founder",
      label: "Founder",
      labelFull: "Founder View",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[300px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative z-10">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            My Dashboard
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {wallet ? (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                Connected as{" "}
                <span className="text-emerald-400 font-mono font-bold break-all">
                  {shortAddress}
                </span>
              </span>
            ) : (
              "Connect your wallet to view your portfolio."
            )}
          </p>
        </div>

        {!wallet ? (
          <div className="glass-card rounded-3xl p-8 sm:p-16 text-center">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-4 sm:p-5 rounded-2xl">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
              Wallet Not Connected
            </h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
              Connect your wallet to view your investments, vote on milestones,
              and manage your campaigns.
            </p>
            <button
              onClick={connectWallet}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4" /> Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-900/50 border border-slate-800 p-1 rounded-2xl w-full sm:w-fit">
              {tabs.map(({ id, label, labelFull, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    tab === id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">{label}</span>
                  <span className="hidden sm:inline">{labelFull}</span>
                </button>
              ))}
            </div>
            {tab === "founder" ? (
              <FounderDashboard wallet={wallet!} />
            ) : (
              <InvestorDashboard wallet={wallet!} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
