import { motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Bot, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";

const PARTNERS = ["Ethereum", "Anthropic", "OpenZeppelin", "Tenderly"];

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)",
        }}
      />

      {/* Main violet orb */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.6, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", width: 680, height: 680,
          top: "-18%", left: "50%", transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(109,40,217,0.55) 0%, rgba(109,40,217,0) 70%)",
          filter: "blur(50px)", borderRadius: "50%",
        }}
      />

      {/* Left blue orb */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute", width: 480, height: 480,
          top: "18%", left: "-12%",
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          filter: "blur(70px)", borderRadius: "50%",
        }}
      />

      {/* Right teal orb */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute", width: 380, height: 380,
          top: "28%", right: "-6%",
          background: "radial-gradient(circle, rgba(20,184,166,0.35) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
        }}
      />

      {/* Floating dots */}
      {[
        { x: "18%", y: "22%", d: 0 }, { x: "78%", y: "18%", d: 1.5 },
        { x: "62%", y: "52%", d: 0.8 }, { x: "12%", y: "60%", d: 2.2 },
        { x: "88%", y: "58%", d: 3 },
      ].map((n, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.1, 0.45, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: n.d }}
          style={{ position: "absolute", width: 3, height: 3, left: n.x, top: n.y,
            background: "white", borderRadius: "50%" }}
        />
      ))}

      {/* Bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(to bottom, transparent, #080808)" }} />
    </div>
  );
}

// Floating product preview
function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-16 max-w-2xl px-4"
    >
      {/* Glow behind card */}
      <div className="absolute inset-x-16 -top-6 h-32 rounded-full blur-3xl"
        style={{ background: "rgba(109,40,217,0.2)" }} />

      <div className="relative rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: "rgba(12,12,14,0.92)", backdropFilter: "blur(20px)" }}>

        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-white/20 font-mono text-[11px]">launchvault.app · NeuralPay · Milestone 2</span>
          </div>
          <span className="text-[10px] font-body font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>

        <div className="p-5 grid grid-cols-3 gap-3">
          {/* Verification score */}
          <div className="col-span-1 rounded-xl border border-white/6 bg-white/2 p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3 h-3 text-violet-400" />
              <span className="text-white/30 font-body text-[10px] uppercase tracking-widest">AI Score</span>
            </div>
            <div className="text-3xl font-heading italic text-white">84</div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-violet-500 to-blue-400" />
            </div>
            <span className="text-emerald-400 text-[10px] font-body">Verified ✓</span>
          </div>

          {/* Funding */}
          <div className="col-span-1 rounded-xl border border-white/6 bg-white/2 p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              <span className="text-white/30 font-body text-[10px] uppercase tracking-widest">Funded</span>
            </div>
            <div className="text-3xl font-heading italic text-white">100%</div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
            </div>
            <span className="text-blue-400 text-[10px] font-body">1.0 ETH raised</span>
          </div>

          {/* Voting */}
          <div className="col-span-1 rounded-xl border border-amber-400/15 bg-amber-400/4 p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400/60 font-body text-[10px] uppercase tracking-widest">Vote</span>
            </div>
            <div className="text-3xl font-heading italic text-white">3d</div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-amber-400/50" />
            </div>
            <span className="text-amber-400/70 text-[10px] font-body">Commit phase</span>
          </div>

          {/* Activity feed */}
          <div className="col-span-3 rounded-xl border border-white/6 bg-white/2 p-3 space-y-2">
            {[
              { icon: CheckCircle2, color: "text-emerald-400", msg: "Agent score written on-chain", time: "2m ago" },
              { icon: Lock,         color: "text-amber-400",   msg: "Investor committed vote · 0x4f2a…",  time: "8m ago" },
              { icon: Bot,          color: "text-violet-400",  msg: "Document forensics completed · 91/100", time: "12m ago" },
            ].map(({ icon: Icon, color, msg, time }, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Icon className={`w-3 h-3 ${color} shrink-0`} />
                <span className="text-white/50 font-body text-[11px] flex-1 truncate">{msg}</span>
                <span className="text-white/18 font-body text-[10px] shrink-0">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "960px" }}>
      <AnimatedBackground />

      <div className="relative z-20 flex flex-col items-center text-center px-6 pt-44">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 mb-8 rounded-full border border-white/10 bg-white/4 px-4 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-white/55 text-[12px] font-body">
            AI-Verified Milestone Funding · Live on Testnet
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-[-2px] mb-6">
          <BlurText text="Fund the Future." delay={80} direction="bottom" />
          <br />
          <BlurText text="Trust the Code." delay={80} direction="bottom" />
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(8px)", opacity: 0, y: 16 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[14px] md:text-[15px] text-white/45 font-body font-light leading-relaxed max-w-md mb-10"
        >
          Founders stake collateral, hit milestones, and raise from investors who vote
          with skin in the game. AI verifies everything on-chain. Capital only moves when truth is proven.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ filter: "blur(8px)", opacity: 0, y: 16 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <Link to="/create">
            <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium text-[14px] hover:opacity-90 transition-opacity">
              Launch a Campaign
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <Link to="/explore">
            <button className="bg-white text-black rounded-full px-6 py-3 font-body font-medium text-[14px] hover:bg-white/90 transition-colors">
              Explore Projects
            </button>
          </Link>
        </motion.div>

        {/* Product preview */}
        <ProductPreview />

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-20 flex flex-col items-center gap-5"
        >
          <span className="text-white/18 text-[10px] font-body uppercase tracking-[0.25em]">Built with</span>
          <div className="flex items-center gap-10 md:gap-14 flex-wrap justify-center">
            {PARTNERS.map((p) => (
              <span key={p} className="text-lg md:text-xl font-heading italic text-white/20 hover:text-white/50 transition-colors">
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
