import { useState, useEffect, useCallback, type JSX } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Users, Clock, Shield, TrendingUp, CheckCircle2,
  XCircle, Loader2, RefreshCw, ExternalLink, AlertCircle,
  Bot, Lock, Unlock, Vote, FileUp, SlidersHorizontal, Github,
  Trash2, File, Image, ChevronDown, ChevronUp,
  Globe, Building2, UserCheck,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import {
  fetchCampaignDetails, fetchMilestones,
  investInCampaign, startMilestoneVote,
  commitVote, revealVote, resolveVote,
  releaseMilestone, claimRefund,
  submitAgentScore,
  loadCommitRecord,
  getBlockTimestamp,
  fmtEth, fmtBps,
  milestoneStateLabel, campaignStateLabel,
  CampaignState, MilestoneState,
  extractError,
  type CampaignDetails as ICampaignDetails,
  type MilestoneDetails,
} from "../hooks/useCampaign";
import PageBackground from "../components/layout/PageBackground";
import { motion } from "motion/react";

function pct(raised: bigint, goal: bigint): number {
  if (!goal) return 0;
  return Math.min(100, Number((raised * BigInt(100)) / goal));
}

function timeLeft(ts: bigint, chainNow: bigint): string {
  const diffSec = Number(ts) - Number(chainNow);
  if (diffSec <= 0) return "Expired";
  const d = Math.floor(diffSec / 86400);
  const h = Math.floor((diffSec % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h left`;
  return `${h}h ${Math.floor((diffSec % 3600) / 60)}m left`;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

// State → accent colors
const MS_STYLE: Record<number, { text: string; border: string; bar: string; glow: string }> = {
  0: { text: "text-white/35",    border: "border-white/[0.06]",    bar: "bg-white/20",      glow: "" },
  1: { text: "text-amber-400",   border: "border-amber-500/25",    bar: "bg-amber-400/50",  glow: "rgba(240,160,50,0.06)" },
  2: { text: "text-blue-400",    border: "border-blue-500/25",     bar: "bg-blue-400/50",   glow: "rgba(56,130,255,0.06)" },
  3: { text: "text-emerald-400", border: "border-emerald-500/25",  bar: "bg-emerald-400/50",glow: "rgba(52,211,153,0.06)" },
  4: { text: "text-red-400",     border: "border-red-500/25",      bar: "bg-red-400/40",    glow: "rgba(239,68,68,0.05)" },
  5: { text: "text-white/35",    border: "border-white/[0.06]",    bar: "bg-white/20",      glow: "" },
};

const CAMPAIGN_STATE_STYLE: Record<number, { text: string; bg: string; border: string }> = {
  0: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
  1: { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-500/20"    },
  2: { text: "text-white/50",    bg: "bg-white/5",        border: "border-white/10"       },
  3: { text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-500/20"     },
};

// ── Milestone card ────────────────────────────────────────────────────────────

function MilestoneCard({ m, campaign, wallet, isFounder, isOracle, onAction, chainNow }: {
  m: MilestoneDetails; campaign: ICampaignDetails;
  wallet: string | null; isFounder: boolean; isOracle: boolean; onAction: () => void;
  chainNow: bigint;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [probability, setProbability] = useState(75);
  const [oracleScore, setOracleScore] = useState(75);
  const [proofGithub, setProofGithub] = useState("");
  const [proofDesc, setProofDesc] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [agentReport, setAgentReport] = useState<Record<string, unknown> | null>(null);
  const [reportExpanded, setReportExpanded] = useState(false);
  const [osintExpanded, setOsintExpanded] = useState(false);
  const savedCommit = wallet ? loadCommitRecord(campaign.address, m.index) : null;
  const now = chainNow;
  const isCurrentMilestone = Number(campaign.currentMilestoneIndex) === m.index;
  const hasOsint = Boolean(agentReport?.osint);
  const osintReport = asRecord(agentReport?.osint);
  const txHash = asText(agentReport?.tx_hash);
  const style = MS_STYLE[m.state] ?? MS_STYLE[0];
  const osintSection: JSX.Element | null = hasOsint ? (
    <div className="mt-2 border-t border-white/[0.04] pt-2">
      <button
        onClick={() => setOsintExpanded((p) => !p)}
        className="flex items-center gap-1.5 text-white/30 font-body text-xs hover:text-white/50 transition-colors w-full"
      >
        {osintExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <Building2 className="w-3 h-3" />
        Entity verification · {asText(osintReport.verdict)}
        <span className={`ml-auto font-mono ${Number(osintReport.score) >= 7000 ? "text-emerald-400/70" : Number(osintReport.score) >= 4000 ? "text-amber-400/70" : "text-red-400/70"}`}>
          {Math.round(Number(osintReport.score) / 100)}/100
        </span>
      </button>
      {osintExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          <p className="text-white/30 font-body text-[10px] leading-relaxed">
            {asText(osintReport.consistency_assessment)}
          </p>
        </div>
      )}
    </div>
  ) : null;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl p-6 border ${style.border} overflow-hidden`}
      style={{ background: style.glow ? `rgba(0,0,0,0.4)` : "rgba(255,255,255,0.015)" }}
    >
      {/* Glow bg */}
      {style.glow && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${style.glow} 0%, transparent 70%)` }} />
      )}

      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${style.bar}`} />

      <div className="relative pl-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-body uppercase tracking-widest font-medium ${style.text}`}>
                {milestoneStateLabel(m.state)}
              </span>
              <span className="text-white/15 font-body text-xs">·</span>
              <span className="text-white/35 font-body text-xs">{fmtBps(m.fundingBps)} of raise</span>
              {isCurrentMilestone && (
                <span className="liquid-glass rounded-full px-2 py-0.5 text-[10px] font-body text-white/50 uppercase tracking-wider border border-white/8">
                  Current
                </span>
              )}
            </div>
            <p className="text-white font-body text-sm leading-relaxed">{m.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-0.5">Allocation</p>
            <p className="text-white font-heading italic text-2xl">{fmtEth(m.ethAllocation)} ETH</p>
          </div>
        </div>

        {/* AI score */}
        {m.agentScoreSubmitted && (
          <div className="flex items-center gap-3 mb-4 liquid-glass rounded-xl px-3 py-2.5 border border-white/[0.04]">
            <Bot className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white/40 font-body text-xs">AI Score</span>
            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${Number(m.agentScore) >= 8000 ? "bg-emerald-400" : Number(m.agentScore) >= 5000 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${Number(m.agentScore) / 100}%` }}
              />
            </div>
            <span className={`font-body font-medium text-sm ml-1 ${Number(m.agentScore) >= 8000 ? "text-emerald-400" : Number(m.agentScore) >= 5000 ? "text-amber-400" : "text-red-400"}`}>
              {(Number(m.agentScore) / 100).toFixed(0)}/100
            </span>
          </div>
        )}

        {!m.agentScoreSubmitted && m.state === MilestoneState.Pending && isCurrentMilestone && (
          <div className="flex items-center gap-2 mb-4 liquid-glass rounded-xl px-3 py-2.5 border border-white/5">
            <Bot className="w-3.5 h-3.5 text-white/25 animate-pulse" />
            <span className="text-white/25 font-body text-xs">Awaiting AI verification…</span>
          </div>
        )}

        {/* Voting deadlines */}
        {(m.state === MilestoneState.VotingOpen || m.state === MilestoneState.RevealOpen) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className={`liquid-glass rounded-xl px-3 py-2.5 text-center ${m.state === MilestoneState.VotingOpen ? "border border-amber-500/20" : "border border-white/5"}`}>
              <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-0.5">Commit</p>
              <p className={`font-body font-medium text-xs ${now < m.commitDeadline ? "text-amber-300" : "text-white/20 line-through"}`}>
                {timeLeft(m.commitDeadline, now)}
              </p>
            </div>
            <div className={`liquid-glass rounded-xl px-3 py-2.5 text-center ${m.state === MilestoneState.RevealOpen ? "border border-blue-500/20" : "border border-white/5"}`}>
              <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-0.5">Reveal</p>
              <p className={`font-body font-medium text-xs ${now < m.revealDeadline && now >= m.commitDeadline ? "text-blue-300" : now < m.commitDeadline ? "text-white/20" : "text-white/20 line-through"}`}>
                {timeLeft(m.revealDeadline, now)}
              </p>
            </div>
          </div>
        )}

        {m.participantCount > 0 && (
          <p className="text-white/25 font-body text-xs mb-4">
            {m.participantCount.toString()} voter{m.participantCount !== BigInt(1) ? "s" : ""} participated
          </p>
        )}

        {/* FOUNDER: Proof upload panel (when pending + no score yet) */}
        {isFounder && m.state === MilestoneState.Pending && isCurrentMilestone && !m.agentScoreSubmitted && (
          <div className="mb-4 liquid-glass rounded-2xl p-4 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2">
              <FileUp className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/55 font-body font-medium text-sm">Submit Proof for AI Review</span>
            </div>
            <p className="text-white/25 font-body text-xs leading-relaxed">
              Upload documents (PDF/JPG/PNG/WEBP) and/or a GitHub repo. The AI agents will analyze them and write a verification score on-chain.
            </p>

            {agentStatus === "idle" && (
              <>
                {/* Company identity — used for OSINT */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 liquid-glass rounded-xl px-3 py-2 border border-white/[0.04]">
                    <Building2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <input
                      type="text"
                      placeholder="Company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="flex-1 bg-transparent text-white text-xs font-body placeholder-white/20 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 liquid-glass rounded-xl px-3 py-2 border border-white/[0.04]">
                    <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <input
                      type="text"
                      placeholder="Website (e.g. neuralpay.io)"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="flex-1 bg-transparent text-white text-xs font-body placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                {/* Team members */}
                <div className="flex items-center gap-2 liquid-glass rounded-xl px-3 py-2 border border-white/[0.04]">
                  <UserCheck className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <input
                    type="text"
                    placeholder="Team members (comma-separated: John Smith, Jane Doe)"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    className="flex-1 bg-transparent text-white text-xs font-body placeholder-white/20 outline-none"
                  />
                </div>

                {/* GitHub URL */}
                <div className="flex items-center gap-2 liquid-glass rounded-xl px-3 py-2 border border-white/[0.04]">
                  <Github className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <input
                    type="text"
                    placeholder="GitHub repo URL (optional)"
                    value={proofGithub}
                    onChange={(e) => setProofGithub(e.target.value)}
                    className="flex-1 bg-transparent text-white text-xs font-body placeholder-white/20 outline-none"
                  />
                </div>

                {/* Description */}
                <textarea
                  rows={2}
                  placeholder="Describe what you accomplished for this milestone…"
                  value={proofDesc}
                  onChange={(e) => setProofDesc(e.target.value)}
                  className="w-full liquid-glass rounded-xl px-3 py-2.5 text-xs font-body text-white placeholder-white/20 outline-none bg-transparent border border-white/[0.04] resize-none"
                />

                {/* File drop zone */}
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const incoming = Array.from(e.target.files ?? []);
                      setProofFiles((prev) => {
                        const names = new Set(prev.map((f) => f.name));
                        return [...prev, ...incoming.filter((f) => !names.has(f.name))];
                      });
                    }}
                  />
                  <div className="flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl py-3 hover:border-white/25 transition-colors">
                    <FileUp className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-white/30 font-body text-xs">
                      {proofFiles.length > 0 ? "Add more files" : "Click to upload — PDF, JPG, PNG, WEBP"}
                    </span>
                  </div>
                </label>

                {/* File list */}
                {proofFiles.length > 0 && (
                  <ul className="space-y-1.5">
                    {proofFiles.map((f, i) => {
                      const isImage = f.type.startsWith("image/");
                      return (
                        <li key={i} className="flex items-center gap-2 liquid-glass rounded-lg px-3 py-2 border border-white/[0.04]">
                          {isImage
                            ? <Image className="w-3.5 h-3.5 text-white/30 shrink-0" />
                            : <File className="w-3.5 h-3.5 text-white/30 shrink-0" />}
                          <span className="text-white/50 font-body text-xs flex-1 truncate">{f.name}</span>
                          <span className="text-white/20 font-body text-[10px]">{(f.size / 1024).toFixed(0)} KB</span>
                          <button
                            onClick={() => setProofFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="text-white/20 hover:text-red-400 transition-colors ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  onClick={async () => {
                    if (!proofDesc.trim() && !proofGithub.trim() && proofFiles.length === 0) {
                      toast.warning("Nothing to submit", "Provide a GitHub URL or upload at least one document.");
                      return;
                    }
                    if (!proofDesc.trim()) {
                      toast.warning("Description required", "Briefly describe what you achieved.");
                      return;
                    }
                    setAgentStatus("running");
                    try {
                      const form = new FormData();
                      form.append("campaign_address", campaign.address);
                      form.append("milestone_index", String(m.index));
                      form.append("milestone_description", proofDesc.trim() || m.description);
                      if (proofGithub.trim()) form.append("github_url", proofGithub.trim());
                      if (companyName.trim()) form.append("company_name", companyName.trim());
                      if (companyWebsite.trim()) form.append("company_website", companyWebsite.trim());
                      if (teamMembers.trim()) form.append("team_members", teamMembers.trim());
                      proofFiles.forEach((f) => form.append("files", f));

                      const agentBase = (import.meta.env.VITE_AGENT_URL as string | undefined)?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
                      const res = await fetch(`${agentBase}/verify`, {
                        method: "POST",
                        body: form,
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({ detail: res.statusText }));
                        throw new Error(err.detail ?? "Agent server error");
                      }
                      const report = await res.json();
                      setAgentReport(report);
                      setAgentStatus("done");
                      if (report.on_chain) {
                        toast.success("Score written on-chain", `${Math.round((report.final_score as number) / 100)}/100 · You can now start the milestone vote.`, report.tx_hash as string);
                        onAction(); // refresh milestone state
                      } else {
                        toast.warning("Score computed but not written", report.blockchain_error ?? "Oracle write failed — check server logs.");
                      }
                    } catch (err) {
                      setAgentStatus("error");
                      toast.error("Agent pipeline failed", err instanceof Error ? err.message : "Could not reach the agent server. Check VITE_AGENT_URL.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <Bot className="w-4 h-4" />
                  Run AI Verification
                </button>
              </>
            )}

            {agentStatus === "running" && (
              <div className="flex items-center gap-3 px-3 py-4 rounded-xl bg-amber-400/5 border border-amber-500/15">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <div>
                  <p className="text-amber-300 font-body font-medium text-sm">Agents running…</p>
                  <p className="text-white/25 font-body text-xs mt-0.5">OSINT entity check · document forensics · GitHub analysis · Claude synthesis</p>
                </div>
              </div>
            )}

            {agentStatus === "error" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-300 font-body font-medium text-xs">Pipeline failed</p>
                    <p className="text-white/25 font-body text-[10px] mt-0.5">Make sure the agent server is running: <code className="text-white/40">python server.py</code></p>
                  </div>
                </div>
                <button onClick={() => setAgentStatus("idle")} className="text-white/35 font-body text-xs hover:text-white/55 transition-colors">
                  ← Try again
                </button>
              </div>
            )}

            {agentStatus === "done" && agentReport && (
              <div className="space-y-2">
                {/* Score summary */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  (agentReport.final_score as number) >= 7000
                    ? "bg-emerald-400/8 border-emerald-500/20"
                    : (agentReport.final_score as number) >= 4000
                    ? "bg-amber-400/8 border-amber-500/20"
                    : "bg-red-500/8 border-red-500/20"
                }`}>
                  <div className={`text-2xl font-heading italic ${
                    (agentReport.final_score as number) >= 7000 ? "text-emerald-400"
                    : (agentReport.final_score as number) >= 4000 ? "text-amber-400"
                    : "text-red-400"
                  }`}>
                    {Math.round((agentReport.final_score as number) / 100)}/100
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 font-body font-medium text-sm">{agentReport.verdict as string}</p>
                    <p className="text-white/30 font-body text-xs truncate mt-0.5">{agentReport.reasoning as string}</p>
                  </div>
                  {Boolean(agentReport.on_chain) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                {/* Expand for full report */}
                <button
                  onClick={() => setReportExpanded((p) => !p)}
                  className="flex items-center gap-1.5 text-white/30 font-body text-xs hover:text-white/50 transition-colors"
                >
                  {reportExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {reportExpanded ? "Hide" : "Show"} full report
                </button>

                {reportExpanded && (
                  <div className="space-y-2">
                    {asArray(agentReport.key_positive_signals).length > 0 && (
                      <div>
                        <p className="text-white/25 font-body text-[10px] uppercase tracking-widest mb-1">Positive signals</p>
                        {asArray(agentReport.key_positive_signals).map((s, i) => (
                          <p key={i} className="text-emerald-400/70 font-body text-xs flex gap-1.5">
                            <span className="shrink-0">+</span>{s}
                          </p>
                        ))}
                      </div>
                    )}
                    {asArray(agentReport.key_negative_signals).length > 0 && (
                      <div>
                        <p className="text-white/25 font-body text-[10px] uppercase tracking-widest mb-1 mt-2">Concerns</p>
                        {asArray(agentReport.key_negative_signals).map((s, i) => (
                          <p key={i} className="text-red-400/70 font-body text-xs flex gap-1.5">
                            <span className="shrink-0">−</span>{s}
                          </p>
                        ))}
                      </div>
                    )}
                    {/* OSINT section */}
                    {osintSection}

                    {txHash ? (
                      <p className="text-white/20 font-mono text-[10px] break-all mt-2">TX: {txHash}</p>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ORACLE: Score submission panel */}
        {isOracle && m.state === MilestoneState.Pending && !m.agentScoreSubmitted && (
          <div className="mb-4 liquid-glass rounded-2xl p-4 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300 font-body font-medium text-sm">Oracle — Submit AI Score</span>
              <span className="ml-auto text-white/25 font-body text-[10px] uppercase tracking-widest">Oracle Only</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-body text-xs">Verification score</span>
              <span className="text-white font-body font-medium text-sm tabular-nums">{oracleScore}/100</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={oracleScore}
              onChange={(e) => setOracleScore(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
            <div className="flex justify-between text-[10px] font-body text-white/20">
              <span>Fraudulent / Unverified</span>
              <span>Fully Verified</span>
            </div>
            <button
              disabled={busy}
              onClick={() => run("Score submitted", () => submitAgentScore(campaign.address, m.index, oracleScore * 100))}
              className="w-full flex items-center justify-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full py-2.5 text-blue-300 font-body font-medium text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              Write Score On-Chain
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* FOUNDER: Start voting */}
          {isFounder && m.state === MilestoneState.Pending && isCurrentMilestone && campaign.campaignState === CampaignState.Funded && (
            m.agentScoreSubmitted ? (
              <button disabled={busy} onClick={() => run("Voting started", () => startMilestoneVote(campaign.address))}
                className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
                Start Milestone Vote
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/8 text-white/25">
                <Bot className="w-4 h-4 shrink-0" />
                <span className="font-body text-xs">Waiting for oracle score before voting can start</span>
              </div>
            )
          )}

          {/* FOUNDER: Release funds */}
          {isFounder && m.state === MilestoneState.Passed && !m.fundsReleased && (
            <button disabled={busy} onClick={() => run("Funds released", () => releaseMilestone(campaign.address, m.index))}
              className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2.5 font-body font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              Release {fmtEth(m.ethAllocation)} ETH
            </button>
          )}

          {/* INVESTOR: Commit */}
          {!isFounder && wallet && m.state === MilestoneState.VotingOpen && !m.hasCommitted && now < m.commitDeadline && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/40 font-body text-xs">Probability milestone was achieved</span>
                <span className="text-white font-body font-medium text-sm">{probability}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={probability}
                onChange={(e) => setProbability(Number(e.target.value))} className="w-full accent-white" />
              <p className="text-white/25 font-body text-[10px] leading-relaxed">
                Your vote is hidden until reveal phase. A hash of your probability + random salt is committed on-chain.
              </p>
              <button disabled={busy}
                onClick={() => run("Vote committed", () =>
                  commitVote(campaign.address, m.index, probability * 100).then((r) => {
                    toast.info("Save your commitment", `${r.probability / 100}% stored locally for reveal.`);
                    return "";
                  })
                )}
                className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Commit Vote (Hidden)
              </button>
            </div>
          )}

          {/* INVESTOR: Committed, waiting for commit deadline */}
          {!isFounder && wallet && m.hasCommitted && !m.hasRevealed && m.state === MilestoneState.VotingOpen && now < m.commitDeadline && (
            <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-amber-500/20">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-amber-300 font-body font-medium text-sm">Vote committed</p>
                <p className="text-white/35 font-body text-xs">Reveal after {timeLeft(m.commitDeadline, now)}</p>
              </div>
              {savedCommit && <span className="ml-auto text-white/25 font-body text-xs">{savedCommit.probability / 100}%</span>}
            </div>
          )}

          {/* INVESTOR: Reveal — shown when commit deadline passed (state VotingOpen or RevealOpen) */}
          {!isFounder && wallet && m.hasCommitted && !m.hasRevealed &&
            (m.state === MilestoneState.RevealOpen || (m.state === MilestoneState.VotingOpen && now >= m.commitDeadline)) && (
            <div className="space-y-2">
              {savedCommit ? (
                <>
                  <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-blue-500/20">
                    <Unlock className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-blue-300 font-body font-medium text-sm">Ready to reveal</p>
                      <p className="text-white/35 font-body text-xs">Committed: {savedCommit.probability / 100}%</p>
                    </div>
                  </div>
                  <button disabled={busy} onClick={() => run("Vote revealed", () => revealVote(campaign.address, m.index))}
                    className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    Reveal Vote
                  </button>
                </>
              ) : (
                <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-2 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-300 font-body text-sm">Commitment not found — must use same browser as when you committed.</p>
                </div>
              )}
            </div>
          )}

          {/* Anyone: Resolve */}
          {(m.state === MilestoneState.VotingOpen || m.state === MilestoneState.RevealOpen) && now > m.revealDeadline && (
            <button disabled={busy} onClick={() => run("Vote resolved", () => resolveVote(campaign.address, m.index))}
              className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Resolve Vote
            </button>
          )}

          {/* INVESTOR: Refund */}
          {!isFounder && wallet && (m.state === MilestoneState.Failed || m.state === MilestoneState.Inconclusive) && (
            <button disabled={busy} onClick={() => run("Refund claimed", () => claimRefund(campaign.address, m.index))}
              className="w-full flex items-center justify-center gap-2 liquid-glass rounded-full py-2.5 text-red-400 font-body font-medium text-sm border border-red-500/20 hover:bg-red-500/5 transition-colors disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Claim Refund
            </button>
          )}

          {/* Released */}
          {m.fundsReleased && (
            <div className="flex items-center gap-2 text-emerald-400/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-body text-xs">Funds released to founder</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
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
  // Chain time — updated from block.timestamp so evm_increaseTime is reflected
  const [chainNow, setChainNow] = useState<bigint>(BigInt(Math.floor(Date.now() / 1000)));

  const syncChainTime = useCallback(async () => {
    try { setChainNow(await getBlockTimestamp()); } catch { /* keep last value */ }
  }, []);

  const load = useCallback(async () => {
    if (!campaignAddress) return;
    try {
      const [c, ms] = await Promise.all([
        fetchCampaignDetails(campaignAddress, wallet ?? undefined),
        fetchMilestones(campaignAddress, wallet ?? undefined),
        syncChainTime(),
      ]);
      setCampaign(c);
      setMilestones(ms);
    } catch (err) {
      toast.error("Failed to load campaign", extractError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignAddress, wallet, toast, syncChainTime]);

  // Initial load + poll every 10s so timers stay live and phase transitions auto-detect
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => {
      syncChainTime();
    }, 10_000);
    return () => clearInterval(id);
  }, [syncChainTime]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const handleInvest = async () => {
    if (!wallet || !campaign) return;
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || amt <= 0) { toast.warning("Invalid amount", "Enter a positive ETH amount."); return; }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20 relative">
      <PageBackground />
      <Loader2 className="w-6 h-6 text-white/25 animate-spin relative z-10" />
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4 relative">
      <PageBackground />
      <AlertCircle className="w-8 h-8 text-white/25 relative z-10" />
      <p className="text-white/35 font-body relative z-10">Campaign not found</p>
      <Link to="/explore" className="text-white/50 font-body text-sm hover:text-white transition-colors relative z-10">← Browse campaigns</Link>
    </div>
  );

  const isFounder = wallet?.toLowerCase() === campaign.founder.toLowerCase();
  const isOracle = wallet?.toLowerCase() === campaign.oracle.toLowerCase();
  const progressPct = pct(campaign.totalRaised, campaign.goal);
  const isActive = campaign.campaignState === CampaignState.Active;
  const campStyle = CAMPAIGN_STATE_STYLE[campaign.campaignState] ?? CAMPAIGN_STATE_STYLE[0];

  return (
    <div className="min-h-screen relative overflow-hidden pt-28 pb-24 px-6">
      <PageBackground />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/explore" className="flex items-center gap-2 text-white/35 hover:text-white/65 font-body text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} disabled={refreshing} className="text-white/25 hover:text-white/55 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <a href={`https://dashboard.tenderly.co/contract/${campaignAddress}`} target="_blank" rel="noopener noreferrer"
              className="text-white/25 hover:text-white/55 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Campaign hero header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-body font-medium uppercase tracking-widest px-3 py-1 rounded-full border ${campStyle.text} ${campStyle.bg} ${campStyle.border}`}>
              {campaignStateLabel(campaign.campaignState)}
            </span>
            {isFounder && (
              <span className="text-xs font-body uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 text-white/40">
                Your Campaign
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading italic text-white tracking-tight leading-[0.85] mb-4">
            {campaign.title}
          </h1>
          <p className="text-white/50 font-body font-light text-sm leading-relaxed max-w-2xl">
            {campaign.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Funding progress */}
            <div className="liquid-glass rounded-2xl p-5 border border-white/[0.05]">
              <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-3">Funding Progress</p>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-white font-heading italic text-3xl leading-none">{fmtEth(campaign.totalRaised)}</p>
                  <p className="text-white/35 font-body text-xs mt-1">ETH raised</p>
                </div>
                <div className="text-right">
                  <p className="text-white/55 font-body font-medium text-sm">{fmtEth(campaign.goal)} ETH</p>
                  <p className="text-white/25 font-body text-xs">goal</p>
                </div>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-emerald-400" : "bg-white/60"}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-body text-white/25">
                <span>{progressPct}% funded</span>
                <span>{timeLeft(campaign.deadline, chainNow)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { Icon: Users, label: "Investors", value: campaign.investorCount.toString() },
                { Icon: TrendingUp, label: "Milestones", value: campaign.milestoneCount.toString() },
                { Icon: Shield, label: "Stake", value: `${fmtEth(campaign.founderStake, 2)} ETH` },
                { Icon: Clock, label: "Deadline", value: new Date(Number(campaign.deadline) * 1000).toLocaleDateString() },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="liquid-glass rounded-xl px-3 py-3 border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3 h-3 text-white/25" />
                    <span className="text-white/25 font-body text-[10px] uppercase tracking-widest">{label}</span>
                  </div>
                  <p className="text-white font-body font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Token position */}
            {campaign.tokenName && campaign.tokenBalance !== undefined && (
              <div className="liquid-glass rounded-xl p-4 border border-white/[0.04]">
                <p className="text-white/30 font-body text-[10px] uppercase tracking-widest mb-3">Your Position</p>
                <p className="text-white font-heading italic text-2xl leading-none">{fmtEth(campaign.tokenBalance, 2)}</p>
                <p className="text-white/35 font-body text-xs mt-1">{campaign.tokenSymbol} tokens</p>
                {campaign.reputationScore !== undefined && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-white/25 font-body text-xs">Reputation</span>
                    <span className="text-white/50 font-body text-xs">{(Number(campaign.reputationScore) / 100).toFixed(0)} / 100</span>
                  </div>
                )}
              </div>
            )}

            {/* Invest form */}
            {isActive && !isFounder && (
              <div className="liquid-glass rounded-2xl p-5 border border-white/[0.05]">
                <p className="text-white font-body font-medium text-sm mb-3">
                  Invest in this Campaign
                </p>
                <div className="flex gap-2">
                  <input
                    type="number" value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="ETH amount"
                    className="flex-1 liquid-glass rounded-xl px-3 py-2.5 text-sm font-body text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-white/15 bg-transparent border border-white/[0.04]"
                  />
                  <button
                    disabled={investing || !wallet || !investAmount}
                    onClick={handleInvest}
                    className="liquid-glass-strong rounded-xl px-4 py-2.5 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-35 flex items-center gap-1.5"
                  >
                    {investing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Invest
                  </button>
                </div>
                {!wallet && <p className="text-white/25 font-body text-xs mt-2">Connect wallet to invest</p>}
              </div>
            )}

            {/* Contract */}
            <div className="liquid-glass rounded-xl px-4 py-3 border border-white/[0.04]">
              <p className="text-white/25 font-body text-[10px] uppercase tracking-widest mb-1.5">Contract</p>
              <p className="text-white/40 font-mono text-xs break-all leading-relaxed">{campaign.address}</p>
            </div>
          </div>

          {/* ── Milestones ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading italic text-white leading-tight mb-2">
              Milestones
            </h2>
            {milestones.map((m) => (
              <MilestoneCard key={m.index} m={m} campaign={campaign} wallet={wallet} isFounder={isFounder} isOracle={isOracle} onAction={load} chainNow={chainNow} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
