import { motion } from "motion/react";
import BlurText from "./BlurText";

const testimonials = [
  {
    quote:
      "The AI verification flagged document inconsistencies our team would have completely missed. Our LPs now trust the evidence, not just the pitch.",
    name: "Sarah Chen",
    role: "Partner, Apex Capital",
  },
  {
    quote:
      "We closed our seed in 11 days. The commit-reveal voting gave investors genuine confidence — that kind of structural trust doesn't exist anywhere else.",
    name: "Marcus Webb",
    role: "Founder, Arcline",
  },
  {
    quote:
      "LaunchVault redefines what accountability looks like in Web3. The on-chain audit trail is the only funding model I'll back from here on.",
    name: "Elena Voss",
    role: "General Partner, Helix Ventures",
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24">
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
            What They Say
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-xl">
          <BlurText text="Don't take our word for it." delay={70} />
        </h2>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map(({ quote, name, role }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: i * 0.1,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="liquid-glass rounded-2xl p-8 flex flex-col gap-6 hover:bg-white/[0.02] transition-colors"
          >
            {/* Quote mark */}
            <span className="text-4xl font-heading italic text-white/20 leading-none select-none">
              "
            </span>
            <p className="text-white/80 font-body font-light text-sm italic leading-relaxed flex-1">
              {quote}
            </p>
            <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
              <span className="text-white font-body font-medium text-sm">
                {name}
              </span>
              <span className="text-white/50 font-body font-light text-xs">
                {role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
