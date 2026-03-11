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

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtEth(wei: bigint, decimals = 4) {
  return (Number(wei) / 1e18).toFixed(decimals);
}
function daysLeft(deadline: bigint) {
  return Math.max(
    0,
    Math.ceil((Number(deadline) * 1000 - Date.now()) / 86400000),
  );
}
function fmtTokens(raw: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(raw / 1e18);
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: {
    label: "Live",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  funded: {
    label: "Funded",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-400",
  },
  voting: {
    label: "Voting",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
  released: {
    label: "Completed",
    color: "text-zinc-400",
    bg: "bg-zinc-800 border-zinc-700",
    dot: "bg-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
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

// ── shared primitives ─────────────────────────────────────────────────────────
function Spinner({ color = "border-t-white" }: { color?: string }) {
  return (
    <div
      className={`w-3.5 h-3.5 border border-white/20 ${color} rounded-full animate-spin`}
    />
  );
}

function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className="w-full bg-zinc-800 rounded-full h-[4px] overflow-visible relative">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        {value > 2 && value < 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)]" />
        )}
      </div>
    </div>
  );
}

function VoteBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div className="w-full bg-zinc-800 rounded-full h-[4px] overflow-hidden">
      <div className="h-full flex">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${yes}%` }}
        />
        <div
          className="bg-red-500/50 transition-all duration-500"
          style={{ width: `${no}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const cfg = statusConfig[status] ?? statusConfig.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${status === "active" || status === "voting" ? "animate-pulse" : ""}`}
      />
      {label ?? cfg.label}
    </span>
  );
}

// ── Command Strip (replaces StatCard grid) ───────────────────────────────────
function CommandStrip({
  stats,
}: {
  stats: { icon: LucideIcon; value: string | number; label: string }[];
}): JSX.Element {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.05] divide-y sm:divide-y-0">
        {stats.map(({ icon: Icon, value, label }, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1.5 py-5 px-4"
          >
            <Icon className="w-3.5 h-3.5 text-zinc-600 mb-0.5" />
            <span className="font-mono text-xl font-bold text-white tracking-tight">
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold text-center">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">Loading your campaigns...</p>
        </div>
      </div>
    );

  const totalRaised = items.reduce(
    (s, i) => s + Number(i.info.totalRaised) / 1e18,
    0,
  );
  const released = items.filter((i) => i.info.fundsReleased).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <CommandStrip
        stats={[
          {
            icon: TrendingUp,
            value: `${totalRaised.toFixed(4)}`,
            label: "ETH Raised",
          },
          { icon: BarChart3, value: items.length, label: "Campaigns" },
          { icon: Shield, value: released, label: "Released" },
          {
            icon: Users,
            value: items.filter((i) => i.info.goalReached).length,
            label: "Funded",
          },
        ]}
      />

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">
            Your Campaigns
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={load}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
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
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
            <BarChart3 className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm mb-5">
              No campaigns deployed yet.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-[0_0_16px_rgba(16,185,129,0.1)]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Create Campaign
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
                  className="bg-zinc-900/40 border border-white/[0.05] hover:border-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={status} />
                        <span className="text-[10px] font-mono text-zinc-600 truncate">
                          {campaign.address.slice(0, 10)}...
                          {campaign.address.slice(-6)}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-base leading-tight tracking-tight">
                        {info.title}
                      </h3>
                    </div>
                    <Link
                      to={`/campaign/${campaign.address}`}
                      className="shrink-0 flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors font-medium bg-white/[0.03] border border-white/[0.05] px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-sm text-white font-bold">
                        {raised.toFixed(4)}
                        <span className="text-zinc-600 font-normal">
                          {" "}
                          / {goal} ETH
                        </span>
                      </span>
                      <span className="font-mono text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <ProgressBar value={progress} />
                    <div className="flex justify-between text-[11px] text-zinc-600">
                      <span>{dl > 0 ? `${dl}d left` : "Deadline passed"}</span>
                      <span>
                        {info.goalReached
                          ? "✓ Goal reached"
                          : "Goal not reached"}
                      </span>
                    </div>
                  </div>

                  {/* Milestone zone */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                        Milestone
                      </span>
                      {info.fundsReleased && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Released
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                      {info.milestoneDescription}
                    </p>

                    {/* Goal not reached */}
                    {!info.goalReached && !info.fundsReleased && (
                      <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Goal not
                        reached — milestone locked
                      </div>
                    )}

                    {/* Start voting */}
                    {info.goalReached &&
                      !isVotingActive &&
                      !votingEnded &&
                      !info.fundsReleased &&
                      !info.cancelled && (
                        <>
                          <button
                            onClick={() => doStartVoting(campaign.address)}
                            disabled={vAction?.loading || vAction?.done}
                            className="w-full flex items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {vAction?.loading ? (
                              <>
                                <Spinner color="border-t-sky-400" />
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
                            <p className="text-[11px] text-red-400">
                              {vAction.error}
                            </p>
                          )}
                        </>
                      )}

                    {/* Voting active */}
                    {isVotingActive && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                          <Clock className="w-3 h-3 shrink-0 animate-pulse" />
                          Voting in progress — ends when all investors vote
                        </div>
                        <VoteBar yes={yesPercent} no={noPercent} />
                        <div className="flex justify-between text-[11px]">
                          <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                            <ThumbsUp className="w-2.5 h-2.5" /> {yesVotes} Yes
                            ({yesPercent}%)
                          </span>
                          <span className="text-zinc-600 font-mono">
                            {totalVotes} voted
                          </span>
                          <span className="text-red-400 font-mono font-semibold flex items-center gap-1">
                            {noVotes} No ({noPercent}%){" "}
                            <ThumbsDown className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Voting ended */}
                    {votingEnded && !info.fundsReleased && (
                      <div className="space-y-3">
                        <VoteBar yes={yesPercent} no={noPercent} />
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-semibold">
                            {yesVotes} Yes ({yesPercent}%)
                          </span>
                          <span className="text-red-400 font-semibold">
                            {noVotes} No ({noPercent}%)
                          </span>
                        </div>
                        {canRelease ? (
                          <>
                            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              Majority approved — funds ready to release
                            </div>
                            <button
                              onClick={() => doReleaseFunds(campaign.address)}
                              disabled={rAction?.loading || rAction?.done}
                              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed font-black py-2.5 rounded-xl text-xs transition-all active:scale-95"
                            >
                              {rAction?.loading ? (
                                <>
                                  <Spinner color="border-t-zinc-800" />
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
                              <p className="text-[11px] text-red-400">
                                {rAction.error}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 text-[11px] font-bold bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Majority rejected — funds cannot be released
                          </div>
                        )}
                      </div>
                    )}

                    {info.fundsReleased && (
                      <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
          if (tokenBalance > 0n)
            results.push({ campaign: c, info, tokenBalance });
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">
            Scanning chain for your investments...
          </p>
        </div>
      </div>
    );

  const totalTokens = items.reduce((s, i) => s + Number(i.tokenBalance), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <CommandStrip
        stats={[
          { icon: Zap, value: fmtTokens(totalTokens), label: "Total Tokens" },
          { icon: Vote, value: items.length, label: "Positions" },
          {
            icon: TrendingUp,
            value: items.filter((i) => i.info.goalReached).length,
            label: "Funded",
          },
          {
            icon: Shield,
            value: items.filter((i) => i.info.fundsReleased).length,
            label: "Released",
          },
        ]}
      />

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">
            Your Portfolio
          </h2>
          <button
            onClick={load}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
            <Wallet className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm mb-5">
              No investments found for this wallet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Explore Campaigns
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
                  className="bg-zinc-900/40 border border-white/[0.05] hover:border-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <StatusBadge
                        status={status}
                        label={
                          status === "funded" && !info.fundsReleased
                            ? "Vote Needed"
                            : undefined
                        }
                      />
                      <h3 className="text-white font-bold text-base line-clamp-1 tracking-tight">
                        {info.title}
                      </h3>
                    </div>
                    <Link
                      to={`/campaign/${campaign.address}`}
                      className="shrink-0 flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors font-medium bg-white/[0.03] border border-white/[0.05] px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </div>

                  {/* Stat grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: fmtTokens(tokens), label: "Tokens" },
                      { val: `${share}%`, label: "Share" },
                      { val: `${Math.round(progress)}%`, label: "Funded" },
                    ].map(({ val, label }) => (
                      <div
                        key={label}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center"
                      >
                        <div className="font-mono text-sm font-bold text-white">
                          {val}
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-widest">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-zinc-500">
                        Campaign Progress
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {raised.toFixed(4)} / {goal} ETH
                      </span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  {/* Voting zone */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                      Milestone Vote
                    </span>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                      {info.milestoneDescription}
                    </p>

                    {info.goalReached && !info.fundsReleased && !hasVoted && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => doVote(campaign.address, true)}
                          disabled={isVoteLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        >
                          {isVoteLoading ? (
                            <Spinner color="border-t-emerald-400" />
                          ) : (
                            <ThumbsUp className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => doVote(campaign.address, false)}
                          disabled={isVoteLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                        >
                          {isVoteLoading ? (
                            <Spinner color="border-t-red-400" />
                          ) : (
                            <ThumbsDown className="w-3.5 h-3.5" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}

                    {hasVoted && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border ${
                          hasVoted === "yes"
                            ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
                            : "bg-red-500/5 border-red-500/15 text-red-400"
                        }`}
                      >
                        {hasVoted === "yes" ? (
                          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <ThumbsDown className="w-3.5 h-3.5 shrink-0" />
                        )}
                        Voted {hasVoted === "yes" ? "to Approve" : "to Reject"}{" "}
                        — on-chain ✓
                      </div>
                    )}

                    {info.fundsReleased && (
                      <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Funds
                        released to founder
                      </div>
                    )}

                    {!info.goalReached && (
                      <div className="flex items-center gap-2 text-zinc-600 text-[11px]">
                        <Clock className="w-3 h-3 shrink-0" /> Waiting for goal
                        to be reached
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
    <div className="min-h-screen bg-zinc-950 pb-24 relative overflow-hidden">
      {/* Background orb */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-zinc-500 text-[10px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-[0.15em]">
            <BarChart3 className="w-3 h-3" /> Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-3">
            My Dashboard
          </h1>
          {wallet ? (
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
              <span className="text-zinc-500 text-xs font-mono">
                {shortAddress}
              </span>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">
              Connect your wallet to view your portfolio.
            </p>
          )}
        </div>

        {/* No wallet */}
        {!wallet ? (
          <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-2xl p-12 sm:p-20 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <div className="relative bg-white/[0.04] border border-white/[0.08] p-5 rounded-2xl">
                <Zap className="w-9 h-9 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-3 tracking-tight">
              Wallet Not Connected
            </h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
              Connect your wallet to view your investments, vote on milestones,
              and manage your campaigns.
            </p>
            <button
              onClick={connectWallet}
              className="inline-flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all active:scale-95 text-sm shadow-[0_0_20px_rgba(16,185,129,0.12)]"
            >
              <Zap className="w-4 h-4 text-emerald-400" /> Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Segmented control */}
            <div className="bg-zinc-900/50 border border-white/[0.05] p-1 rounded-xl inline-flex mb-7 sm:mb-8">
              {tabs.map(({ id, label, labelFull, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab === id
                      ? "bg-zinc-800 text-white shadow-sm shadow-black/20"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
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
