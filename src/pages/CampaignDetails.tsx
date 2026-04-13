import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Users, Clock, Shield, TrendingUp, CheckCircle2,
  XCircle, Loader2, RefreshCw, ExternalLink, AlertCircle,
  Bot, Lock, Unlock, Vote,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import {
  fetchCampaignDetails, fetchMilestones,
  investInCampaign, startMilestoneVote,
  commitVote, revealVote, resolveVote,
  releaseMilestone, claimRefund,
  loadCommitRecord,
  fmtEth, fmtBps,
  milestoneStateLabel, campaignStateLabel,
  CampaignState, MilestoneState,
  extractError,
  type CampaignDetails as ICampaignDetails,
  type MilestoneDetails,
} from "../hooks/useCampaign";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(raised: bigint, goal: bigint): number {
  if (!goal) return 0;
  return Math.min(100, Number((raised * BigInt(100)) / goal));
}

function timeLeft(ts: bigint): string {
  const diff = Number(ts) * 1000 - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

function agentScoreColor(score: bigint): string {
  const n = Number(score);
  if (n >= 8000) return "text-emerald-400";
  if (n >= 5000) return "text-amber-400";
  return "text-red-400";
}

const MILESTONE_STATE_COLORS: Record<number, string> = {
  0: "text-white/40 border-white/10",      // Pending
  1: "text-amber-300 border-amber-500/30", // VotingOpen
  2: "text-blue-300 border-blue-500/30",   // RevealOpen
  3: "text-emerald-400 border-emerald-500/30", // Passed
  4: "text-red-400 border-red-500/30",     // Failed
  5: "text-white/40 border-white/10",      // Inconclusive
};

// ── Milestone card ────────────────────────────────────────────────────────────

function MilestoneCard({
  m, campaign, wallet, isFounder,
  onAction,
}: {
  m: MilestoneDetails;
  campaign: ICampaignDetails;
  wallet: string | null;
  isFounder: boolean;
  onAction: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [probability, setProbability] = useState(75); // default 75%
  const savedCommit = wallet ? loadCommitRecord(campaign.address, m.index) : null;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const isCurrentMilestone = Number(campaign.currentMilestoneIndex) === m.index;

  const run = async (label: string, fn: () => Promise<string>) => {
    setBusy(true);
    try {
      const hash = await fn();
      toast.success(label, undefined, hash);
      onAction();
    } catch (err) {
      toast.error(`${label} failed`, extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const colorClass = MILESTONE_STATE_COLORS[m.state];

  return (
    <div className={`liquid-glass rounded-2xl p-6 border ${colorClass.split(" ")[1]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-body uppercase tracking-widest font-medium ${colorClass.split(" ")[0]}`}>
              {milestoneStateLabel(m.state)}
            </span>
            <span className="text-white/20 font-body text-xs">·</span>
            <span className="text-white/40 font-body text-xs">{fmtBps(m.fundingBps)} of raise</span>
            {isCurrentMilestone && (
              <span className="liquid-glass rounded-full px-2 py-0.5 text-[10px] font-body text-white/60 uppercase tracking-wider">
                Current
              </span>
            )}
          </div>
          <p className="text-white font-body text-sm leading-relaxed">{m.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white/40 font-body text-xs">Allocation</p>
          <p className="text-white font-heading italic text-xl">{fmtEth(m.ethAllocation)} ETH</p>
        </div>
      </div>

      {/* AI Agent Score */}
      {m.agentScoreSubmitted && (
        <div className="flex items-center gap-2 mb-4 liquid-glass rounded-xl px-3 py-2.5">
          <Bot className="w-3.5 h-3.5 text-white/50" />
          <span className="text-white/50 font-body text-xs">AI Verification Score</span>
          <span className={`font-body font-medium text-sm ml-auto ${agentScoreColor(m.agentScore)}`}>
            {(Number(m.agentScore) / 100).toFixed(0)} / 100
          </span>
          <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${Number(m.agentScore) >= 8000 ? "bg-emerald-400" : Number(m.agentScore) >= 5000 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${Number(m.agentScore) / 100}%` }}
            />
          </div>
        </div>
      )}

      {!m.agentScoreSubmitted && m.state === MilestoneState.Pending && isCurrentMilestone && (
        <div className="flex items-center gap-2 mb-4 liquid-glass rounded-xl px-3 py-2.5 border border-white/5">
          <Bot className="w-3.5 h-3.5 text-white/30 animate-pulse" />
          <span className="text-white/30 font-body text-xs">Awaiting AI verification…</span>
        </div>
      )}

      {/* Voting phase info */}
      {(m.state === MilestoneState.VotingOpen || m.state === MilestoneState.RevealOpen) && (
        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
          <div className={`liquid-glass rounded-xl px-3 py-2 ${m.state === MilestoneState.VotingOpen ? "border border-amber-500/20" : ""}`}>
            <p className="text-white/40 font-body text-[10px] uppercase tracking-widest">Commit deadline</p>
            <p className={`font-body font-medium text-xs mt-0.5 ${now < m.commitDeadline ? "text-amber-300" : "text-white/30 line-through"}`}>
              {timeLeft(m.commitDeadline)}
            </p>
          </div>
          <div className={`liquid-glass rounded-xl px-3 py-2 ${m.state === MilestoneState.RevealOpen ? "border border-blue-500/20" : ""}`}>
            <p className="text-white/40 font-body text-[10px] uppercase tracking-widest">Reveal deadline</p>
            <p className={`font-body font-medium text-xs mt-0.5 ${now < m.revealDeadline && now >= m.commitDeadline ? "text-blue-300" : now < m.commitDeadline ? "text-white/30" : "text-white/30 line-through"}`}>
              {timeLeft(m.revealDeadline)}
            </p>
          </div>
        </div>
      )}

      {/* Participant count */}
      {m.participantCount > 0 && (
        <p className="text-white/30 font-body text-xs mb-4">
          {m.participantCount.toString()} voter{m.participantCount !== BigInt(1) ? "s" : ""} participated
        </p>
      )}

      {/* ── Action buttons ── */}
      <div className="space-y-2">

        {/* FOUNDER: Start voting */}
        {isFounder && m.state === MilestoneState.Pending && isCurrentMilestone &&
          campaign.campaignState === CampaignState.Funded && (
          <button
            disabled={busy}
            onClick={() => run("Voting started", () => startMilestoneVote(campaign.address))}
            className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
            Start Milestone Vote
          </button>
        )}

        {/* FOUNDER: Release funds */}
        {isFounder && m.state === MilestoneState.Passed && !m.fundsReleased && (
          <button
            disabled={busy}
            onClick={() => run("Funds released", () => releaseMilestone(campaign.address, m.index))}
            className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2.5 font-body font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
            Release {fmtEth(m.ethAllocation)} ETH
          </button>
        )}

        {/* INVESTOR: Commit vote */}
        {!isFounder && wallet && m.state === MilestoneState.VotingOpen && !m.hasCommitted && now < m.commitDeadline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-body text-xs">Your probability estimate: milestone was achieved</span>
              <span className="text-white font-body font-medium text-sm">{probability}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full accent-white"
            />
            <p className="text-white/30 font-body text-[10px] leading-relaxed">
              Your vote is hidden until reveal phase. The hash of your probability + a random salt will be committed on-chain.
            </p>
            <button
              disabled={busy}
              onClick={() => run("Vote committed", () =>
                commitVote(campaign.address, m.index, probability * 100).then((r) => {
                  toast.info("Save your commitment", `Probability: ${r.probability / 100}% — stored locally for reveal.`);
                  return "";
                })
              )}
              className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Commit Vote (Hidden)
            </button>
          </div>
        )}

        {/* INVESTOR: Already committed */}
        {!isFounder && wallet && m.hasCommitted && !m.hasRevealed && m.state === MilestoneState.VotingOpen && (
          <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-amber-500/20">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-amber-300 font-body font-medium text-sm">Vote committed</p>
              <p className="text-white/40 font-body text-xs">Reveal after {timeLeft(m.commitDeadline)}</p>
            </div>
            {savedCommit && (
              <span className="ml-auto text-white/30 font-body text-xs">{savedCommit.probability / 100}%</span>
            )}
          </div>
        )}

        {/* INVESTOR: Reveal vote */}
        {!isFounder && wallet && m.hasCommitted && !m.hasRevealed && m.state === MilestoneState.RevealOpen && (
          <div className="space-y-2">
            {savedCommit ? (
              <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-blue-500/20">
                <Unlock className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-body font-medium text-sm">Ready to reveal</p>
                  <p className="text-white/40 font-body text-xs">Committed probability: {savedCommit.probability / 100}%</p>
                </div>
              </div>
            ) : (
              <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-300 font-body text-sm">Commitment not found in this browser. You must use the same browser/device you used to commit.</p>
              </div>
            )}
            {savedCommit && (
              <button
                disabled={busy}
                onClick={() => run("Vote revealed", () => revealVote(campaign.address, m.index))}
                className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                Reveal Vote
              </button>
            )}
          </div>
        )}

        {/* Anyone: Resolve after reveal deadline */}
        {(m.state === MilestoneState.VotingOpen || m.state === MilestoneState.RevealOpen) &&
          now > m.revealDeadline && (
          <button
            disabled={busy}
            onClick={() => run("Vote resolved", () => resolveVote(campaign.address, m.index))}
            className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Resolve Vote
          </button>
        )}

        {/* INVESTOR: Claim refund */}
        {!isFounder && wallet && (m.state === MilestoneState.Failed || m.state === MilestoneState.Inconclusive) && (
          <button
            disabled={busy}
            onClick={() => run("Refund claimed", () => claimRefund(campaign.address, m.index))}
            className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2.5 text-red-400 font-body font-medium text-sm border border-red-500/20 hover:bg-red-500/5 transition-colors disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Claim Refund
          </button>
        )}

        {/* Released */}
        {m.fundsReleased && (
          <div className="flex items-center gap-2 text-emerald-400/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-body text-xs">Funds released to founder</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CampaignDetails() {
  const { id: campaignAddress } = useParams<{ id: string }>();
  const { wallet } = useWallet();
  const toast = useToast();

  const [campaign, setCampaign] = useState<ICampaignDetails | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState("");
  const [investing, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!campaignAddress) return;
    try {
      const [c, ms] = await Promise.all([
        fetchCampaignDetails(campaignAddress, wallet ?? undefined),
        fetchMilestones(campaignAddress, wallet ?? undefined),
      ]);
      setCampaign(c);
      setMilestones(ms);
    } catch (err) {
      toast.error("Failed to load campaign", extractError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignAddress, wallet, toast]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const handleInvest = async () => {
    if (!wallet || !campaign) return;
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast.warning("Invalid amount", "Enter a positive ETH amount.");
      return;
    }
    setBusy(true);
    try {
      toast.info("Investing…", "Approve the transaction in your wallet.");
      const hash = await investInCampaign(campaign.address, investAmount);
      toast.success(`Invested ${investAmount} ETH`, undefined, hash);
      setInvestAmount("");
      load();
    } catch (err) {
      toast.error("Investment failed", extractError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 gap-4">
        <AlertCircle className="w-8 h-8 text-white/30" />
        <p className="text-white/40 font-body">Campaign not found</p>
        <Link to="/" className="text-white/60 font-body text-sm hover:text-white transition-colors">← Back to home</Link>
      </div>
    );
  }

  const isFounder = wallet?.toLowerCase() === campaign.founder.toLowerCase();
  const progressPct = pct(campaign.totalRaised, campaign.goal);
  const isActive = campaign.campaignState === CampaignState.Active;
  const userHasInvested = campaign.investedAmount && campaign.investedAmount > 0n;

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 font-body text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Campaigns
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <a
              href={`https://dashboard.tenderly.co/contract/${campaignAddress}`}
              target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Campaign header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`liquid-glass rounded-full px-3 py-1 text-xs font-body uppercase tracking-widest ${
              isActive ? "text-emerald-400 border border-emerald-500/20" : "text-white/40"
            }`}>
              {campaignStateLabel(campaign.campaignState)}
            </span>
            {isFounder && (
              <span className="liquid-glass rounded-full px-3 py-1 text-xs font-body uppercase tracking-widest text-white/50">
                Your Campaign
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-heading italic text-white tracking-tight leading-[0.9] mb-3">
            {campaign.title}
          </h1>
          <p className="text-white/60 font-body font-light text-sm leading-relaxed max-w-2xl">
            {campaign.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* ── Left: stats + invest ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Funding progress */}
            <div className="liquid-glass rounded-2xl p-5">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-white/40 font-body font-light text-xs mb-1">Raised</p>
                  <p className="text-white font-heading italic text-3xl">{fmtEth(campaign.totalRaised)} ETH</p>
                </div>
                <p className="text-white/40 font-body text-sm">of {fmtEth(campaign.goal)} ETH</p>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-body text-white/30">
                <span>{progressPct}% funded</span>
                <span>{timeLeft(campaign.deadline)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { Icon: Users, label: "Investors", value: campaign.investorCount.toString() },
                { Icon: TrendingUp, label: "Milestones", value: campaign.milestoneCount.toString() },
                { Icon: Shield, label: "Founder Stake", value: `${fmtEth(campaign.founderStake)} ETH` },
                { Icon: Clock, label: "Deadline", value: new Date(Number(campaign.deadline) * 1000).toLocaleDateString() },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="liquid-glass rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-white/30" />
                    <span className="text-white/30 font-body text-[10px] uppercase tracking-widest">{label}</span>
                  </div>
                  <p className="text-white font-body font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Token info (if invested) */}
            {campaign.tokenName && campaign.tokenBalance !== undefined && (
              <div className="liquid-glass rounded-xl p-4">
                <p className="text-white/40 font-body text-xs uppercase tracking-widest mb-2">Your Position</p>
                <p className="text-white font-heading italic text-2xl">{fmtEth(campaign.tokenBalance, 2)}</p>
                <p className="text-white/40 font-body text-xs">{campaign.tokenSymbol} tokens</p>
                {campaign.reputationScore !== undefined && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-white/30 font-body text-xs">Reputation</span>
                    <span className="text-white/60 font-body text-xs">{(Number(campaign.reputationScore) / 100).toFixed(0)} / 100</span>
                  </div>
                )}
              </div>
            )}

            {/* Invest form */}
            {isActive && !isFounder && (
              <div className="liquid-glass rounded-2xl p-4 space-y-3">
                <p className="text-white font-body font-medium text-sm">
                  {userHasInvested ? "Invest More" : "Invest in this Campaign"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="ETH amount"
                    className="flex-1 liquid-glass rounded-xl px-3 py-2 text-sm font-body text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/20 bg-transparent"
                  />
                  <button
                    disabled={investing || !wallet || !investAmount}
                    onClick={handleInvest}
                    className="liquid-glass-strong rounded-xl px-4 py-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {investing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Invest
                  </button>
                </div>
                {!wallet && (
                  <p className="text-white/30 font-body text-xs">Connect wallet to invest</p>
                )}
              </div>
            )}

            {/* Contract address */}
            <div className="liquid-glass rounded-xl px-4 py-3">
              <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-1">Contract</p>
              <p className="text-white/50 font-mono text-xs break-all">{campaign.address}</p>
            </div>
          </div>

          {/* ── Right: milestones ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-white font-heading italic text-2xl">Milestones</h2>
            {milestones.map((m) => (
              <MilestoneCard
                key={m.index}
                m={m}
                campaign={campaign}
                wallet={wallet}
                isFounder={isFounder}
                onAction={load}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
