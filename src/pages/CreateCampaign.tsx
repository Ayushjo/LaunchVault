import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle,
  CheckCircle2, Loader2, Info,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import { createCampaign, extractError } from "../hooks/useCampaign";
import PageBackground from "../components/layout/PageBackground";
import { motion, AnimatePresence } from "motion/react";

interface MilestoneInput {
  description: string;
  bps: number;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  goal: string;
  deadline: string;
  tokenName: string;
  tokenSymbol: string;
  milestones: MilestoneInput[];
}

const CATEGORIES = [
  "CleanTech", "HealthTech", "EdTech", "Logistics",
  "Web3", "GovTech", "FinTech", "Other",
];

const STEPS = ["Basics", "Funding & Token", "Milestones", "Review"];

const DEFAULT_FORM: FormState = {
  title: "", description: "", category: "",
  goal: "", deadline: "", tokenName: "", tokenSymbol: "",
  milestones: [{ description: "", bps: 5000 }, { description: "", bps: 5000 }],
};

function totalBps(ms: MilestoneInput[]) {
  return ms.reduce((s, m) => s + m.bps, 0);
}

function requiredStake(goalEth: string): string {
  const g = parseFloat(goalEth);
  return !g || isNaN(g) ? "0" : (g * 0.1).toFixed(4);
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-medium transition-all duration-300 ${
              i < current ? "bg-white text-black" :
              i === current ? "liquid-glass-strong text-white ring-1 ring-white/30" :
              "liquid-glass text-white/25"
            }`}>
              {i < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] font-body uppercase tracking-widest whitespace-nowrap transition-colors ${
              i === current ? "text-white/70" : i < current ? "text-white/50" : "text-white/20"
            }`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-12 md:w-20 mx-2 mb-5 transition-all duration-500 ${i < current ? "bg-white/40" : "bg-white/8"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-white/70 font-body font-medium text-sm">{label}</span>
      {hint && (
        <div className="group relative">
          <Info className="w-3.5 h-3.5 text-white/25 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 liquid-glass rounded-xl px-3 py-2 text-xs font-body text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/8">
            {hint}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ value, onChange, placeholder, type = "text", error }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full liquid-glass rounded-xl px-4 py-3 text-sm font-body text-white placeholder-white/25 outline-none focus:ring-1 bg-transparent transition-all border border-white/[0.04] focus:border-white/10 ${
          error ? "ring-1 ring-red-500/50 border-red-500/30" : "focus:ring-white/15"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-red-400 text-xs font-body">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function TextareaField({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full liquid-glass rounded-xl px-4 py-3 text-sm font-body text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-white/15 bg-transparent resize-none border border-white/[0.04] focus:border-white/10 transition-all"
    />
  );
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setMs = (idx: number, key: keyof MilestoneInput, val: string | number) =>
    setForm((f) => {
      const ms = [...f.milestones];
      ms[idx] = { ...ms[idx], [key]: val };
      return { ...f, milestones: ms };
    });

  const addMilestone = () =>
    setForm((f) => ({ ...f, milestones: [...f.milestones, { description: "", bps: 0 }] }));

  const removeMilestone = (idx: number) =>
    setForm((f) => ({ ...f, milestones: f.milestones.filter((_, i) => i !== idx) }));

  const redistributeBps = () => {
    const n = form.milestones.length;
    if (!n) return;
    const even = Math.floor(10000 / n);
    const rem = 10000 - even * n;
    setForm((f) => ({
      ...f,
      milestones: f.milestones.map((m, i) => ({ ...m, bps: i === 0 ? even + rem : even })),
    }));
  };

  const canAdvance = (): boolean => {
    if (step === 0) return !!form.title.trim() && !!form.description.trim() && !!form.category;
    if (step === 1) {
      const g = parseFloat(form.goal);
      return !!form.goal && !isNaN(g) && g > 0 &&
        !!form.deadline && new Date(form.deadline) > new Date() &&
        !!form.tokenName.trim() && !!form.tokenSymbol.trim();
    }
    if (step === 2) {
      return form.milestones.length >= 1 &&
        form.milestones.every((m) => m.description.trim() && m.bps > 0) &&
        totalBps(form.milestones) === 10000;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!wallet) { toast.error("Wallet not connected"); return; }
    setSubmitting(true);
    try {
      toast.info("Launching campaign…", "Approve the transaction in your wallet.");
      const addr = await createCampaign({
        title: form.title, description: form.description,
        goal: form.goal, deadline: form.deadline,
        tokenName: form.tokenName, tokenSymbol: form.tokenSymbol,
        milestones: form.milestones,
      });
      toast.success("Campaign launched!", `${form.title} is live.`);
      navigate(`/campaign/${addr}`);
    } catch (err) {
      toast.error("Launch failed", extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const bpsTotal = totalBps(form.milestones);
  const bpsOk = bpsTotal === 10000;

  return (
    <div className="min-h-screen relative overflow-hidden pt-28 pb-24 px-6">
      <PageBackground />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
          className="flex items-center gap-2 text-white/35 hover:text-white/70 font-body text-sm mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 0 ? "Back" : "Home"}
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-heading italic text-white tracking-tight leading-[0.85] mb-3">
            Launch a Campaign
          </h1>
          <p className="text-white/40 font-body font-light text-sm">
            Milestone-based fundraising with AI verification and commit-reveal voting.
          </p>
        </motion.div>

        <StepIndicator current={step} />

        {/* ── Form card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-glass rounded-2xl p-6 md:p-8 border border-white/[0.06]"
          >
            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <FieldLabel label="Campaign Title" />
                  <Field value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. CleanAI — Carbon-Negative ML Platform" />
                </div>
                <div>
                  <FieldLabel label="Description" />
                  <TextareaField value={form.description} onChange={(v) => set("description", v)}
                    placeholder="Describe your project, the problem it solves, and why you're the team to build it." rows={5} />
                </div>
                <div>
                  <FieldLabel label="Category" />
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => set("category", cat)}
                        className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                          form.category === cat ? "bg-white text-black" : "liquid-glass text-white/50 hover:text-white border border-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Funding & Token */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Funding Goal (ETH)" hint="Total ETH you aim to raise from investors." />
                    <Field type="number" value={form.goal} onChange={(v) => set("goal", v)} placeholder="e.g. 10" />
                  </div>
                  <div>
                    <FieldLabel label="Investment Deadline" />
                    <Field type="date" value={form.deadline} onChange={(v) => set("deadline", v)} />
                  </div>
                </div>

                {form.goal && !isNaN(parseFloat(form.goal)) && (
                  <div className="liquid-glass rounded-xl px-4 py-4 flex items-start gap-3 border border-amber-500/20">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/80 font-body font-medium text-sm">Founder Stake Required</p>
                      <p className="text-white/45 font-body font-light text-xs mt-1 leading-relaxed">
                        You must stake <span className="text-white font-medium">{requiredStake(form.goal)} ETH</span> (10% of goal) as collateral. Slashed on rejection — returned on successful completion.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Token Name" hint="Name of the ERC-20 governance token. E.g. 'CleanAI Token'." />
                    <Field value={form.tokenName} onChange={(v) => set("tokenName", v)} placeholder="e.g. CleanAI Token" />
                  </div>
                  <div>
                    <FieldLabel label="Token Symbol" hint="3-8 uppercase letters. E.g. 'CLAI'." />
                    <Field value={form.tokenSymbol} onChange={(v) => set("tokenSymbol", v.toUpperCase().slice(0, 8))} placeholder="e.g. CLAI" />
                  </div>
                </div>
                <p className="text-white/25 font-body font-light text-xs leading-relaxed">
                  10,000 tokens are minted and distributed to investors proportional to their investment. Tokens carry voting rights on milestone approval.
                </p>
              </div>
            )}

            {/* Step 2: Milestones */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/45 font-body font-light text-sm">
                    Each milestone releases a portion of raised funds when approved.
                  </p>
                  <button onClick={redistributeBps} className="text-white/35 hover:text-white/65 font-body text-xs transition-colors">
                    Distribute evenly
                  </button>
                </div>

                {form.milestones.map((m, i) => (
                  <div key={i} className="liquid-glass rounded-xl p-4 space-y-3 border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 font-body text-xs uppercase tracking-widest">Milestone {i + 1}</span>
                      {form.milestones.length > 1 && (
                        <button onClick={() => removeMilestone(i)} className="text-white/20 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <TextareaField
                      value={m.description}
                      onChange={(v) => setMs(i, "description", v)}
                      placeholder="Describe the deliverable. AI agents will verify this claim using your GitHub repo and submitted documents."
                      rows={3}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={0} max={10000} step={100}
                        value={m.bps}
                        onChange={(e) => setMs(i, "bps", Number(e.target.value))}
                        className="flex-1 accent-white"
                      />
                      <div className="liquid-glass rounded-lg px-3 py-1.5 min-w-[56px] text-center border border-white/[0.06]">
                        <span className="text-white font-body font-medium text-sm">{(m.bps / 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {form.goal && !isNaN(parseFloat(form.goal)) && (
                      <p className="text-white/20 font-body text-xs">
                        ≈ {((parseFloat(form.goal) * m.bps) / 10000).toFixed(4)} ETH released on approval
                      </p>
                    )}
                  </div>
                ))}

                <button
                  onClick={addMilestone}
                  className="w-full liquid-glass rounded-xl py-3 flex items-center justify-center gap-2 text-white/35 hover:text-white/65 font-body text-sm transition-colors border border-white/[0.04] border-dashed"
                >
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>

                <div className={`flex items-center justify-between liquid-glass rounded-xl px-4 py-3 border ${bpsOk ? "border-emerald-500/30" : "border-amber-500/30"}`}>
                  <span className="text-white/55 font-body text-sm">Total allocation</span>
                  <span className={`font-body font-medium text-sm ${bpsOk ? "text-emerald-400" : "text-amber-400"}`}>
                    {(bpsTotal / 100).toFixed(0)}% / 100%{bpsOk ? " ✓" : " — must equal 100%"}
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-white/40 font-body font-light text-sm mb-5">Review everything before launching. This action is irreversible once confirmed.</p>
                {[
                  ["Title", form.title],
                  ["Category", form.category],
                  ["Goal", `${form.goal} ETH`],
                  ["Founder Stake", `${requiredStake(form.goal)} ETH (10%)`],
                  ["Deadline", form.deadline],
                  ["Token", `${form.tokenName} (${form.tokenSymbol})`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-start liquid-glass rounded-xl px-4 py-3 border border-white/[0.04]">
                    <span className="text-white/35 font-body font-light text-sm">{label}</span>
                    <span className="text-white font-body font-medium text-sm text-right max-w-[60%]">{value}</span>
                  </div>
                ))}

                <div className="liquid-glass rounded-xl px-4 py-4 border border-white/[0.04]">
                  <span className="text-white/35 font-body text-xs uppercase tracking-widest block mb-3">Milestones</span>
                  <div className="space-y-3">
                    {form.milestones.map((m, i) => (
                      <div key={i} className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-white/20 font-body text-xs mt-0.5 shrink-0">{i + 1}.</span>
                          <p className="text-white font-body text-sm leading-relaxed">{m.description}</p>
                        </div>
                        <span className="text-white/45 font-body text-sm shrink-0">{(m.bps / 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="liquid-glass rounded-xl px-4 py-4 border border-amber-500/20">
                  <p className="text-amber-300 font-body font-medium text-sm mb-1.5">Before you launch</p>
                  <p className="text-white/45 font-body font-light text-xs leading-relaxed">
                    This will deduct <strong className="text-white font-medium">{requiredStake(form.goal)} ETH</strong> from your wallet as founder collateral. The transaction is irreversible once confirmed in your wallet.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !wallet}
              className="flex items-center gap-2 bg-white text-black rounded-full px-6 py-3 font-body font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Launching…</> : "Launch Campaign"}
            </button>
          )}
          {!wallet && step === STEPS.length - 1 && (
            <p className="text-white/35 font-body text-xs">Connect your wallet to launch</p>
          )}
        </div>
      </div>
    </div>
  );
}
