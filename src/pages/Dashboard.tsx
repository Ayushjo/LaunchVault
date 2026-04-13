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
import PageBackground from "../components/layout/PageBackground";
import { motion } from "motion/react";

interface EnrichedCampaign {
  list: CampaignListItem;
  details: CampaignDetails;
  milestones: MilestoneDetails[];
}

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

function CampaignCard({ ec, isFounder, onRefresh }: {
  ec: EnrichedCampaign; isFounder: boolean; onRefresh: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [probability, setProbability] = useState(75);
  const { details: d, milestones } = ec;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const currentMs = milestones[Number(d.currentMilestoneIndex)] ?? milestones[0];
  const savedCommit = currentMs ? loadCommitRecord(d.address, currentMs.index) : null;
  const progressPct = pct(d.totalRaised, d.goal);

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

  const msStateColor = currentMs ? {
    [MilestoneState.VotingOpen]: "text-amber-400",
    [MilestoneState.RevealOpen]: "text-blue-400",
    [MilestoneState.Passed]:     "text-emerald-400",
    [MilestoneState.Failed]:     "text-red-400",
  }[currentMs.state] ?? "text-white/35" : "text-white/35";

  return (
    <div className="liquid-glass rounded-2xl p-5 space-y-4 border border-white/[0.05] hover:border-white/[0.09] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/campaign/${d.address}`} className="text-white font-heading italic text-xl hover:text-white/75 transition-colors line-clamp-1">
            {d.title}
          </Link>
          <p className="text-white/25 font-body text-xs mt-0.5 font-mono">{d.address.slice(0, 10)}…{d.address.slice(-6)}</p>
        </div>
        <Link to={`/campaign/${d.address}`} className="text-white/20 hover:text-white/55 transition-colors shrink-0 mt-1">
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs font-body text-white/30 mb-1.5">
          <span>{fmtEth(d.totalRaised)} / {fmtEth(d.goal)} ETH</span>
          <span className="text-white/45">{progressPct}%</span>
        </div>
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-white/55 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Investors", value: d.investorCount.toString() },
          { label: "Stake", value: `${fmtEth(d.founderStake, 2)} ETH` },
          { label: "Deadline", value: timeLeft(d.deadline) },
        ].map(({ label, value }) => (
          <div key={label} className="liquid-glass rounded-lg px-2.5 py-2 text-center border border-white/[0.04]">
            <p className="text-white/25 font-body text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-white font-body font-medium text-xs">{value}</p>
          </div>
        ))}
      </div>

      {/* Current milestone panel */}
      {currentMs && (
        <div className="liquid-glass rounded-xl p-4 space-y-3 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-white/30 font-body text-xs uppercase tracking-widest">
              Milestone {currentMs.index + 1}/{d.milestoneCount.toString()} · {fmtBps(currentMs.fundingBps)}
            </span>
            <span className={`text-xs font-body font-medium ${msStateColor}`}>
              {milestoneStateLabel(currentMs.state)}
            </span>
          </div>
          <p className="text-white/60 font-body text-sm leading-relaxed line-clamp-2">{currentMs.description}</p>

          {/* AI score */}
          {currentMs.agentScoreSubmitted && (
            <div className="flex items-center gap-2">
              <Bot className="w-3 h-3 text-white/30" />
              <span className="text-white/30 font-body text-xs">AI Score</span>
              <span className={`font-body font-medium text-xs ml-auto ${Number(currentMs.agentScore) >= 8000 ? "text-emerald-400" : Number(currentMs.agentScore) >= 5000 ? "text-amber-400" : "text-red-400"}`}>
                {(Number(currentMs.agentScore) / 100).toFixed(0)}/100
              </span>
            </div>
          )}

          {/* Founder actions */}
          {isFounder && (
            <>
              {currentMs.state === MilestoneState.Pending && d.campaignState === CampaignState.Funded && (
                <button disabled={busy} onClick={() => run("Voting started", () => startMilestoneVote(d.address))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Vote className="w-3.5 h-3.5" />}
                  Start Milestone Vote
                </button>
              )}
              {currentMs.state === MilestoneState.Passed && !currentMs.fundsReleased && (
                <button disabled={busy} onClick={() => run("Funds released", () => releaseMilestone(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2 font-body font-medium text-sm disabled:opacity-40 hover:bg-white/90 transition-colors">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  Release {fmtEth(currentMs.ethAllocation)} ETH
                </button>
              )}
              {(currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="liquid-glass rounded-lg px-2 py-1.5 border border-white/[0.04]">
                    <p className="text-white/25 font-body text-[10px]">Commit ends</p>
                    <p className="text-amber-300 font-body text-xs font-medium">{timeLeft(currentMs.commitDeadline)}</p>
                  </div>
                  <div className="liquid-glass rounded-lg px-2 py-1.5 border border-white/[0.04]">
                    <p className="text-white/25 font-body text-[10px]">Reveal ends</p>
                    <p className="text-blue-300 font-body text-xs font-medium">{timeLeft(currentMs.revealDeadline)}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Investor actions */}
          {!isFounder && (
            <>
              {currentMs.state === MilestoneState.VotingOpen && !currentMs.hasCommitted && now < currentMs.commitDeadline && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/35 font-body text-xs">Probability estimate</span>
                    <span className="text-white font-body font-medium text-sm">{probability}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))} className="w-full accent-white" />
                  <button disabled={busy}
                    onClick={() => run("Vote committed", async () => {
                      const r = await commitVote(d.address, currentMs.index, probability * 100);
                      toast.info("Commitment saved", `${r.probability / 100}% — reveal after commit phase.`);
                      return "";
                    })}
                    className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Commit Vote (Hidden)
                  </button>
                </div>
              )}

              {currentMs.hasCommitted && !currentMs.hasRevealed && currentMs.state === MilestoneState.VotingOpen && (
                <div className="flex items-center gap-2 liquid-glass rounded-lg px-3 py-2 border border-amber-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-body text-xs">Committed · reveal opens in {timeLeft(currentMs.commitDeadline)}</span>
                  {savedCommit && <span className="ml-auto text-white/25 font-body text-xs">{savedCommit.probability / 100}%</span>}
                </div>
              )}

              {currentMs.hasCommitted && !currentMs.hasRevealed && currentMs.state === MilestoneState.RevealOpen && (
                <div className="space-y-2">
                  {savedCommit ? (
                    <button disabled={busy} onClick={() => run("Vote revealed", () => revealVote(d.address, currentMs.index))}
                      className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2 text-white font-body font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity">
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                      Reveal Vote ({savedCommit.probability / 100}%)
                    </button>
                  ) : (
                    <p className="text-red-400 font-body text-xs">Commitment not found in this browser.</p>
                  )}
                </div>
              )}

              {(currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) && now > currentMs.revealDeadline && (
                <button disabled={busy} onClick={() => run("Vote resolved", () => resolveVote(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-white/55 font-body font-medium text-sm border border-white/8 hover:bg-white/5 transition-colors disabled:opacity-40">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Resolve Vote
                </button>
              )}

              {(currentMs.state === MilestoneState.Failed || currentMs.state === MilestoneState.Inconclusive) && (
                <button disabled={busy} onClick={() => run("Refund claimed", () => claimRefund(d.address, currentMs.index))}
                  className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-red-400 font-body font-medium text-sm border border-red-500/20 hover:bg-red-500/5 transition-colors disabled:opacity-40">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Claim Refund
                </button>
              )}
            </>
          )}

          {/* Founder resolve (after deadline) */}
          {isFounder && (currentMs.state === MilestoneState.VotingOpen || currentMs.state === MilestoneState.RevealOpen) && now > currentMs.revealDeadline && (
            <button disabled={busy} onClick={() => run("Vote resolved", () => resolveVote(d.address, currentMs.index))}
              className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2 text-white/45 font-body font-medium text-sm border border-white/8 hover:bg-white/5 transition-colors disabled:opacity-40">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Resolve Vote
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

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
          } catch { return null; }
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

  const founderCampaigns = campaigns.filter(
    (ec) => ec.details.founder.toLowerCase() === wallet?.toLowerCase()
  );
  const investorCampaigns = campaigns.filter(
    (ec) => ec.details.founder.toLowerCase() !== wallet?.toLowerCase() &&
      ec.details.investedAmount !== undefined && ec.details.investedAmount > 0n
  );

  if (!wallet) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center gap-5 px-6">
        <PageBackground />
        <div className="relative z-10 text-center">
          <div className="liquid-glass rounded-2xl p-8 border border-white/[0.06] max-w-sm mx-auto">
            <Wallet className="w-8 h-8 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-heading italic text-white mb-2">Connect your wallet</h2>
            <p className="text-white/40 font-body text-sm">Connect to view your dashboard, campaigns, and voting activity.</p>
          </div>
        </div>
      </div>
    );
  }

  const activeCampaigns = founderCampaigns.filter((ec) => ec.details.campaignState !== CampaignState.Cancelled).length;
  const totalRaisedAll = founderCampaigns.reduce((s, ec) => s + ec.details.totalRaised, 0n);
  const totalInvested = investorCampaigns.reduce((s, ec) => s + (ec.details.investedAmount ?? 0n), 0n);

  const stats = [
    { Icon: TrendingUp, label: "Total Raised", value: `${fmtEth(totalRaisedAll, 2)} ETH`, accent: "rgba(99,60,255,0.15)", border: "border-violet-500/15" },
    { Icon: Shield,     label: "Founded",      value: founderCampaigns.length.toString(),   accent: "rgba(56,130,255,0.12)", border: "border-blue-500/15"   },
    { Icon: Users,      label: "Active",        value: activeCampaigns.toString(),           accent: "rgba(0,190,170,0.1)",   border: "border-teal-500/15"   },
    { Icon: AlertCircle,label: "Invested",      value: `${fmtEth(totalInvested, 2)} ETH`, accent: "rgba(240,160,50,0.1)",  border: "border-amber-500/15"  },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pt-28 pb-24 px-6">
      <PageBackground />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-white/25 font-body text-xs uppercase tracking-[0.2em] mb-2">Your account</p>
            <h1 className="text-5xl md:text-6xl font-heading italic text-white tracking-tight leading-[0.85]">
              Dashboard
            </h1>
            <p className="text-white/30 font-body font-light text-xs mt-2 font-mono">
              {wallet.slice(0, 8)}…{wallet.slice(-6)}
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing || loading}
            className="text-white/25 hover:text-white/55 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {stats.map(({ Icon, label, value, accent, border }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={`liquid-glass rounded-xl px-4 py-3.5 border ${border} relative overflow-hidden`}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${accent} 0%, transparent 70%)` }} />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3 h-3 text-white/25" />
                  <span className="text-white/25 font-body text-[10px] uppercase tracking-widest">{label}</span>
                </div>
                <p className="text-white font-heading italic text-2xl leading-none">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab selector */}
        <div className="liquid-glass rounded-full px-1.5 py-1 flex w-fit gap-0.5 mb-8 border border-white/[0.05]">
          {(["investor", "founder"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-body font-medium capitalize transition-all ${
                tab === t ? "bg-white text-black" : "text-white/45 hover:text-white"
              }`}
            >
              {t} View
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-white/25 animate-spin" />
          </div>
        ) : tab === "founder" ? (
          founderCampaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-white/25 font-body text-sm">You haven't launched any campaigns yet.</p>
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
          )
        ) : (
          investorCampaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-white/25 font-body text-sm">You haven't invested in any campaigns yet.</p>
              <Link to="/explore" className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investorCampaigns.map((ec) => (
                <CampaignCard key={ec.details.address} ec={ec} isFounder={false} onRefresh={load} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
