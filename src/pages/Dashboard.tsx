import { useState, useEffect, useCallback, type JSX } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import {
  fetchAllCampaigns, fetchCampaignDetails, fetchMilestones,
  startMilestoneVote, commitVote, revealVote, resolveVote,
  releaseMilestone, claimRefund,
  loadCommitRecord,
  fmtEth, fmtBps, milestoneStateLabel,
  CampaignState, MilestoneState, extractError,
  type CampaignListItem, type CampaignDetails, type MilestoneDetails,
} from "../hooks/useCampaign";
import {
  Wallet, RefreshCw, ArrowRight, Loader2, Bot,
  Lock, Unlock, CheckCircle2, XCircle, Vote,
  TrendingUp, Users, Shield, AlertCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnrichedCampaign {
  list: CampaignListItem;
  details: CampaignDetails;
  milestones: MilestoneDetails[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(raised: bigint, goal: bigint) {
  if (!goal) return 0;
  return Math.min(100, Number((raised * BigInt(100)) / goal));
}

function timeLeft(ts: bigint): string {
  const diff = Number(ts) * 1000 - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((diff % 3600000) / 60000)}m`;
}

// ── Campaign card ─────────────────────────────────────────────────────────────

function CampaignCard({
  ec, isFounder, onRefresh,
}: {
  ec: EnrichedCampaign;
  isFounder: boolean;
  onRefresh: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [probability, setProbability] = useState(75);

  const { details: d, milestones } = ec;
  const now = BigInt(Math.floor(Date.now() / 1000));

  // Find the current active milestone
  const currentMs = milestones[Number(d.currentMilestoneIndex)] ?? milestones[0];

  const run = async (label: string, fn: () => Promise<string>) => {
    setBusy(true);
    try {
      const hash = await fn();
      toast.success(label, undefined, hash);
      onRefresh();
    } catch (err) {
      toast.error(label + " failed", extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const savedCommit = currentMs ? loadCommitRecord(d.address, currentMs.index) : null;

  const progressPct = pct(d.totalRaised, d.goal);

  return (
    <div className="liquid-glass rounded-2xl p-5 space-y-4 hover:bg-white/[0.01] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/campaign/${d.address}`} className="text-white font-heading italic text-xl hover:text-white/80 transition-colors line-clamp-1">
            {d.title}
          </Link>
          <p className="text-white/30 font-body text-xs mt-1 font-mono">{d.address.slice(0, 10)}…{d.address.slice(-6)}</p>
        </div>
        <Link to={`/campaign/${d.address}`} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs font-body text-white/40 mb-1.5">
          <span>{fmtEth(d.totalRaised)} / {fmtEth(d.goal)} ETH</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="liquid-glass rounded-lg px-2.5 py-2 text-center">
          <p className="text-white/30 font-body text-[10px] uppercase tracking-wider">Investors</p>
          <p className="text-white font-body font-medium text-sm">{d.investorCount.toString()}</p>
        </div>
        <div className="liquid-glass rounded-lg px-2.5 py-2 text-center">
          <p className="text-white/30 font-body text-[10px] uppercase tracking-wider">Stake</p>
          <p className="text-white font-body font-medium text-sm">{fmtEth(d.founderStake, 2)} ETH</p>
        </div>
        <div className="liquid-glass rounded-lg px-2.5 py-2 text-center">
          <p className="text-white/30 font-body text-[10px] uppercase tracking-wider">Deadline</p>
          <p className="text-white font-body font-medium text-sm">{timeLeft(d.deadline)}</p>
        </div>
      </div>

      {/* Current milestone panel */}
      {currentMs && (
        <div className="liquid-glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/40 font-body text-xs uppercase tracking-widest">
              Milestone {currentMs.index + 1} of {d.milestoneCount.toString()} · {fmtBps(currentMs.fundingBps)}
            </span>
            <span className={`text-xs font-body font-medium ${
              currentMs.state === MilestoneState.VotingOpen ? "text-amber-300" :
              currentMs.state === MilestoneState.RevealOpen ? "text-blue-300" :
              currentMs.state === MilestoneState.Passed ? "text-emerald-400" :
              currentMs.state === MilestoneState.Failed ? "text-red-400" : "text-white/40"
            }`}>
              {milestoneStateLabel(currentMs.state)}
            </span>
          </div>

          <p className="text-white/70 font-body text-sm leading-relaxed line-clamp-2">{currentMs.description}</p>

          {/* AI score */}
          {currentMs.agentScoreSubmitted && (
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40 font-body text-xs">AI Score:</span>
              <span className={`font-body font-medium text-xs ${
                Number(currentMs.agentScore) >= 8000 ? "text-emerald-400" :
                Number(currentMs.agentScore) >= 5000 ? "text-amber-400" : "text-red-400"
              }`}>
                {(Number(currentMs.agentScore) / 100).toFixed(0)}/100
              </span>
            </div>
          )}

          {/* ── Founder actions ── */}
          {isFounder && (
            <>
              {/* Start voting */}
              {currentMs.state === MilestoneState.Pending &&
                d.campaignState === CampaignState.Funded && (
                <button
                  disabled={busy}
                  onClick={() => run("Voting started", () => startMilestoneVote(d.address))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Vote className="w-3.5 h-3.5" />}
                  Start Milestone Vote
                </button>
              )}

              {/* Release funds */}
              {currentMs.state === MilestoneState.Passed && !currentMs.fundsReleased && (
                <button
                  disabled={busy}
                  onClick={() => run("Funds released", () => releaseMilestone(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2 font-body font-medium text-sm disabled:opacity-40 hover:bg-white/90 transition-colors"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  Release {fmtEth(currentMs.ethAllocation)} ETH
                </button>
              )}

              {/* Voting active: show deadlines */}
              {(currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="liquid-glass rounded-lg px-2 py-1.5">
                    <p className="text-white/30 font-body text-[10px]">Commit ends</p>
                    <p className="text-amber-300 font-body text-xs font-medium">{timeLeft(currentMs.commitDeadline)}</p>
                  </div>
                  <div className="liquid-glass rounded-lg px-2 py-1.5">
                    <p className="text-white/30 font-body text-[10px]">Reveal ends</p>
                    <p className="text-blue-300 font-body text-xs font-medium">{timeLeft(currentMs.revealDeadline)}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Investor actions ── */}
          {!isFounder && (
            <>
              {/* Commit phase */}
              {currentMs.state === MilestoneState.VotingOpen &&
                !currentMs.hasCommitted && now < currentMs.commitDeadline && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-body text-xs">Probability milestone was achieved</span>
                    <span className="text-white font-body font-medium text-sm">{probability}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                  <button
                    disabled={busy}
                    onClick={() =>
                      run("Vote committed", async () => {
                        const r = await commitVote(d.address, currentMs.index, probability * 100);
                        toast.info("Commitment saved", `${r.probability / 100}% — reveal after commit phase.`);
                        return "";
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Commit Vote (Hidden)
                  </button>
                </div>
              )}

              {/* Committed, waiting for reveal */}
              {currentMs.hasCommitted && !currentMs.hasRevealed &&
                currentMs.state === MilestoneState.VotingOpen && (
                <div className="flex items-center gap-2 liquid-glass rounded-lg px-3 py-2 border border-amber-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-body text-xs">Committed · reveal opens in {timeLeft(currentMs.commitDeadline)}</span>
                  {savedCommit && <span className="ml-auto text-white/30 font-body text-xs">{savedCommit.probability / 100}%</span>}
                </div>
              )}

              {/* Reveal phase */}
              {currentMs.hasCommitted && !currentMs.hasRevealed &&
                currentMs.state === MilestoneState.RevealOpen && (
                <div className="space-y-2">
                  {savedCommit ? (
                    <button
                      disabled={busy}
                      onClick={() => run("Vote revealed", () => revealVote(d.address, currentMs.index))}
                      className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                      Reveal Vote ({savedCommit.probability / 100}%)
                    </button>
                  ) : (
                    <p className="text-red-400 font-body text-xs">Commitment not found in this browser.</p>
                  )}
                </div>
              )}

              {/* Resolve after deadline */}
              {(currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) &&
                now > currentMs.revealDeadline && (
                <button
                  disabled={busy}
                  onClick={() => run("Vote resolved", () => resolveVote(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-white/70 font-body font-medium text-sm border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Resolve Vote
                </button>
              )}

              {/* Refund */}
              {(currentMs.state === MilestoneState.Failed || currentMs.state === MilestoneState.Inconclusive) && (
                <button
                  disabled={busy}
                  onClick={() => run("Refund claimed", () => claimRefund(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-red-400 font-body font-medium text-sm border border-red-500/20 hover:bg-red-500/5 transition-colors disabled:opacity-40"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Claim Refund
                </button>
              )}
            </>
          )}

          {/* Resolve after reveal deadline (anyone can call this) */}
          {(currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) &&
            now > currentMs.revealDeadline && isFounder && (
            <button
              disabled={busy}
              onClick={() => run("Vote resolved", () => resolveVote(d.address, currentMs.index))}
              className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-white/50 font-body font-medium text-sm border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Resolve Vote
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard(): JSX.Element {
  const { wallet } = useWallet();
  const toast = useToast();
  const [tab, setTab] = useState<"investor" | "founder">("investor");
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const all = await fetchAllCampaigns();
      const enriched = await Promise.all(
        all.map(async (item) => {
          try {
            const [details, milestones] = await Promise.all([
              fetchCampaignDetails(item.address, wallet),
              fetchMilestones(item.address, wallet),
            ]);
            return { list: item, details, milestones };
          } catch {
            return null;
          }
        })
      );
      setCampaigns(enriched.filter(Boolean) as EnrichedCampaign[]);
    } catch (err) {
      toast.error("Failed to load campaigns", extractError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [wallet, toast]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  // Filter campaigns for each tab
  const founderCampaigns = campaigns.filter(
    (ec) => ec.details.founder.toLowerCase() === wallet?.toLowerCase()
  );
  const investorCampaigns = campaigns.filter(
    (ec) =>
      ec.details.founder.toLowerCase() !== wallet?.toLowerCase() &&
      ec.details.investedAmount !== undefined &&
      ec.details.investedAmount > 0n
  );

  if (!wallet) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 flex flex-col items-center justify-center gap-4">
        <Wallet className="w-8 h-8 text-white/20" />
        <p className="text-white/40 font-body text-sm">Connect your wallet to view your dashboard</p>
      </div>
    );
  }

  const activeCampaigns = founderCampaigns.filter((ec) => ec.details.campaignState !== CampaignState.Cancelled).length;
  const totalRaisedAll = founderCampaigns.reduce((s, ec) => s + ec.details.totalRaised, 0n);
  const totalInvested = investorCampaigns.reduce((s, ec) => s + (ec.details.investedAmount ?? 0n), 0n);

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading italic text-white tracking-tight leading-[0.9]">
              Dashboard
            </h1>
            <p className="text-white/40 font-body font-light text-sm mt-1 font-mono">
              {wallet.slice(0, 8)}…{wallet.slice(-6)}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { Icon: TrendingUp, label: "Total Raised", value: `${fmtEth(totalRaisedAll, 2)} ETH` },
            { Icon: Shield, label: "Campaigns Founded", value: founderCampaigns.length.toString() },
            { Icon: Users, label: "Active Campaigns", value: activeCampaigns.toString() },
            { Icon: AlertCircle, label: "Total Invested", value: `${fmtEth(totalInvested, 2)} ETH` },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="liquid-glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-white/30" />
                <span className="text-white/30 font-body text-[10px] uppercase tracking-widest">{label}</span>
              </div>
              <p className="text-white font-heading italic text-xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Tab selector */}
        <div className="liquid-glass rounded-full px-1.5 py-1 flex w-fit gap-0.5 mb-8">
          {(["investor", "founder"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-body font-medium capitalize transition-all ${
                tab === t ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {t} View
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : tab === "founder" ? (
          <div>
            {founderCampaigns.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <p className="text-white/30 font-body text-sm">You haven't launched any campaigns yet.</p>
                <Link to="/create" className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
                  Launch a Campaign
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {founderCampaigns.map((ec) => (
                  <CampaignCard key={ec.details.address} ec={ec} isFounder onRefresh={load} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {investorCampaigns.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <p className="text-white/30 font-body text-sm">You haven't invested in any campaigns.</p>
                <Link to="/" className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
                  Explore Campaigns
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investorCampaigns.map((ec) => (
                  <CampaignCard key={ec.details.address} ec={ec} isFounder={false} onRefresh={load} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
