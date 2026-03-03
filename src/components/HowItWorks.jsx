import { Wallet, Lock, Vote, Banknote } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Founder Creates Campaign",
    description: "Set your funding goal in ETH, define a deadline, and describe your milestone. Your campaign goes live instantly.",
    color: "emerald",
    align: "left",
  },
  {
    icon: Lock,
    step: "02",
    title: "Investors Fund & Lock",
    description: "Investors send ETH and receive governance tokens proportional to their contribution. All funds are locked in a smart contract.",
    color: "blue",
    align: "right",
  },
  {
    icon: Vote,
    step: "03",
    title: "Milestone Vote",
    description: "Founder requests fund release. Token holders vote to approve or reject. Simple majority decides the outcome.",
    color: "violet",
    align: "left",
  },
  {
    icon: Banknote,
    step: "04",
    title: "Funds Released",
    description: "If vote passes, funds are automatically transferred to the founder. No middlemen, no delays, no trust required.",
    color: "amber",
    align: "right",
  },
];

const colorMap = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    glow: "bg-emerald-500/20",
    step: "text-emerald-500/20",
    arrow: "#10b981",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    glow: "bg-blue-500/20",
    step: "text-blue-500/20",
    arrow: "#3b82f6",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    icon: "text-violet-400",
    glow: "bg-violet-500/20",
    step: "text-violet-500/20",
    arrow: "#8b5cf6",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    glow: "bg-amber-500/20",
    step: "text-amber-500/20",
    arrow: "#f59e0b",
  },
};

// SVG arrows between steps
// Each arrow goes from current step position to next step position
// left -> right = curves down-right
// right -> left = curves down-left
function ArrowConnector({ fromAlign, color }) {
  const isLeftToRight = fromAlign === "left";

  return (
    <div className="relative h-24 w-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 80"
        className="w-full max-w-lg h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isLeftToRight ? (
          // Left to right: starts left-center, curves to right-center
          <>
            <path
              d="M 60 10 C 60 50, 340 30, 340 70"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />
            {/* Arrowhead at end */}
            <polygon
              points="334,62 346,74 322,74"
              fill={color}
              opacity="0.6"
            />
          </>
        ) : (
          // Right to left: starts right-center, curves to left-center
          <>
            <path
              d="M 340 10 C 340 50, 60 30, 60 70"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />
            {/* Arrowhead at end */}
            <polygon
              points="54,62 66,74 42,74"
              fill={color}
              opacity="0.6"
            />
          </>
        )}
      </svg>
    </div>
  );
}

function StepCard({ step, index }) {
  const c = colorMap[step.color];
  const Icon = step.icon;
  const isLeft = step.align === "left";

  return (
    <div className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
      <div className="w-full max-w-sm group">
        {/* Card */}
        <div className={`glass-card rounded-3xl p-7 relative overflow-hidden border ${c.border} hover:scale-105 transition-all duration-300`}>
          {/* Big step number background */}
          <div className={`absolute -top-2 -right-2 text-8xl font-black pointer-events-none select-none leading-none ${c.step}`}>
            {step.step}
          </div>

          {/* Glow blob */}
          <div className={`absolute -bottom-6 -left-6 w-32 h-32 ${c.glow} rounded-full blur-3xl opacity-30 pointer-events-none`} />

          <div className="relative z-10 flex items-start gap-5">
            {/* Icon */}
            <div className={`shrink-0 ${c.bg} border ${c.border} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${c.icon}`} />
            </div>

            {/* Text */}
            <div>
              <h3 className="text-white font-black text-lg mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
          How It Works
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
          From Idea to Funded,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            On-Chain
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
          LaunchVault replaces trust with code. Every step of the funding
          process is transparent, verifiable, and automatic.
        </p>
      </div>

      {/* Zigzag Steps */}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={i}>
            <StepCard step={step} index={i} />
            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <ArrowConnector
                fromAlign={step.align}
                color={colorMap[steps[i + 1].color].arrow}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}