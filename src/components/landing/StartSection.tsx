import { ArrowUpRight, Coins, Bot, Vote, Unlock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import BlurText from "./BlurText";

const steps = [
  {
    icon: Shield,
    number: "01",
    title: "Founder stakes collateral",
    body: "Before a single investor commits, the founder locks 10% of the funding goal into the smart contract. No collateral, no campaign. This is non-negotiable.",
    tag: "Skin in the game",
    accent: "rgba(99,60,255,0.6)",
    accentBg: "rgba(99,60,255,0.08)",
    accentBorder: "rgba(99,60,255,0.2)",
  },
  {
    icon: Coins,
    number: "02",
    title: "Investors fund the campaign",
    body: "Investors send ETH and receive ERC-20 governance tokens proportional to their stake. All funds are escrowed in the contract — the founder cannot touch them yet.",
    tag: "Escrowed capital",
    accent: "rgba(56,130,255,0.6)",
    accentBg: "rgba(56,130,255,0.08)",
    accentBorder: "rgba(56,130,255,0.2)",
  },
  {
    icon: Bot,
    number: "03",
    title: "AI agents verify evidence",
    body: "When a milestone is reached, AI agents analyze submitted documents, GitHub diffs, and cross-reference claims. A tamper-resistant score is written to the blockchain.",
    tag: "On-chain proof",
    accent: "rgba(0,190,170,0.6)",
    accentBg: "rgba(0,190,170,0.08)",
    accentBorder: "rgba(0,190,170,0.2)",
  },
  {
    icon: Vote,
    number: "04",
    title: "Token holders vote",
    body: "Investors commit hidden probability estimates, then reveal them. Brier scoring rewards honest voters — manipulation is irrational by design, not by rule.",
    tag: "Commit-reveal",
    accent: "rgba(240,160,50,0.6)",
    accentBg: "rgba(240,160,50,0.08)",
    accentBorder: "rgba(240,160,50,0.2)",
  },
  {
    icon: Unlock,
    number: "05",
    title: "Capital flows (or refunds)",
    body: "Vote passes → milestone funds release to the founder. Vote fails → investors claim pro-rata refunds from escrow. The contract enforces every outcome, no exceptions.",
    tag: "Trustless execution",
    accent: "rgba(52,211,153,0.6)",
    accentBg: "rgba(52,211,153,0.08)",
    accentBorder: "rgba(52,211,153,0.2)",
  },
];

export default function StartSection() {
  return (
    <section className="relative px-6 md:px-12 lg:px-24 py-32 overflow-hidden">
      {/* Section separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* ── Header row ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="liquid-glass rounded-full px-3.5 py-1 mb-6 w-fit"
            >
              <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
                The Protocol
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-[0.85] max-w-lg">
              <BlurText text="You build it. Proof verifies it." delay={80} />
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="shrink-0"
          >
            <Link to="/create">
              <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                Start a Campaign
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5 hidden sm:block" />

          <div className="flex flex-col gap-0">
            {steps.map(({ icon: Icon, number, title, body, tag, accent, accentBg, accentBorder }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex gap-6 md:gap-10 group"
                style={{ paddingBottom: i < steps.length - 1 ? "2.5rem" : 0 }}
              >
                {/* ── Left: number + icon ── */}
                <div className="relative flex flex-col items-center shrink-0">
                  {/* Glowing dot on the timeline */}
                  <div
                    className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-white/10 transition-all duration-300 group-hover:border-white/20"
                    style={{ background: "rgba(0,0,0,0.8)" }}
                  >
                    <Icon
                      className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-300"
                      style={{ color: accent }}
                    />
                    {/* Glow behind dot on hover */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `radial-gradient(circle, ${accentBg} 0%, transparent 70%)`, filter: "blur(6px)" }}
                    />
                  </div>
                </div>

                {/* ── Right: content ── */}
                <div
                  className="flex-1 liquid-glass rounded-2xl p-6 md:p-8 border border-white/[0.04] group-hover:border-white/[0.08] transition-all duration-300 mb-1"
                  style={{ background: "rgba(255,255,255,0.015)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Large step number */}
                      <span
                        className="font-heading italic text-5xl md:text-6xl leading-none select-none opacity-20 group-hover:opacity-30 transition-opacity"
                        style={{ color: "#fff" }}
                      >
                        {number}
                      </span>
                      <h3 className="text-white font-body font-semibold text-lg md:text-xl leading-snug max-w-sm">
                        {title}
                      </h3>
                    </div>
                    {/* Tag badge */}
                    <span
                      className="shrink-0 text-[10px] font-body font-medium uppercase tracking-widest px-3 py-1 rounded-full border self-start"
                      style={{ color: accent, background: accentBg, borderColor: accentBorder }}
                    >
                      {tag}
                    </span>
                  </div>
                  <p className="text-white/45 font-body font-light text-sm md:text-base leading-relaxed max-w-2xl">
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
