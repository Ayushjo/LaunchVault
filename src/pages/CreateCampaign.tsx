import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  FileText,
  Target,
  Shield,
  Eye,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createCampaign } from "../hooks/useCampaign";

interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
}
interface FormState {
  title: string;
  description: string;
  category: string;
  goal: string;
  deadline: string;
  milestoneDescription: string;
  tokenSymbol: string;
}
interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  goal?: string;
  deadline?: string;
  milestoneDescription?: string;
  tokenSymbol?: string;
}
interface StepIndicatorProps {
  current: number;
}
interface InputFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}
interface ReviewRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}

const categories: string[] = [
  "CleanTech",
  "HealthTech",
  "EdTech",
  "Logistics",
  "Web3",
  "GovTech",
  "FinTech",
  "Other",
];

const steps: Step[] = [
  { id: 1, label: "Basics", icon: FileText },
  { id: 2, label: "Funding", icon: Target },
  { id: 3, label: "Milestone", icon: Shield },
  { id: 4, label: "Review", icon: Eye },
];

// ── Step Indicator — Vercel pipeline style ────────────────────────────────────
function StepIndicator({ current }: StepIndicatorProps): JSX.Element {
  return (
    <div className="flex items-center justify-center mb-10 sm:mb-12 px-2">
      {steps.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              {/* Node */}
              <div className="relative flex items-center justify-center w-6 h-6">
                {done ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2
                      className="w-3 h-3 text-white"
                      strokeWidth={3}
                    />
                  </div>
                ) : active ? (
                  <>
                    <div className="absolute w-6 h-6 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/25" />
                  </>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-zinc-700" />
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.15em] hidden sm:block ${
                  active
                    ? "text-emerald-400"
                    : done
                      ? "text-zinc-400"
                      : "text-zinc-700"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-[9px] font-bold sm:hidden ${
                  active
                    ? "text-emerald-400"
                    : done
                      ? "text-zinc-400"
                      : "text-zinc-700"
                }`}
              >
                {step.id}
              </span>
            </div>
            {/* Track segment */}
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-28 h-[2px] mx-2 mb-4 sm:mb-5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: current > step.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function InputField({
  label,
  hint,
  error,
  children,
}: InputFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-zinc-700 font-mono">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-[11px]">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

// ── Review Row ────────────────────────────────────────────────────────────────
function ReviewRow({
  label,
  value,
  highlight = false,
  mono = false,
}: ReviewRowProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-dashed border-white/[0.06] last:border-0">
      <span className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-right break-words max-w-[60%] font-bold ${
          mono ? "font-mono" : ""
        } ${highlight ? "text-emerald-400" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Shared input className builders ──────────────────────────────────────────
const inputBase =
  "w-full bg-white/[0.03] border border-transparent text-white placeholder-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-200 text-sm";
const inputError =
  "border-red-500/30 focus:border-red-500/50 focus:ring-red-500/20 focus:shadow-none";

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateCampaign(): JSX.Element {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    goal: "",
    deadline: "",
    milestoneDescription: "",
    tokenSymbol: "",
  });

  const set = (key: keyof FormState, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateStep = (): boolean => {
    const errs: FormErrors = {};
    if (step === 1) {
      if (!form.title.trim()) errs.title = "Title is required";
      else if (form.title.length < 5) errs.title = "At least 5 characters";
      if (!form.description.trim())
        errs.description = "Description is required";
      else if (form.description.length < 20)
        errs.description = "At least 20 characters";
      if (!form.category) errs.category = "Please select a category";
    }
    if (step === 2) {
      if (!form.goal || parseFloat(form.goal) <= 0)
        errs.goal = "Enter a valid goal amount";
      if (!form.deadline) errs.deadline = "Deadline is required";
      else if (new Date(form.deadline) <= new Date())
        errs.deadline = "Must be in the future";
    }
    if (step === 3) {
      if (!form.milestoneDescription.trim())
        errs.milestoneDescription = "Description is required";
      if (!form.tokenSymbol.trim())
        errs.tokenSymbol = "Token symbol is required";
      else if (form.tokenSymbol.length > 5)
        errs.tokenSymbol = "Max 5 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      setDeploying(true);
      setDeployError(null);
      const address = await createCampaign({
        title: form.title,
        description: form.description,
        milestoneDescription: form.milestoneDescription,
        goal: form.goal,
        deadline: form.deadline,
        tokenSymbol: form.tokenSymbol,
      });
      setDeployedAddress(address);
      setSubmitted(true);
    } catch (err: any) {
      if (err.message.includes("user rejected"))
        setDeployError("Transaction rejected.");
      else setDeployError(err.message.slice(0, 120));
    } finally {
      setDeploying(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  // ── Success State ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]" />
        </div>
        <div className="relative z-10 text-center max-w-md w-full">
          {/* Shield / glow */}
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 ring-8 ring-emerald-500/[0.08] flex items-center justify-center">
              <CheckCircle2
                className="w-12 h-12 text-emerald-400"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 text-emerald-500 text-[10px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Contract Deployed
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-3">
            Campaign Live.
          </h2>
          <p className="text-zinc-500 leading-relaxed mb-6 text-sm">
            <span className="text-white font-semibold">"{form.title}"</span> has
            been deployed to the chain.
          </p>

          {deployedAddress && (
            <div className="bg-black border border-white/[0.08] rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                Contract Address
              </p>
              <p className="text-emerald-400 font-mono text-xs break-all leading-relaxed">
                {deployedAddress}
              </p>
              <a
                href={`https://dashboard.tenderly.co/contract/${deployedAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors mt-1"
              >
                View on Tenderly <ArrowRight className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm shadow-[0_0_16px_rgba(16,185,129,0.1)] hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Explore Campaigns
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm({
                  title: "",
                  description: "",
                  category: "",
                  goal: "",
                  deadline: "",
                  milestoneDescription: "",
                  tokenSymbol: "",
                });
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-zinc-300 font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 pb-24 relative overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
        {/* Page header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-zinc-500 text-[10px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-[0.15em]">
            <Zap className="w-3 h-3 text-emerald-500" /> New Campaign
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
            Launch Your Project
          </h1>
          <p className="text-zinc-500 text-sm">
            Fill in the details below to deploy your funding campaign on-chain.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Form Card */}
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03)] p-6 sm:p-8">
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight mb-1">
                  Basic Information
                </h2>
                <p className="text-zinc-600 text-xs">
                  Tell investors what your project is about.
                </p>
              </div>

              <InputField label="Campaign Title" error={errors.title}>
                <input
                  type="text"
                  placeholder="e.g. EcoTrace — Carbon Footprint Tracker"
                  value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("title", e.target.value)
                  }
                  className={`${inputBase} ${errors.title ? inputError : ""}`}
                />
              </InputField>

              <InputField
                label="Description"
                hint={`${form.description.length}/500`}
                error={errors.description}
              >
                <textarea
                  placeholder="Describe your project, what problem it solves, and why investors should back it..."
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    set("description", e.target.value.slice(0, 500))
                  }
                  rows={4}
                  className={`${inputBase} resize-none ${errors.description ? inputError : ""}`}
                />
              </InputField>

              <InputField label="Category" error={errors.category}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat: string) => (
                    <button
                      key={cat}
                      onClick={() => set("category", cat)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-150 ${
                        form.category === cat
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                          : "bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <div className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />{" "}
                    {errors.category}
                  </div>
                )}
              </InputField>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight mb-1">
                  Funding Details
                </h2>
                <p className="text-zinc-600 text-xs">
                  Set your goal and campaign deadline.
                </p>
              </div>

              <InputField label="Funding Goal (ETH)" error={errors.goal}>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={form.goal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      set("goal", e.target.value)
                    }
                    className={`${inputBase} pr-14 font-mono ${errors.goal ? inputError : ""}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono font-bold text-xs">
                    ETH
                  </span>
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {["1", "5", "10", "50", "100"].map((v: string) => (
                    <button
                      key={v}
                      onClick={() => set("goal", v)}
                      className={`shrink-0 flex-1 min-w-[44px] text-xs font-mono font-bold py-1.5 rounded-lg border transition-all ${
                        form.goal === v
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/[0.02] border-white/[0.05] text-zinc-600 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </InputField>

              <InputField label="Campaign Deadline" error={errors.deadline}>
                <input
                  type="date"
                  min={minDateStr}
                  value={form.deadline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set("deadline", e.target.value)
                  }
                  className={`${inputBase} font-mono ${errors.deadline ? inputError : ""}`}
                />
              </InputField>

              {form.goal && (
                <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                    Token Preview
                  </p>
                  {[
                    {
                      label: "Total supply",
                      value: "10,000 tokens",
                      em: false,
                    },
                    {
                      label: "Price per token",
                      value: `${(parseFloat(form.goal) / 10000).toFixed(4)} ETH`,
                      em: false,
                    },
                    {
                      label: "1 ETH investment →",
                      value: `${Math.floor(10000 / parseFloat(form.goal))} tokens`,
                      em: true,
                    },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-zinc-600 text-xs">{row.label}</span>
                      <span
                        className={`font-mono text-xs font-bold ${row.em ? "text-emerald-400" : "text-white"}`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight mb-1">
                  Milestone & Token
                </h2>
                <p className="text-zinc-600 text-xs">
                  Define what investors are voting to approve.
                </p>
              </div>

              <div className="bg-black/40 border border-amber-500/[0.15] rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Investors will vote on this milestone before funds are
                  released. Make it specific and verifiable.
                </p>
              </div>

              <InputField
                label="Milestone Description"
                hint={`${form.milestoneDescription.length}/300`}
                error={errors.milestoneDescription}
              >
                <textarea
                  placeholder="e.g. Launch MVP with 500 active users and complete a third-party security audit..."
                  value={form.milestoneDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    set("milestoneDescription", e.target.value.slice(0, 300))
                  }
                  rows={4}
                  className={`${inputBase} resize-none ${errors.milestoneDescription ? inputError : ""}`}
                />
              </InputField>

              <InputField
                label="Token Symbol"
                hint="Max 5 characters"
                error={errors.tokenSymbol}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. ECOT"
                    value={form.tokenSymbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      set(
                        "tokenSymbol",
                        e.target.value.toUpperCase().slice(0, 5),
                      )
                    }
                    className={`${inputBase} font-mono ${errors.tokenSymbol ? inputError : ""}`}
                  />
                  {form.tokenSymbol && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-1 rounded-lg">
                      <Zap className="w-2.5 h-2.5" /> {form.tokenSymbol}
                    </div>
                  )}
                </div>
              </InputField>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-black text-white tracking-tight mb-1">
                  Review & Launch
                </h2>
                <p className="text-zinc-600 text-xs">
                  Double-check everything before deploying to chain.
                </p>
              </div>

              <div className="space-y-3">
                {/* Campaign info block */}
                {[
                  {
                    title: "Campaign Info",
                    rows: [
                      {
                        label: "Title",
                        value: form.title,
                        highlight: false,
                        mono: false,
                      },
                      {
                        label: "Category",
                        value: form.category,
                        highlight: false,
                        mono: false,
                      },
                      {
                        label: "Description",
                        value:
                          form.description.slice(0, 60) +
                          (form.description.length > 60 ? "…" : ""),
                        highlight: false,
                        mono: false,
                      },
                    ],
                  },
                  {
                    title: "Funding",
                    rows: [
                      {
                        label: "Goal",
                        value: `${form.goal} ETH`,
                        highlight: true,
                        mono: true,
                      },
                      {
                        label: "Deadline",
                        value: new Date(form.deadline).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        ),
                        highlight: false,
                        mono: false,
                      },
                      {
                        label: "Supply",
                        value: "10,000 tokens",
                        highlight: false,
                        mono: true,
                      },
                      {
                        label: "Symbol",
                        value: form.tokenSymbol,
                        highlight: true,
                        mono: true,
                      },
                    ],
                  },
                  {
                    title: "Milestone",
                    rows: [
                      {
                        label: "Description",
                        value:
                          form.milestoneDescription.slice(0, 80) +
                          (form.milestoneDescription.length > 80 ? "…" : ""),
                        highlight: false,
                        mono: false,
                      },
                      {
                        label: "Release",
                        value: `${form.goal} ETH`,
                        highlight: true,
                        mono: true,
                      },
                      {
                        label: "Threshold",
                        value: ">50% votes",
                        highlight: false,
                        mono: true,
                      },
                    ],
                  },
                ].map(({ title, rows }) => (
                  <div
                    key={title}
                    className="bg-black/30 border border-white/[0.05] rounded-xl p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-3">
                      {title}
                    </p>
                    {rows.map((r) => (
                      <ReviewRow key={r.label} {...r} />
                    ))}
                  </div>
                ))}

                <div className="bg-black/40 border border-amber-500/[0.12] rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500/60 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    This deploys a smart contract to the LaunchVault testnet.
                    Funds are locked until investors approve your milestone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.04]">
            {step > 1 ? (
              <button
                onClick={back}
                className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold transition-colors text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400/80 text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm shadow-[0_0_16px_rgba(16,185,129,0.1)] hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]"
              >
                Continue <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {deployError && (
                  <p className="text-[11px] text-red-400 max-w-xs text-right">
                    {deployError}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={deploying}
                  className="flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm shadow-[0_0_16px_rgba(16,185,129,0.12)] hover:shadow-[0_0_28px_rgba(16,185,129,0.25)]"
                >
                  {deploying ? (
                    <>
                      {/* SVG spinner */}
                      <svg
                        className="w-3.5 h-3.5 animate-spin text-emerald-400"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-20"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-100"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v3a5 5 0 100 10v3a8 8 0 01-8-8z"
                        />
                      </svg>
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-emerald-400" /> Launch
                      Campaign
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-700 mt-4 sm:hidden">
          Step {step} of {steps.length}
        </p>
      </div>
    </div>
  );
}
