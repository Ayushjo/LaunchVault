import { Zap, Palette, BarChart3, Shield } from "lucide-react";
import { motion } from "motion/react";
import BlurText from "./BlurText";
import type { LucideIcon } from "lucide-react";

const cards: {
  Icon: LucideIcon;
  title: string;
  body: string;
}[] = [
  {
    Icon: Zap,
    title: "Milestone-Gated Capital",
    body: "Funds only move when milestones are verified. No rubber stamps, no trust required — just cryptographic proof on an immutable ledger.",
  },
  {
    Icon: Palette,
    title: "Multi-Layer AI Verification",
    body: "Document forensics, GitHub analysis, and LLM reasoning combine into one tamper-resistant on-chain verdict you can audit.",
  },
  {
    Icon: BarChart3,
    title: "Game-Theoretic Voting",
    body: "Brier-scored commit-reveal voting makes honest participation the only rational strategy for every investor in the pool.",
  },
  {
    Icon: Shield,
    title: "Founder Collateral at Stake",
    body: "Every founder stakes 10% of their goal from day one. Skin in the game is not optional — it's the protocol.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-16">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-3.5 py-1 mb-6"
        >
          <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
            Why LaunchVault
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-xl">
          <BlurText text="The difference is everything." delay={70} />
        </h2>
      </div>

      {/* 4-column card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {cards.map(({ Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: i * 0.08,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.03] transition-colors"
          >
            <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-body font-medium text-base leading-snug">
              {title}
            </h4>
            <p className="text-white/50 font-body font-light text-sm leading-relaxed">
              {body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
