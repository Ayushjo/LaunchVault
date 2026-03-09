import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { campaigns } from "../data/mockData";
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
  CheckCircle2Icon
} from "lucide-react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { CAMPAIGN_ABI, CONTRACT_CONFIG } from "../contracts/config";
interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "active" | "voting" | "funded" | "released";
  raised: number;
  goal: number;
  investors: number;
  deadline: string;
  tokens: string;
  founder: string;
  milestone: {
    description: string;
    amount: number;
    voteYes: number;
    voteNo: number;
    votingActive: boolean;
    released: boolean;
  };
}

interface StatusConfigEntry {
  label: string;
  color: string;
  bg: string;
}

interface Investor {
  address: string;
  amount: number;
  tokens: number;
  date: string;
}

interface ProgressBarProps {
  value: number;
}

interface VoteBarProps {
  yes: number;
  no: number;
}

interface InvestModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const statusConfig: Record<string, StatusConfigEntry> = {
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

const mockInvestors: Investor[] = [
  { address: "0xA1b2...C3d4", amount: 10, tokens: 1000, date: "2025-03-01" },
  { address: "0xE5f6...G7h8", amount: 7.5, tokens: 750, date: "2025-03-03" },
  { address: "0xI9j0...K1l2", amount: 5, tokens: 500, date: "2025-03-05" },
  { address: "0xM3n4...O5p6", amount: 3, tokens: 300, date: "2025-03-07" },
  { address: "0xQ7r8...S9t0", amount: 2, tokens: 200, date: "2025-03-09" },
];

function ProgressBar({ value }: ProgressBarProps) {
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

function VoteBar({ yes, no }: VoteBarProps) {
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

function InvestModal({ campaign, onClose }: InvestModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const estimatedTokens = amount
    ? Math.floor((parseFloat(amount) / campaign.goal) * 10000)
    : 0;

  async function handleInvest() {
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      setLoading(true);
      setError(null);

      // Get signer from MetaMask
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Connect to contract
      const contract = new Contract(
        CONTRACT_CONFIG.campaignAddress,
        CAMPAIGN_ABI,
        signer,
      );

      // Send transaction
      const tx = await contract.invest({
        value: parseEther(amount),
      });

      // Wait for confirmation
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err: any) {
      // Clean up error message for user
      if (err.message.includes("user rejected")) {
        setError("Transaction rejected by user");
      } else if (err.message.includes("insufficient funds")) {
        setError("Insufficient funds in wallet");
      } else {
        setError(err.message.slice(0, 100));
      }
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

        {/* Success State */}
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
              href={`https://dashboard.tenderly.co/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-bold mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              View on Tenderly
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
              <p className="text-slate-400 text-sm">{campaign.title}</p>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAmount(e.target.value)
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 text-white text-lg font-bold placeholder-slate-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ETH
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {["0.1", "0.5", "1", "5"].map((v: string) => (
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
                      {estimatedTokens} {campaign.tokens}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ownership share</span>
                    <span className="text-white font-bold">
                      {((parseFloat(amount) / campaign.goal) * 100).toFixed(2)}%
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
  const campaign = campaigns.find(
    (c) => c.id === parseInt(id ?? ""),
  ) as unknown as Campaign | undefined;
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<"yes" | "no" | null>(null);
  const { wallet, connectWallet } = useWallet();

  if (!campaign) {
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

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const status = statusConfig[campaign.status] ?? statusConfig.active;
  const { milestone } = campaign;

  return (
    <div className="min-h-screen pb-24">
      {showModal && (
        <InvestModal campaign={campaign} onClose={() => setShowModal(false)} />
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
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}
                >
                  {status.label}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {campaign.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {campaign.title}
              </h1>
              <p className="text-slate-400 leading-relaxed text-base mb-6">
                {campaign.description}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {campaign.raised} ETH
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Raised</div>
                </div>
                <div className="text-center border-x border-white/5">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {campaign.investors}
                  </div>
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

            {/* Milestone + Voting */}
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
                {milestone.released && (
                  <span className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Released
                  </span>
                )}
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-5 mb-6">
                <p className="text-slate-300 font-medium leading-relaxed">
                  {milestone.description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-slate-500">Release amount</span>
                  <span className="text-emerald-400 font-black">
                    {milestone.amount} ETH
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Voting Status
                </h3>
                <VoteBar yes={milestone.voteYes} no={milestone.voteNo} />

                {milestone.votingActive && !userVote && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 mb-3">
                      Cast your vote as an investor
                    </p>
                    {wallet ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setUserVote("yes")}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl transition-all active:scale-95"
                        >
                          <ThumbsUp className="w-4 h-4" /> Vote Yes
                        </button>
                        <button
                          onClick={() => setUserVote("no")}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all active:scale-95"
                        >
                          <ThumbsDown className="w-4 h-4" /> Vote No
                        </button>
                      </div>
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

                {userVote && (
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
                      You voted {userVote === "yes" ? "Yes" : "No"} — vote
                      recorded
                    </span>
                  </div>
                )}

                {!milestone.votingActive && !milestone.released && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-800/30 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Voting hasn't started yet. The founder must request
                    milestone release first.
                  </div>
                )}
              </div>
            </div>

            {/* Investor List */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Investors</h2>
                  <p className="text-xs text-slate-500">
                    {campaign.investors} backers on-chain
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mockInvestors.map((inv: Investor, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 rounded-xl px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-slate-700 border border-slate-600 flex items-center justify-center text-xs font-black text-emerald-400">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-mono text-sm">
                            {inv.address}
                          </span>
                          <button className="text-slate-600 hover:text-slate-400 transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-slate-500">
                          {inv.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">
                        {inv.amount} ETH
                      </div>
                      <div className="text-emerald-400 font-mono text-xs">
                        {inv.tokens} {campaign.tokens}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Sticky Sidebar */}
          <div className="space-y-5">
            <div className="glass-card rounded-3xl p-6 sticky top-24">
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-3xl font-black text-white">
                    {campaign.raised} ETH
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-3">
                  raised of {campaign.goal} ETH goal
                </p>
                <ProgressBar value={progress} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 pt-4 border-t border-white/5">
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {campaign.investors}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Backers</div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {daysLeft > 0 ? `${daysLeft}d` : "—"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Days Left</div>
                </div>
              </div>

              {wallet ? (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={daysLeft === 0 || campaign.status === "released"}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40 mb-3"
                >
                  Invest Now
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black py-4 rounded-xl transition-all duration-200 active:scale-95 mb-3 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Connect Wallet to Invest
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Funds locked in smart contract
              </div>
            </div>

            {/* Token Info */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Token Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Symbol</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {campaign.tokens}
                  </span>
                </div>
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
              </div>
            </div>

            {/* Founder Info */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Founder
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-slate-700 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
                  F
                </div>
                <div>
                  <div className="text-slate-300 font-mono text-sm">
                    {campaign.founder}
                  </div>
                  <div className="text-xs text-slate-500">Campaign Creator</div>
                </div>
              </div>
              <a
                href={`https://polygonscan.com/address/${campaign.founder}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on PolygonScan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
