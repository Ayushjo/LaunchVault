import { useState } from "react";
import { Link } from "react-router-dom";
import { campaigns, currentUser } from "../data/mockData";
import { useWallet } from "../context/WalletContext";
import {
  Zap, TrendingUp, Users, Shield, Clock,
  CheckCircle2, ThumbsUp, ThumbsDown, ArrowRight,
  Wallet, BarChart3, Vote, AlertCircle, Eye,
  ChevronRight
} from "lucide-react";

function ProgressBar({ value }) {
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

function StatCard({ icon: Icon, value, label, sub }) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3 rounded-xl">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-black text-white truncate">{value}</div>
        <div className="text-slate-400 text-xs font-medium truncate">{label}</div>
        {sub && <div className="text-emerald-400 text-xs font-bold mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

// ─── FOUNDER DASHBOARD ───────────────────────────────────────────
function FounderDashboard() {
  const founderCampaigns = campaigns.slice(0, 2);
  const [requested, setRequested] = useState({});

  const totalRaised = founderCampaigns.reduce((s, c) => s + c.raised, 0);
  const totalInvestors = founderCampaigns.reduce((s, c) => s + c.investors, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Stats — 2x2 on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={TrendingUp} value={`${totalRaised} ETH`} label="Total Raised" sub="All campaigns" />
        <StatCard icon={Users} value={totalInvestors} label="Investors" sub="Unique wallets" />
        <StatCard icon={BarChart3} value={founderCampaigns.length} label="Campaigns" sub="Active + Closed" />
        <StatCard icon={Shield} value="1" label="Approved" sub="Funds released" />
      </div>

      {/* Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-black text-white">Your Campaigns</h2>
          <Link
            to="/create"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            + New <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {founderCampaigns.map((campaign) => {
            const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            );
            const isVoting = campaign.milestone.votingActive;
            const isReleased = campaign.milestone.released;
            const voteTotal = campaign.milestone.voteYes + campaign.milestone.voteNo;
            const yesPercent = voteTotal > 0 ? Math.round((campaign.milestone.voteYes / voteTotal) * 100) : 0;

            return (
              <div key={campaign.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        isReleased
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : isVoting
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                        {isReleased ? "Completed" : isVoting ? "Voting" : "Live"}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{campaign.category}</span>
                    </div>
                    <h3 className="text-white font-black text-base sm:text-lg leading-tight line-clamp-2">
                      {campaign.title}
                    </h3>
                  </div>
                  <Link
                    to={`/campaign/${campaign.id}`}
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
                      {campaign.raised}
                      <span className="text-slate-500 font-normal"> / {campaign.goal} ETH</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} />
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{campaign.investors} investors</span>
                    <span>{daysLeft > 0 ? `${daysLeft}d left` : "Ended"}</span>
                  </div>
                </div>

                {/* Milestone block */}
                <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Milestone
                    </span>
                    {isReleased && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Released
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {campaign.milestone.description}
                  </p>

                  {isVoting && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500" style={{ width: `${yesPercent}%` }} />
                        <div className="bg-red-500/70" style={{ width: `${100 - yesPercent}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400 font-semibold">
                          {yesPercent}% Yes ({campaign.milestone.voteYes})
                        </span>
                        <span className="text-red-400 font-semibold">
                          {100 - yesPercent}% No ({campaign.milestone.voteNo})
                        </span>
                      </div>
                    </div>
                  )}

                  {!isVoting && !isReleased && campaign.raised >= campaign.goal && (
                    <button
                      onClick={() => setRequested((prev) => ({ ...prev, [campaign.id]: true }))}
                      disabled={requested[campaign.id]}
                      className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95"
                    >
                      {requested[campaign.id] ? "✓ Release Requested" : "Request Milestone Release"}
                    </button>
                  )}

                  {campaign.raised < campaign.goal && !isReleased && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Goal not reached — milestone locked
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── INVESTOR DASHBOARD ──────────────────────────────────────────
function InvestorDashboard() {
  const investedCampaigns = currentUser.investments.map((inv) => ({
    ...inv,
    campaign: campaigns.find((c) => c.id === inv.campaignId),
  })).filter((i) => i.campaign);

  const [votes, setVotes] = useState({});

  const totalInvested = currentUser.investments.reduce((s, i) => s + i.amount, 0);
  const totalTokens = currentUser.investments.reduce((s, i) => s + i.tokens, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Wallet} value={`${totalInvested} ETH`} label="Invested" sub="Locked in contracts" />
        <StatCard icon={Zap} value={totalTokens} label="Tokens" sub="Across campaigns" />
        <StatCard icon={Vote} value={investedCampaigns.length} label="Positions" sub="Campaigns backed" />
        <StatCard icon={TrendingUp} value="1" label="Votes Cast" sub="This month" />
      </div>

      {/* Portfolio */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white mb-4 sm:mb-5">Your Portfolio</h2>
        <div className="space-y-4">
          {investedCampaigns.map(({ campaign, amount, tokens }) => {
            const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
            const ownership = ((amount / campaign.goal) * 100).toFixed(1);
            const isVoting = campaign.milestone.votingActive;
            const isReleased = campaign.milestone.released;
            const hasVoted = votes[campaign.id];

            return (
              <div key={campaign.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        isReleased
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : isVoting
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                        {isReleased ? "Completed" : isVoting ? "Vote Needed" : "Active"}
                      </span>
                    </div>
                    <h3 className="text-white font-black text-base sm:text-lg line-clamp-1">
                      {campaign.title}
                    </h3>
                  </div>
                  <Link
                    to={`/campaign/${campaign.id}`}
                    className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium bg-slate-800/50 px-2.5 py-1.5 rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </div>

                {/* Token + ownership — scrollable on very small screens */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-white font-black text-sm sm:text-base">{amount} ETH</div>
                    <div className="text-xs text-slate-500 mt-0.5">Invested</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-emerald-400 font-black font-mono text-sm sm:text-base">{tokens}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{campaign.tokens}</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-white font-black text-sm sm:text-base">{ownership}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Share</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs sm:text-sm text-slate-400">Campaign Progress</span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm">{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                {/* Milestone voting */}
                <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Milestone Vote
                  </span>
                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
                    {campaign.milestone.description}
                  </p>

                  {isVoting && !hasVoted && (
                    <div className="flex gap-2 sm:gap-3 pt-1">
                      <button
                        onClick={() => setVotes((prev) => ({ ...prev, [campaign.id]: "yes" }))}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setVotes((prev) => ({ ...prev, [campaign.id]: "no" }))}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95"
                      >
                        <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {isVoting && hasVoted && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm font-bold border ${
                      hasVoted === "yes"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {hasVoted === "yes"
                        ? <ThumbsUp className="w-4 h-4 shrink-0" />
                        : <ThumbsDown className="w-4 h-4 shrink-0" />
                      }
                      Voted {hasVoted === "yes" ? "to Approve" : "to Reject"} — recorded
                    </div>
                  )}

                  {!isVoting && isReleased && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Approved — funds released to founder
                    </div>
                  )}

                  {!isVoting && !isReleased && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      Waiting for founder to request release
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState("investor");
  const { wallet, connectWallet, shortAddress } = useWallet();

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[300px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative z-10">

        {/* Header */}
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
                Logged in as{" "}
                <span className="text-emerald-400 font-mono font-bold break-all">
                  {shortAddress}
                </span>
              </span>
            ) : (
              "Connect your wallet to view your portfolio."
            )}
          </p>
        </div>

        {/* Wallet Gate */}
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
              Connect your wallet to view your investments, vote on milestones, and manage your campaigns.
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
            {/* Tab Switcher — full width on mobile */}
            <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-900/50 border border-slate-800 p-1 rounded-2xl w-full sm:w-fit">
              {[
                { id: "investor", label: "Investor", labelFull: "Investor View", icon: Wallet },
                { id: "founder", label: "Founder", labelFull: "Founder View", icon: TrendingUp },
              ].map(({ id, label, labelFull, icon: Icon }) => (
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

            {tab === "founder" ? <FounderDashboard /> : <InvestorDashboard />}
          </>
        )}
      </div>
    </div>
  );
}