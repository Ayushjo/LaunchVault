import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";

const partners = ["Ethereum", "OpenZeppelin", "Anthropic", "Hardhat", "Tenderly"];

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Base grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Orb 1 — large purple, top center */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 700,
          height: 700,
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(99,60,255,0.55) 0%, rgba(99,60,255,0) 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Orb 2 — blue, left */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: "20%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(56,130,255,0.4) 0%, rgba(56,130,255,0) 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Orb 3 — cyan, right */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: "30%",
          right: "-5%",
          background:
            "radial-gradient(circle, rgba(0,200,180,0.35) 0%, rgba(0,200,180,0) 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Floating nodes */}
      {[
        { x: "20%", y: "25%", delay: 0 },
        { x: "75%", y: "20%", delay: 1.5 },
        { x: "60%", y: "55%", delay: 0.8 },
        { x: "15%", y: "65%", delay: 2.2 },
        { x: "85%", y: "60%", delay: 3 },
        { x: "42%", y: "72%", delay: 1.2 },
      ].map((node, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.4, 1] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: 4, height: 4, left: node.x, top: node.y }}
        />
      ))}

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "50%", background: "linear-gradient(to bottom, transparent, #000)" }}
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "960px" }}>
      <AnimatedBackground />

      {/* Content */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-6"
        style={{ paddingTop: "180px" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
            Beta
          </span>
          <span className="text-white/70 text-xs font-body pr-3">
            AI-Verified Milestone Funding is live on Testnet
          </span>
        </motion.div>

        {/* Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-[-3px] mb-6">
          <BlurText
            text="Fund the Future. Trust the Code."
            delay={100}
            direction="bottom"
          />
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-base text-white/60 font-body font-light leading-relaxed max-w-lg mb-10"
        >
          Founders stake collateral, define milestones, and raise from investors
          who vote with skin in the game. AI verifies evidence on-chain. Capital
          only moves when truth is proven.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <Link to="/create">
            <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
              Launch a Campaign
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/explore">
            <button className="bg-white text-black rounded-full px-6 py-3 font-body font-medium text-sm hover:bg-white/90 transition-colors">
              Explore Projects
            </button>
          </Link>
        </motion.div>

        {/* Partners bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-24 flex flex-col items-center gap-6"
        >
          <span className="text-white/25 text-xs font-body uppercase tracking-[0.2em]">
            Built on
          </span>
          <div className="flex items-center gap-10 md:gap-16 flex-wrap justify-center">
            {partners.map((p) => (
              <span
                key={p}
                className="text-xl md:text-2xl font-heading italic text-white/30 hover:text-white/60 transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
