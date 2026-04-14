import { motion } from "motion/react";
import BlurText from "./BlurText";

const stats = [
  { value: "10%", label: "Founder collateral required", sub: "Skin in the game, always" },
  { value: "3-layer", label: "AI verification depth", sub: "Docs · GitHub · LLM" },
  { value: "4-day", label: "Commit phase window", sub: "Then 3-day reveal phase" },
  { value: "0", label: "Unverified releases", sub: "Protocol-enforced, not trusted" },
];

export default function Stats() {
  return (
    <section className="relative px-6 md:px-12 lg:px-24 py-16 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(56,130,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Separator */}
      <div className="absolute top-0 left-6 right-6 md:left-12 md:right-12 lg:left-24 lg:right-24 h-px bg-white/5" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-16"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
              By Design
            </span>
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass rounded-3xl p-10 md:p-14"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map(({ value, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-1.5 items-center text-center"
              >
                <span className="text-4xl md:text-5xl font-heading italic text-white">
                  {value}
                </span>
                <span className="text-white/60 font-body font-light text-xs leading-snug">
                  {label}
                </span>
                <span className="text-white/25 font-body font-light text-[10px] leading-snug">
                  {sub}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Heading below card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-heading italic text-white tracking-tight leading-[0.9]">
            <BlurText text="Accountability by design, not by trust." delay={70} />
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
