import { ArrowUpRight, Bot, Lock, CheckCircle2, GitBranch, FileText, Brain, Hash } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";

// ── AI Verification Mockup ────────────────────────────────────────────────────

function AIVerificationMockup() {
  const sources = [
    { label: "Document forensics", icon: FileText, score: 83, color: "bg-indigo-400" },
    { label: "GitHub activity", icon: GitBranch, score: 91, color: "bg-violet-400" },
    { label: "LLM cross-reference", icon: Brain, score: 79, color: "bg-blue-400" },
  ];

  return (
    <div className="liquid-glass rounded-2xl overflow-hidden w-full max-w-lg">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="ml-3 text-white/30 font-mono text-[11px]">verification_report.json</span>
        <span className="ml-auto text-[10px] font-body font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
          Verified
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Campaign info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-1">Campaign</p>
            <p className="text-white font-body font-medium text-sm">GreenGrid · Milestone 1</p>
            <p className="text-white/30 font-mono text-xs mt-0.5">Prototype completion</p>
          </div>
          <Bot className="w-5 h-5 text-white/20 mt-1" />
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          {sources.map(({ label, icon: Icon, score, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-white/30" />
                  <span className="text-white/50 font-body text-xs">{label}</span>
                </div>
                <span className="text-white font-body font-medium text-xs">{score}/100</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className={`h-full ${color} opacity-70 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate score */}
        <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="text-emerald-400 font-body font-medium text-sm">Aggregate Score: 84/100</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Hash className="w-2.5 h-2.5 text-white/20" />
              <span className="text-white/25 font-mono text-[10px]">0x4f2a8c…d891 · Immutable</span>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400/60 shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ── Commit-Reveal Voting Mockup ───────────────────────────────────────────────

function VotingMockup() {
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <p className="text-white font-body font-medium text-sm">Milestone 2 · Vote Active</p>
          <p className="text-amber-400 font-body text-xs mt-0.5">3d 14h left in commit phase</p>
        </div>
        <span className="text-[10px] font-body font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
          Commit Phase
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Participation bar */}
        <div>
          <div className="flex justify-between text-xs font-body text-white/40 mb-1.5">
            <span>Participation</span>
            <span className="text-white/60">847 / 1,203 token holders</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "70%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="h-full bg-amber-400/60 rounded-full"
            />
          </div>
        </div>

        {/* Probability slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-body">
            <span className="text-white/40">Probability estimate</span>
            <span className="text-white font-medium">75%</span>
          </div>
          <div className="relative h-1.5 bg-white/10 rounded-full">
            <div className="absolute h-full bg-white/50 rounded-full" style={{ width: "75%" }} />
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ left: "75%", transform: "translateX(-50%) translateY(-50%)" }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-body text-white/20">
            <span>0% — failed</span>
            <span>100% — passed</span>
          </div>
        </div>

        {/* Commit button preview */}
        <div className="liquid-glass-strong rounded-full py-2.5 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white font-body font-medium text-sm">Commit Vote (Hidden)</span>
        </div>

        {/* Hash preview */}
        <div className="flex items-center gap-2 px-3 py-2 liquid-glass rounded-lg">
          <Lock className="w-2.5 h-2.5 text-white/20 shrink-0" />
          <span className="text-white/20 font-mono text-[10px]">0x7f3a4b…c891 — hidden until reveal phase</span>
        </div>

        {/* Brier score hint */}
        <div className="flex items-center justify-between text-xs font-body">
          <span className="text-white/30">Honest reporting earns</span>
          <span className="text-emerald-400 font-medium">+Brier score reputation</span>
        </div>
      </div>
    </div>
  );
}

// ── Feature Row ───────────────────────────────────────────────────────────────

function FeatureRow({
  reverse,
  title,
  body,
  cta,
  ctaTo,
  visual,
}: {
  reverse?: boolean;
  title: string;
  body: string;
  cta: string;
  ctaTo: string;
  visual: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Text side */}
      <div className="flex-1 flex flex-col items-start gap-6">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading italic text-white leading-[0.95] tracking-tight">
          <BlurText text={title} delay={60} />
        </h3>
        <p className="text-white/50 font-body font-light text-sm md:text-base leading-relaxed max-w-md">
          {body}
        </p>
        <Link to={ctaTo}>
          <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
            {cta}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Visual side */}
      <div className="flex-1 w-full flex justify-center">
        {visual}
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function FeaturesChess() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-3.5 py-1 mb-6"
        >
          <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
            How it works
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-2xl">
          <BlurText text="Proof before payment." delay={70} />
        </h2>
      </div>

      {/* Alternating rows */}
      <div className="flex flex-col gap-28 max-w-6xl mx-auto">
        <FeatureRow
          title="AI that audits, not assumes."
          body="Document forensics, GitHub diff analysis, and LLM cross-referencing synthesize into a tamper-resistant verification score — signed and written to the blockchain before a single vote is cast."
          cta="Explore campaigns"
          ctaTo="/explore"
          visual={<AIVerificationMockup />}
        />
        <FeatureRow
          reverse
          title="Votes that can't be gamed."
          body="Commit-reveal mechanics and Brier scoring make truthful reporting the economically dominant strategy. Manipulation isn't just hard — it's irrational by design."
          cta="Launch a campaign"
          ctaTo="/create"
          visual={<VotingMockup />}
        />
      </div>
    </section>
  );
}
