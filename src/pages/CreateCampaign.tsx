import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Zap,
  FileText, Target, Shield, Eye, AlertCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
}

const categories: string[] = ["CleanTech", "HealthTech", "EdTech", "Logistics", "Web3", "GovTech", "FinTech", "Other"];

const steps: Step[] = [
  { id: 1, label: "Basics",    icon: FileText },
  { id: 2, label: "Funding",   icon: Target   },
  { id: 3, label: "Milestone", icon: Shield   },
  { id: 4, label: "Review",    icon: Eye      },
];

function StepIndicator({ current }: StepIndicatorProps): JSX.Element {
  return (
    <div className="flex items-center justify-center mb-8 sm:mb-12">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : active
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-slate-800/50 border-slate-700 text-slate-500"
              }`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  : <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                }
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block ${
                active ? "text-emerald-400" : done ? "text-slate-300" : "text-slate-600"
              }`}>
                {step.label}
              </span>
              <span className={`text-[10px] font-bold sm:hidden ${
                active ? "text-emerald-400" : done ? "text-slate-300" : "text-slate-600"
              }`}>
                {step.id}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-24 h-px mx-1.5 sm:mx-2 mb-4 sm:mb-5 transition-all duration-500 ${
                current > step.id ? "bg-emerald-500" : "bg-slate-700"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, hint, error, children }: InputFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-xs text-slate-600">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value, highlight = false }: ReviewRowProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-xs sm:text-sm shrink-0">{label}</span>
      <span className={`text-xs sm:text-sm font-bold text-right break-words max-w-[60%] ${
        highlight ? "text-emerald-400" : "text-white"
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function CreateCampaign(): JSX.Element {
  const navigate = useNavigate();
  const [step, setStep]           = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors]       = useState<FormErrors>({});

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
      if (!form.title.trim())                       errs.title = "Title is required";
      else if (form.title.length < 5)               errs.title = "At least 5 characters";
      if (!form.description.trim())                 errs.description = "Description is required";
      else if (form.description.length < 20)        errs.description = "At least 20 characters";
      if (!form.category)                           errs.category = "Please select a category";
    }
    if (step === 2) {
      if (!form.goal || parseFloat(form.goal) <= 0) errs.goal = "Enter a valid goal amount";
      if (!form.deadline)                           errs.deadline = "Deadline is required";
      else if (new Date(form.deadline) <= new Date()) errs.deadline = "Must be in the future";
    }
    if (step === 3) {
      if (!form.milestoneDescription.trim())        errs.milestoneDescription = "Description is required";
      if (!form.tokenSymbol.trim())                 errs.tokenSymbol = "Token symbol is required";
      else if (form.tokenSymbol.length > 5)         errs.tokenSymbol = "Max 5 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next  = () => { if (validateStep()) setStep((s) => s + 1); };
  const back  = () => setStep((s) => s - 1);
  const handleSubmit = () => setSubmitted(true);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md w-full">
          <div className="relative inline-flex mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Campaign Submitted!</h2>
          <p className="text-slate-400 leading-relaxed mb-2 text-sm sm:text-base px-4">
            <span className="text-emerald-400 font-bold">"{form.title}"</span> has been created.
          </p>
          <p className="text-slate-500 text-xs sm:text-sm mb-8 px-4">
            In production this would deploy your smart contract to Polygon and your campaign would go live immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              Explore Campaigns
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm({ title: "", description: "", category: "", goal: "", deadline: "", milestoneDescription: "", tokenSymbol: "" });
              }}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative z-10">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> New Campaign
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Launch Your Project</h1>
          <p className="text-slate-400 text-sm sm:text-base">Fill in the details below to create your funding campaign.</p>
        </div>

        <StepIndicator current={step} />

        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white mb-1">Basic Information</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Tell investors what your project is about.</p>
              </div>

              <InputField label="Campaign Title" error={errors.title}>
                <input
                  type="text"
                  placeholder="e.g. EcoTrace — Carbon Footprint Tracker"
                  value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("title", e.target.value)}
                  className={`w-full bg-slate-800/50 border text-white placeholder-slate-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm ${
                    errors.title
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                />
              </InputField>

              <InputField label="Description" hint={`${form.description.length}/500`} error={errors.description}>
                <textarea
                  placeholder="Describe your project, what problem it solves, and why investors should back it..."
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("description", e.target.value.slice(0, 500))}
                  rows={4}
                  className={`w-full bg-slate-800/50 border text-white placeholder-slate-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm resize-none ${
                    errors.description
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                />
              </InputField>

              <InputField label="Category" error={errors.category}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat: string) => (
                    <button
                      key={cat}
                      onClick={() => set("category", cat)}
                      className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-all ${
                        form.category === cat
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.category}
                  </div>
                )}
              </InputField>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white mb-1">Funding Details</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Set your goal and campaign deadline.</p>
              </div>

              <InputField label="Funding Goal (ETH)" error={errors.goal}>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={form.goal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("goal", e.target.value)}
                    className={`w-full bg-slate-800/50 border text-white placeholder-slate-600 px-3 sm:px-4 py-2.5 sm:py-3 pr-14 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm ${
                      errors.goal
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    }`}
                  />
                  <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">ETH</span>
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {["1", "5", "10", "50", "100"].map((v: string) => (
                    <button
                      key={v}
                      onClick={() => set("goal", v)}
                      className={`shrink-0 flex-1 min-w-[48px] text-xs font-bold py-1.5 rounded-lg border transition-all ${
                        form.goal === v
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("deadline", e.target.value)}
                  className={`w-full bg-slate-800/50 border text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm ${
                    errors.deadline
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                />
              </InputField>

              {form.goal && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Token Preview</h4>
                  {[
                    { label: "Total token supply",   value: "10,000 tokens",                                                             highlight: false },
                    { label: "Price per token",       value: `${(parseFloat(form.goal) / 10000).toFixed(4)} ETH`,                        highlight: false },
                    { label: "1 ETH investment gets", value: `${Math.floor(10000 / parseFloat(form.goal))} tokens`,                      highlight: true  },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400">{row.label}</span>
                      <span className={`font-bold ${row.highlight ? "text-emerald-400" : "text-white"}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white mb-1">Milestone & Token</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Define what investors are voting to approve.</p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Investors will vote on this milestone before funds are released. Make it specific and verifiable.
                </p>
              </div>

              <InputField label="Milestone Description" hint={`${form.milestoneDescription.length}/300`} error={errors.milestoneDescription}>
                <textarea
                  placeholder="e.g. Launch MVP with 500 active users and complete a third-party security audit..."
                  value={form.milestoneDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("milestoneDescription", e.target.value.slice(0, 300))}
                  rows={4}
                  className={`w-full bg-slate-800/50 border text-white placeholder-slate-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm resize-none ${
                    errors.milestoneDescription
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                />
              </InputField>

              <InputField label="Token Symbol" hint="Max 5 characters" error={errors.tokenSymbol}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. ECOT"
                    value={form.tokenSymbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("tokenSymbol", e.target.value.toUpperCase().slice(0, 5))}
                    className={`w-full bg-slate-800/50 border text-white placeholder-slate-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm font-mono ${
                      errors.tokenSymbol
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    }`}
                  />
                  {form.tokenSymbol && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                      <Zap className="w-3 h-3" /> {form.tokenSymbol}
                    </div>
                  )}
                </div>
              </InputField>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-black text-white mb-1">Review & Launch</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Double-check everything before deploying.</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3">Campaign Info</h3>
                  <ReviewRow label="Title"       value={form.title} />
                  <ReviewRow label="Category"    value={form.category} />
                  <ReviewRow label="Description" value={form.description.slice(0, 60) + (form.description.length > 60 ? "..." : "")} />
                </div>

                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3">Funding</h3>
                  <ReviewRow label="Goal"     value={`${form.goal} ETH`} highlight />
                  <ReviewRow label="Deadline" value={new Date(form.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} />
                  <ReviewRow label="Supply"   value="10,000 tokens" />
                  <ReviewRow label="Symbol"   value={form.tokenSymbol} highlight />
                </div>

                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3">Milestone</h3>
                  <ReviewRow label="Description" value={form.milestoneDescription.slice(0, 80) + (form.milestoneDescription.length > 80 ? "..." : "")} />
                  <ReviewRow label="Release"     value={`${form.goal} ETH`} highlight />
                  <ReviewRow label="Threshold"   value=">50% votes" />
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    In production, this deploys a smart contract to Polygon. Funds are locked until investors approve your milestone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/5">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button onClick={next} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40 text-sm">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40 text-sm">
                <Zap className="w-4 h-4" /> Launch Campaign
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4 sm:hidden">Step {step} of {steps.length}</p>
      </div>
    </div>
  );
}