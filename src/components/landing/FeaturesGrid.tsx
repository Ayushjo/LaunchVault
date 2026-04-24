import { Lock, Bot, BarChart3, Shield, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

const cards: { Icon: LucideIcon; title: string; body: string; accent: string }[] = [
  {
    Icon: Lock,
    title: "Milestone-Gated Capital",
    body: "Funds only move when milestones are verified. No rubber stamps, no trust required — cryptographic proof on an immutable ledger.",
    accent: "from-violet-500/20 to-transparent",
  },
  {
    Icon: Bot,
    title: "Multi-Layer AI Verification",
    body: "OSINT, document forensics, GitHub analysis, and Claude reasoning combine into one tamper-resistant on-chain verdict you can audit.",
    accent: "from-blue-500/20 to-transparent",
  },
  {
    Icon: BarChart3,
    title: "Game-Theoretic Voting",
    body: "Brier-scored commit-reveal voting makes honest participation the only rational strategy. Every investor is accountable.",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    Icon: Shield,
    title: "Founder Collateral at Stake",
    body: "Every founder stakes 10% of their goal from day one. Skin in the game is not optional — it's the protocol.",
    accent: "from-emerald-500/20 to-transparent",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <motion.span
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-body font-medium text-white/50 uppercase tracking-[0.14em] bg-white/3 mb-6"
        >
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          Why LaunchVault
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-lg"
        >
          The difference is everything.
        </motion.h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {cards.map(({ Icon, title, body, accent }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-2xl p-6 flex flex-col gap-4 border border-white/6 bg-white/[0.02] overflow-hidden card-glow"
          >
            {/* Accent corner glow */}
            <div className={`absolute top-0 left-0 w-32 h-32 rounded-br-full bg-gradient-to-br ${accent} pointer-events-none`} />

            <div className="relative">
              <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
              <h4 className="text-white font-body font-semibold text-[14px] leading-snug mb-2">
                {title}
              </h4>
              <p className="text-white/40 font-body font-light text-[13px] leading-relaxed">
                {body}
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <span className="flex items-center gap-1 text-white/20 text-[11px] font-body group-hover:text-white/40 transition-colors">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
