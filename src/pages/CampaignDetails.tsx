import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { useWallet } from "../context/WalletContext";
import {
  voteOnCampaign,
  fetchCampaignInfo,
  investInCampaign,
  type CampaignInfo,
} from "../hooks/useCampaign";
import {
  ArrowLeft,
  Zap,
  Users,
  Clock,
  Shield,
  TrendingUp,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Live",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  voting: {
    label: "Voting Open",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  funded: {
    label: "Funded",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  released: {
    label: "Completed",
    color: "text-slate-300",
    bg: "bg-slate-800 border-slate-700",
  },
};

function formatEth(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6);
}

function getStatus(
  info: CampaignInfo,
): "active" | "voting" | "funded" | "released" {
  if (info.fundsReleased) return "released";
  if (info.cancelled) return "released";
  if (info.goalReached) return "funded";
  return "active";
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-700 relative"
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
      </div>
    </div>
  );
}

function VoteBar({ yes, no }: { yes: number; no: number }) {
  const total = yes + no;
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0;
  const noPercent = total > 0 ? Math.round((no / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="bg-red-500/70 transition-all"
          style={{ width: `${noPercent}%` }}
        />
        <div className="flex-1 bg-slate-800" />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span className="text-emerald-400 font-semibold">
          {yesPercent}% Yes ({yes} votes)
        </span>
        <span className="text-red-400 font-semibold">
          {noPercent}% No ({no} votes)
        </span>
      </div>
    </div>
  );
}

function InvestModal({
  campaignAddress,
  campaignInfo,
  onClose,
}: {
  campaignAddress: string;
  campaignInfo: CampaignInfo;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goal = Number(campaignInfo.goal) / 1e18;
  const estimatedTokens = amount
    ? Math.floor((parseFloat(amount) / goal) * 10000)
    : 0;

  async function handleInvest() {
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      setLoading(true);
      setError(null);
      const hash = await investInCampaign(campaignAddress, amount);
      setTxHash(hash);
    } catch (err: any) {
      if (err.message.includes("user rejected"))
        setError("Transaction rejected.");
      else if (err.message.includes("insufficient funds"))
        setError("Insufficient funds in wallet.");
      else if (err.message.includes("Founder cannot invest"))
        setError("Founder cannot invest in their own campaign.");
      else setError(err.message.slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {txHash ? (
          <div className="text-center py-4">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-2">
              Investment Confirmed!
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Your {amount} ETH is now locked in the smart contract.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-6">
              <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
              <p className="text-xs font-mono text-emerald-400 break-all">
                {txHash}
              </p>
            </div>
            <a
              href={`https://dashboard.tenderly.co`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-bold mb-4"
            >
              <ExternalLink className="w-4 h-4" /> View on Tenderly
            </a>
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white mb-1">
                Invest in Campaign
              </h2>
              <p className="text-slate-400 text-sm">{campaignInfo.title}</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white text-lg font-bold placeholder-slate-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ETH
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {["0.001", "0.01", "0.1", "1"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {amount && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">You will receive</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {estimatedTokens} tokens
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ownership share</span>
                    <span className="text-white font-bold">
                      {goal > 0
                        ? ((parseFloat(amount) / goal) * 100).toFixed(2)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Voting power</span>
                    <span className="text-white font-bold">Proportional</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Funds are locked in a smart contract and only released when
                  you vote to approve milestones.
                </p>
              </div>

              <button
                onClick={handleInvest}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Confirm Investment
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { wallet, connectWallet } = useWallet();
  const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userVote, setUserVote] = useState<"yes" | "no" | null>(null);
  const [copied, setCopied] = useState(false);

  const campaignAddress = id ?? "";

  useEffect(() => {
    if (!campaignAddress) return;
    async function load() {
      try {
        const info = await fetchCampaignInfo(campaignAddress);
        setCampaignInfo(info);
      } catch (err) {
        console.error("Failed to load campaign:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignAddress]);

  function copyAddress() {
    navigator.clipboard.writeText(campaignAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">
            Loading campaign from chain...
          </p>
        </div>
      </div>
    );
  }

  if (!campaignInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-white mb-2">
            Campaign Not Found
          </h2>
          <p className="text-slate-400 mb-6">
            This campaign doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const goal = Number(campaignInfo.goal) / 1e18;
  const raised = Number(campaignInfo.totalRaised) / 1e18;
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const deadline = new Date(Number(campaignInfo.deadline) * 1000);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / 86400000),
  );
  const status = statusConfig[getStatus(campaignInfo)];

  return (
    <div className="min-h-screen pb-24">
      {showModal && (
        <InvestModal
          campaignAddress={campaignAddress}
          campaignInfo={campaignInfo}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}
                >
                  {status.label}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <span>
                    {campaignAddress.slice(0, 10)}...{campaignAddress.slice(-6)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="hover:text-slate-300 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {campaignInfo.title}
              </h1>
              <p className="text-slate-400 leading-relaxed text-base mb-6">
                {campaignInfo.description}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {raised.toFixed(4)} ETH
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Raised</div>
                </div>
                <div className="text-center border-x border-white/5">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-white">—</div>
                  <div className="text-xs text-slate-500 mt-0.5">Investors</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {daysLeft > 0 ? `${daysLeft}d` : "Ended"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Remaining</div>
                </div>
              </div>
            </div>

            {/* Milestone */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Milestone</h2>
                  <p className="text-xs text-slate-500">
                    Fund release requires investor approval
                  </p>
                </div>
                {campaignInfo.fundsReleased && (
                  <span className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Released
                  </span>
                )}
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-5 mb-6">
                <p className="text-slate-300 font-medium leading-relaxed">
                  {campaignInfo.milestoneDescription}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-slate-500">Release amount</span>
                  <span className="text-emerald-400 font-black">
                    {goal} ETH
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Voting Status
                </h3>
                <VoteBar yes={0} no={0} />

                {!campaignInfo.goalReached && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-800/30 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Voting opens once the funding goal is reached.
                  </div>
                )}

                {campaignInfo.goalReached && !campaignInfo.fundsReleased && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 mb-3">
                      Cast your vote as an investor
                    </p>
                    {wallet ? (
                      userVote ? (
                        <div
                          className={`flex items-center gap-2 p-4 rounded-xl border ${
                            userVote === "yes"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}
                        >
                          {userVote === "yes" ? (
                            <ThumbsUp className="w-4 h-4" />
                          ) : (
                            <ThumbsDown className="w-4 h-4" />
                          )}
                          <span className="font-bold text-sm">
                            Vote submitted on-chain ✓
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={async () => {
                              try {
                                await voteOnCampaign(campaignAddress, true);
                                setUserVote("yes");
                              } catch (err: any) {
                                alert(err.message.slice(0, 100));
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl transition-all active:scale-95"
                          >
                            <ThumbsUp className="w-4 h-4" /> Vote Yes
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await voteOnCampaign(campaignAddress, false);
                                setUserVote("no");
                              } catch (err: any) {
                                alert(err.message.slice(0, 100));
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all active:scale-95"
                          >
                            <ThumbsDown className="w-4 h-4" /> Vote No
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={connectWallet}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-emerald-400" /> Connect
                        Wallet to Vote
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Info */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <ExternalLink className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    On-Chain Info
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified smart contract
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/30 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Contract Address
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300">
                      {campaignAddress.slice(0, 10)}...
                      {campaignAddress.slice(-6)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-800/30 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-500">Founder</span>
                  <span className="text-xs font-mono text-slate-300">
                    {campaignInfo.founder.slice(0, 10)}...
                    {campaignInfo.founder.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/30 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-500">Network</span>
                  <span className="text-xs font-bold text-emerald-400">
                    LaunchVault Testnet (9991)
                  </span>
                </div>
                <a
                  href="https://dashboard.tenderly.co"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium px-4 py-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Tenderly
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">
            <div className="glass-card rounded-3xl p-6 sticky top-24">
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-3xl font-black text-white">
                    {raised.toFixed(4)} ETH
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-3">
                  raised of {goal} ETH goal
                </p>
                <ProgressBar value={progress} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 pt-4 border-t border-white/5">
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {daysLeft > 0 ? `${daysLeft}d` : "—"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Days Left</div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Funded</div>
                </div>
              </div>

              {wallet ? (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={
                    campaignInfo.fundsReleased ||
                    campaignInfo.cancelled ||
                    campaignInfo.goalReached ||
                    daysLeft === 0
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40 mb-3"
                >
                  Invest Now
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 mb-3 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-emerald-400" /> Connect Wallet to
                  Invest
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                <Shield className="w-3.5 h-3.5" /> Funds locked in smart
                contract
              </div>
            </div>

            {/* Token Info */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Token Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Supply</span>
                  <span className="text-white font-bold">10,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-bold">ERC-20</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Voting</span>
                  <span className="text-white font-bold">1 token = 1 vote</span>
                </div>
                {wallet ? (
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={
                      campaignInfo.fundsReleased ||
                      campaignInfo.cancelled ||
                      campaignInfo.goalReached ||
                      daysLeft === 0
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40 mb-3"
                  >
                    {campaignInfo.goalReached
                      ? "Goal Reached ✓"
                      : campaignInfo.fundsReleased
                        ? "Completed"
                        : "Invest Now"}
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>

            {/* Founder */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Founder
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-slate-700 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
                  F
                </div>
                <div>
                  <div className="text-slate-300 font-mono text-xs break-all">
                    {campaignInfo.founder}
                  </div>
                  <div className="text-xs text-slate-500">Campaign Creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
