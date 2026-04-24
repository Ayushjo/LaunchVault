import { motion } from "motion/react";

const stats = [
  { value: "10%",     label: "Founder collateral",   sub: "Skin in the game — always" },
  { value: "6-layer", label: "AI verification depth", sub: "OSINT · Docs · GitHub · LLM" },
  { value: "4-day",   label: "Commit phase window",   sub: "Then 3-day cryptographic reveal" },
  { value: "0",       label: "Unverified releases",   sub: "Protocol-enforced, not trusted" },
];

export default function Stats() {
  return (
    <section className="relative px-6 md:px-12 lg:px-24 py-20 overflow-hidden">
      <div className="absolute top-0 left-6 right-6 md:left-12 md:right-12 lg:left-24 lg:right-24 hr-fade" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex justify-center mb-14"
        >
          <span className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-body font-medium text-white/50 uppercase tracking-[0.14em] bg-white/3">
            <span className="w-1 h-1 rounded-full bg-violet-400" />
            By design
          </span>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/6"
        >
          {stats.map(({ value, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col gap-2 items-start p-8 bg-[#080808] hover:bg-white/[0.015] transition-colors"
            >
              <span className="text-4xl md:text-5xl font-heading italic text-white">
                {value}
              </span>
              <span className="text-white/55 font-body text-[13px] leading-snug">{label}</span>
              <span className="text-white/22 font-body text-[11px] leading-snug">{sub}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-16 text-center text-3xl md:text-4xl font-heading italic text-white/80 tracking-tight leading-[1.1]"
        >
          Accountability by design,{" "}
          <span className="text-white/30">not by trust.</span>
        </motion.p>
      </div>
    </section>
  );
}
